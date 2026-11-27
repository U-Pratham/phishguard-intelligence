import json
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from backend.ml.features import FEATURE_LABELS, FEATURE_NAMES, extract_url_features, features_to_vector
from backend.models import EvidenceItem, MLAnalysisResult, MLFeatureContribution

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
DEFAULT_MODEL_PATH = ARTIFACTS_DIR / "phishing_url_model.joblib"
DEFAULT_METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"

_CACHE: dict = {"loaded_path": None, "bundle": None, "metadata": None}


def reset_model_cache() -> None:
    _CACHE["loaded_path"] = None
    _CACHE["bundle"] = None
    _CACHE["metadata"] = None


def load_model_metadata(metadata_path: Path = DEFAULT_METADATA_PATH) -> Optional[dict]:
    if not metadata_path.exists():
        return None
    try:
        return json.loads(metadata_path.read_text(encoding="utf-8"))
    except Exception:
        return None


def _get_bundle(model_path: Path = DEFAULT_MODEL_PATH):
    path_str = str(model_path)
    if _CACHE["loaded_path"] == path_str and _CACHE["bundle"] is not None:
        return _CACHE["bundle"]
    if not model_path.exists():
        return None
    try:
        bundle = joblib.load(model_path)
        if not isinstance(bundle, dict) or "model" not in bundle:
            return None
        _CACHE["loaded_path"] = path_str
        _CACHE["bundle"] = bundle
        return bundle
    except Exception:
        return None


def is_model_available(model_path: Path = DEFAULT_MODEL_PATH) -> bool:
    return _get_bundle(model_path) is not None


def predict_url_ml(
    raw_url: str,
    model_path: Path = DEFAULT_MODEL_PATH,
    metadata_path: Path = DEFAULT_METADATA_PATH,
) -> tuple[MLAnalysisResult, list[EvidenceItem]]:
    """Run ML inference on a URL using the saved model, with graceful unavailable fallback."""
    bundle = _get_bundle(model_path)
    if bundle is None:
        return (
            MLAnalysisResult(
                model_loaded=False,
                model_name="Not Loaded",
                model_version="N/A",
                prediction="unavailable",
                model_score=None,
                summary="ML phishing URL model is unavailable or not trained yet. Falling back to heuristics and threat intel.",
                disclaimer="Model output is unavailable.",
                top_features=[],
            ),
            [],
        )

    model = bundle["model"]
    model_name = bundle.get("model_name", "Scikit-learn Classifier")
    model_version = bundle.get("model_version", "1.0.0")
    feature_names = bundle.get("feature_names", FEATURE_NAMES)
    feature_labels = bundle.get("feature_labels", FEATURE_LABELS)
    importances = bundle.get("rf_feature_importances", {})

    feat_dict = extract_url_features(raw_url)
    X_row = pd.DataFrame([features_to_vector(feat_dict)], columns=feature_names)

    pred_int = int(model.predict(X_row)[0])
    prediction = "phishing" if pred_int == 1 else "legitimate"

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X_row)[0]
        phishing_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
        model_score = int(round(phishing_prob * 100))
    else:
        model_score = 100 if pred_int == 1 else 0

    # Rank top contributing URL features by global importance + active presence
    ranked_features: list[tuple[str, float, float]] = []
    for name in feature_names:
        val = float(feat_dict.get(name, 0.0))
        imp = float(importances.get(name, 0.05))
        ranked_features.append((name, val, imp))

    ranked_features.sort(key=lambda item: item[2], reverse=True)
    top_features = [
        MLFeatureContribution(
            feature=name,
            label=feature_labels.get(name, name),
            value=round(val, 3),
            importance=round(imp, 4),
        )
        for name, val, imp in ranked_features[:6]
    ]

    summary = (
        f"{model_name} (v{model_version}) classified this URL as '{prediction.upper()}' "
        f"with a model score of {model_score}/100 based on URL structural and lexical features."
    )

    ml_result = MLAnalysisResult(
        model_loaded=True,
        model_name=model_name,
        model_version=model_version,
        prediction=prediction,
        model_score=model_score,
        summary=summary,
        disclaimer="Model score reflects pattern similarity to the UCI PhiUSIIL training dataset and is NOT a guaranteed probability of maliciousness.",
        top_features=top_features,
    )

    evidence: list[EvidenceItem] = []
    if prediction == "phishing":
        severity = "high" if model_score >= 75 else "medium"
        points = 35 if model_score >= 75 else 22
        top_names = ", ".join(f"{f.label}={f.value}" for f in top_features[:3])
        evidence.append(
            EvidenceItem(
                id="ml_url_phishing_prediction",
                title=f"ML Classifier Flagged URL as Phishing ({model_score}/100)",
                category="Machine Learning",
                severity=severity,
                points=points,
                detail=f"{summary} Key features: {top_names}.",
                matched_text=f"ML score {model_score}/100",
                source=f"ML Classifier ({model_name} v{model_version})",
                externally_verified=False,
            )
        )

    return ml_result, evidence
