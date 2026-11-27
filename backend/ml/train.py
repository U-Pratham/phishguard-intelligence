import argparse
import io
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import httpx
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from backend.ml.features import FEATURE_LABELS, FEATURE_NAMES, extract_url_features, features_to_vector

UCI_PHIUSIIL_ZIP_URL = (
    "https://archive.ics.uci.edu/static/public/967/phiusiil+phishing+url+dataset.zip"
)
MODEL_VERSION = "1.0.0"

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "phishing_url_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"


def download_phiusiil_zip(zip_path: Path, force: bool = False) -> Path:
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    if zip_path.exists() and not force:
        print(f"Using cached dataset archive: {zip_path}")
        return zip_path

    print(f"Downloading UCI PhiUSIIL dataset from {UCI_PHIUSIIL_ZIP_URL} ...")
    with httpx.Client(timeout=120.0, follow_redirects=True) as client:
        response = client.get(UCI_PHIUSIIL_ZIP_URL)
        response.raise_for_status()
        zip_path.write_bytes(response.content)
    print(f"Saved dataset archive ({zip_path.stat().st_size / (1024 * 1024):.2f} MB)")
    return zip_path


def load_url_and_label_dataframe(zip_path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(zip_path, "r") as zf:
        csv_names = [name for name in zf.namelist() if name.lower().endswith(".csv")]
        if not csv_names:
            raise RuntimeError("No CSV file found inside the PhiUSIIL zip archive.")
        target_csv = csv_names[0]
        print(f"Reading URL and label columns from {target_csv} ...")
        with zf.open(target_csv) as f:
            df = pd.read_csv(io.BytesIO(f.read()), usecols=["URL", "label"])
    return df


def verify_and_map_labels(df: pd.DataFrame) -> tuple[pd.Series, dict]:
    """
    Empirically verify PhiUSIIL label mapping before training.
    In UCI PhiUSIIL, label=1 is legitimate (~134,850 rows) and label=0 is phishing (~100,945 rows).
    We verify this using well-known legitimate domains in the dataset, then map to:
      target = 1 -> phishing
      target = 0 -> legitimate
    """
    counts = df["label"].value_counts().to_dict()
    well_known_legit = df[
        df["URL"].str.contains(
            r"^https?://(?:www\.)?(?:google\.com|wikipedia\.org|github\.com|microsoft\.com)/?$",
            case=False,
            na=False,
            regex=True,
        )
    ]

    legit_raw_label = 1
    if not well_known_legit.empty:
        legit_raw_label = int(well_known_legit["label"].mode().iloc[0])
    elif counts.get(0, 0) > counts.get(1, 0):
        legit_raw_label = 0

    phishing_raw_label = 0 if legit_raw_label == 1 else 1
    y = (df["label"] == phishing_raw_label).astype(int)

    mapping_info = {
        "raw_dataset_counts": {str(k): int(v) for k, v in counts.items()},
        "raw_legitimate_label": legit_raw_label,
        "raw_phishing_label": phishing_raw_label,
        "model_target_mapping": {"0": "legitimate", "1": "phishing"},
    }
    print("Verified label mapping:", json.dumps(mapping_info))
    return y, mapping_info


def evaluate_model(model, X_test, y_test) -> dict:
    preds = model.predict(X_test)
    cm = confusion_matrix(y_test, preds, labels=[0, 1])
    return {
        "accuracy": round(float(accuracy_score(y_test, preds)), 4),
        "precision": round(float(precision_score(y_test, preds, pos_label=1, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, preds, pos_label=1, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, preds, pos_label=1, zero_division=0)), 4),
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_labels": ["legitimate (0)", "phishing (1)"],
        "test_samples": int(len(y_test)),
    }


def train(max_rows: int = 0, force_download: bool = False) -> dict:
    zip_path = download_phiusiil_zip(DATA_DIR / "phiusiil_dataset.zip", force=force_download)
    df = load_url_and_label_dataframe(zip_path)
    raw_rows = int(len(df))

    df = df.dropna(subset=["URL", "label"]).copy()
    df["URL"] = df["URL"].astype(str).str.strip()
    df = df[df["URL"].str.len() > 0]
    df = df.drop_duplicates(subset=["URL"], keep="first").reset_index(drop=True)
    dedup_rows = int(len(df))

    if max_rows and max_rows < len(df):
        df, _ = train_test_split(
            df, train_size=max_rows, stratify=df["label"], random_state=42
        )
        df = df.reset_index(drop=True)

    y, mapping_info = verify_and_map_labels(df)

    print(f"Extracting {len(FEATURE_NAMES)} URL-only features for {len(df)} URLs...")
    feature_matrix = [features_to_vector(extract_url_features(u)) for u in df["URL"]]
    X = pd.DataFrame(feature_matrix, columns=FEATURE_NAMES)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("Training Logistic Regression...")
    lr_pipeline = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "clf",
                LogisticRegression(
                    max_iter=1000, random_state=42, class_weight="balanced"
                ),
            ),
        ]
    )
    lr_pipeline.fit(X_train, y_train)
    lr_metrics = evaluate_model(lr_pipeline, X_test, y_test)
    print("Logistic Regression test metrics:", lr_metrics)

    print("Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=18,
        min_samples_leaf=2,
        n_jobs=-1,
        random_state=42,
        class_weight="balanced_subsample",
    )
    rf_model.fit(X_train, y_train)
    rf_metrics = evaluate_model(rf_model, X_test, y_test)
    print("Random Forest test metrics:", rf_metrics)

    if rf_metrics["f1_score"] >= lr_metrics["f1_score"]:
        best_name = "RandomForestClassifier"
        best_model = rf_model
    else:
        best_name = "LogisticRegression"
        best_model = lr_pipeline

    rf_importances = {
        name: round(float(imp), 4)
        for name, imp in sorted(
            zip(FEATURE_NAMES, rf_model.feature_importances_),
            key=lambda x: x[1],
            reverse=True,
        )
    }

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": best_model,
        "model_name": best_name,
        "model_version": MODEL_VERSION,
        "feature_names": FEATURE_NAMES,
        "feature_labels": FEATURE_LABELS,
        "rf_feature_importances": rf_importances,
    }
    joblib.dump(bundle, MODEL_PATH, compress=3)

    metadata = {
        "dataset": {
            "name": "UCI PhiUSIIL Phishing URL Dataset",
            "source_url": UCI_PHIUSIIL_ZIP_URL,
            "raw_rows": raw_rows,
            "deduplicated_rows": dedup_rows,
            "used_rows": int(len(df)),
            "train_rows": int(len(X_train)),
            "test_rows": int(len(X_test)),
            "url_only_features_used": True,
            **mapping_info,
        },
        "features": FEATURE_NAMES,
        "feature_labels": FEATURE_LABELS,
        "selected_model": best_name,
        "model_version": MODEL_VERSION,
        "random_seed": 42,
        "metrics": {
            "RandomForestClassifier": rf_metrics,
            "LogisticRegression": lr_metrics,
        },
        "top_feature_importances": rf_importances,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Saved model bundle to {MODEL_PATH}")
    print(f"Saved metadata to {METADATA_PATH}")
    return metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PhishGuard URL ML classifier")
    parser.add_argument(
        "--max-rows",
        type=int,
        default=0,
        help="Optional cap on rows (0 = use full deduplicated dataset)",
    )
    parser.add_argument(
        "--force-download",
        action="store_true",
        help="Re-download dataset zip even if cached",
    )
    args = parser.parse_args()
    train(max_rows=args.max_rows, force_download=args.force_download)
