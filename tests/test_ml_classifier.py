import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.database import init_db
from backend.database import init_db
from backend.main import (
    analyze_message_endpoint,
    analyze_url_endpoint,
    health_check,
    history_endpoint,
    ml_metrics_endpoint,
    stats_endpoint,
)
from backend.fusion import fuse_evidence
from backend.ml.features import FEATURE_NAMES, extract_url_features
from backend.ml.predictor import is_model_available, predict_url_ml, reset_model_cache
from backend.models import MLAnalysisResult, MessageScanRequest, URLScanRequest
from backend.analyzers import analyze_url


def _step_coro(coro):
    try:
        while True:
            coro.send(None)
    except StopIteration as exc:
        return exc.value


async def _sync_gather(*coros):
    return [_step_coro(c) for c in coros]


def _run(coro):
    with patch("backend.main.asyncio.gather", side_effect=_sync_gather):
        return _step_coro(coro)


class MLClassifierTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self._tmp.close()
        self._orig_db = os.environ.get("DATABASE_URL")
        self._orig_key = os.environ.get("URLHAUS_AUTH_KEY")
        os.environ["DATABASE_URL"] = self._tmp.name
        os.environ["URLHAUS_AUTH_KEY"] = ""
        init_db()
        reset_model_cache()

    def tearDown(self) -> None:
        reset_model_cache()
        if self._orig_db is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = self._orig_db
        if self._orig_key is None:
            os.environ.pop("URLHAUS_AUTH_KEY", None)
        else:
            os.environ["URLHAUS_AUTH_KEY"] = self._orig_key
        if os.path.exists(self._tmp.name):
            os.remove(self._tmp.name)

    def test_feature_extraction_returns_all_16_url_only_features(self):
        feats = extract_url_features("http://192.168.1.10/login%20verify?user=a@b.xyz")
        self.assertEqual(set(feats.keys()), set(FEATURE_NAMES))
        self.assertEqual(feats["has_https"], 0.0)
        self.assertEqual(feats["is_ip_host"], 1.0)
        self.assertEqual(feats["has_at_symbol"], 1.0)
        self.assertGreaterEqual(feats["suspicious_keyword_count"], 2.0)
        self.assertGreaterEqual(feats["encoding_count"], 1.0)
        self.assertGreater(feats["url_entropy"], 0.0)

        legit = extract_url_features("https://www.wikipedia.org/wiki/Cybersecurity")
        self.assertEqual(legit["has_https"], 1.0)
        self.assertEqual(legit["is_ip_host"], 0.0)
        self.assertEqual(legit["suspicious_tld"], 0.0)

    def test_model_unavailable_fallback_does_not_crash(self):
        missing_path = Path("nonexistent_model_12345.joblib")
        self.assertFalse(is_model_available(missing_path))
        ml_res, ev = predict_url_ml("https://example.com", model_path=missing_path)
        self.assertFalse(ml_res.model_loaded)
        self.assertEqual(ml_res.prediction, "unavailable")
        self.assertIsNone(ml_res.model_score)
        self.assertEqual(ev, [])

    def test_trained_model_loads_and_predicts_via_endpoint(self):
        self.assertTrue(
            is_model_available(),
            "Trained model artifact must exist at backend/ml/artifacts/phishing_url_model.joblib",
        )
        health = health_check()
        self.assertEqual(health["providers"]["ml_classifier"], "loaded")

        metrics = ml_metrics_endpoint()
        self.assertTrue(metrics["available"])
        self.assertIn("RandomForestClassifier", metrics["metrics"])
        self.assertIn("LogisticRegression", metrics["metrics"])

        legit_res = _run(analyze_url_endpoint(URLScanRequest(url="https://www.wikipedia.org/")))
        self.assertIsNotNone(legit_res.ml_analysis)
        self.assertTrue(legit_res.ml_analysis.model_loaded)
        self.assertIn(legit_res.ml_analysis.prediction, ("legitimate", "phishing"))
        self.assertIsNotNone(legit_res.ml_analysis.model_score)

        susp_res = _run(
            analyze_url_endpoint(
                URLScanRequest(
                    url="http://paypal-secure-login.account-verify-update.xyz/webscr?session=9921"
                )
            )
        )
        self.assertTrue(susp_res.ml_analysis.model_loaded)
        self.assertIn(susp_res.verdict, ("SUSPICIOUS", "HIGH RISK"))
        self.assertGreaterEqual(susp_res.risk_score, 30)

        # Malformed/minimal URL still handled gracefully
        weird_res = _run(analyze_url_endpoint(URLScanRequest(url="not a valid ::: url")))
        self.assertIsNotNone(weird_res.risk_score)

        # Existing message scanner + SQLite history + stats still work
        msg_res = _run(
            analyze_message_endpoint(
                MessageScanRequest(
                    message="URGENT: Verify your OTP at http://bit.ly/3xVerifyNow"
                )
            )
        )
        self.assertEqual(msg_res.verdict, "HIGH RISK")
        self.assertEqual(len(history_endpoint(limit=20, scan_type=None)), 4)
        self.assertEqual(stats_endpoint().total_scans, 4)

    def test_bare_and_www_legitimate_domains_and_malicious_regression(self):
        legit_urls = [
            "https://google.com",
            "https://www.microsoft.com",
            "https://www.wikipedia.org",
            "https://example.com",
        ]
        for url in legit_urls:
            res = _run(analyze_url_endpoint(URLScanRequest(url=url)))
            self.assertEqual(res.verdict, "LOW RISK", f"Unexpected verdict for {url}: {res}")
            self.assertLess(res.risk_score, 30, f"Unexpected score for {url}: {res.risk_score}")
            self.assertEqual(res.ml_analysis.prediction, "legitimate", f"Unexpected ML for {url}")

        raw_ip_res = _run(
            analyze_url_endpoint(URLScanRequest(url="http://192.168.45.12:8080/signin/verify"))
        )
        self.assertEqual(raw_ip_res.verdict, "HIGH RISK")
        self.assertGreaterEqual(raw_ip_res.risk_score, 60)
        self.assertEqual(raw_ip_res.ml_analysis.prediction, "phishing")

        brand_res = _run(
            analyze_url_endpoint(
                URLScanRequest(
                    url="http://paypal-secure-login.account-verify-update.com/webscr?session=9921"
                )
            )
        )
        self.assertEqual(brand_res.verdict, "HIGH RISK")
        self.assertGreaterEqual(brand_res.risk_score, 60)
        self.assertEqual(brand_res.ml_analysis.prediction, "phishing")

    def test_standalone_ml_suspicion_cannot_force_suspicious_verdict(self):
        local_clean = analyze_url("https://some-new-domain.org")
        self.assertEqual(local_clean.risk_score, 0)
        standalone_ml = MLAnalysisResult(
            model_loaded=True,
            model_name="RandomForestClassifier",
            model_version="1.0.0",
            prediction="phishing",
            model_score=99,
            summary="Flagged by ML only.",
        )
        fused = fuse_evidence(local_clean, [], ml_result=standalone_ml, ml_evidence=[])
        self.assertEqual(fused.verdict, "LOW RISK")
        self.assertLess(fused.risk_score, 30)

    def test_blank_whitespace_inputs_are_rejected(self):
        from pydantic import ValidationError

        with self.assertRaises(ValidationError):
            URLScanRequest(url="   ")
        with self.assertRaises(ValidationError):
            MessageScanRequest(message="   \n\t ")


if __name__ == "__main__":
    unittest.main()
