import asyncio
import os
import tempfile
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

import httpx

from backend.database import init_db
from backend.main import (
    analyze_message_endpoint,
    analyze_url_endpoint,
    health_check,
    history_endpoint,
    stats_endpoint,
)
from backend.models import MLAnalysisResult, MessageScanRequest, URLScanRequest
from backend.providers.urlhaus import URLhausProvider


def _step_coro(coro):
    """Drive an async coroutine to completion without creating an OS event-loop pipe."""
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


def _mock_async_client(response=None, side_effect=None):
    client = MagicMock()
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=False)
    if side_effect is not None:
        client.post = AsyncMock(side_effect=side_effect)
    else:
        client.post = AsyncMock(return_value=response)
    return client


class ThreatIntelAndFusionTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self._tmp.close()
        self._orig_db = os.environ.get("DATABASE_URL")
        self._orig_key = os.environ.get("URLHAUS_AUTH_KEY")
        os.environ["DATABASE_URL"] = self._tmp.name
        os.environ["URLHAUS_AUTH_KEY"] = ""
        init_db()

    def tearDown(self) -> None:
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

    def test_missing_api_key_returns_unavailable_and_does_not_crash(self):
        os.environ["URLHAUS_AUTH_KEY"] = ""
        health = health_check()
        self.assertEqual(health["providers"]["urlhaus"], "missing_key")

        ml_unavail = (MLAnalysisResult(model_loaded=False, prediction="unavailable"), [])
        with patch("backend.main.predict_url_ml", return_value=ml_unavail):
            result = _run(
                analyze_url_endpoint(URLScanRequest(url="https://example.com"))
            )
        self.assertEqual(result.risk_score, 0)
        self.assertEqual(result.verdict, "LOW RISK")
        self.assertEqual(result.external_intelligence[0].status, "UNAVAILABLE")
        urlhaus_src = next(s for s in result.sources_checked if s.source == "URLhaus (abuse.ch)")
        self.assertEqual(urlhaus_src.label, "Source unavailable")
        self.assertTrue(any("unavailable" in lim.lower() for lim in result.limitations))

    def test_confirmed_malicious_urlhaus_response_with_api_key(self):
        os.environ["URLHAUS_AUTH_KEY"] = "test-secret-key"
        health = health_check()
        self.assertEqual(health["providers"]["urlhaus"], "configured")

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "query_status": "ok",
            "url_status": "online",
            "threat": "malware_download",
            "date_added": "2026-11-20 10:15:00 UTC",
            "tags": ["exe", "emotet"],
            "urlhaus_reference": "https://urlhaus.abuse.ch/url/999999/",
        }

        with patch(
            "backend.providers.urlhaus.httpx.AsyncClient",
            return_value=_mock_async_client(response=mock_resp),
        ):
            result = _run(
                analyze_url_endpoint(
                    URLScanRequest(url="https://clean-looking-domain.example/payload")
                )
            )

        self.assertEqual(result.verdict, "HIGH RISK")
        self.assertGreaterEqual(result.risk_score, 85)
        self.assertLessEqual(result.risk_score, 100)
        intel = result.external_intelligence[0]
        self.assertEqual(intel.status, "CONFIRMED MALICIOUS")
        self.assertTrue(intel.verified)
        self.assertEqual(intel.threat_type, "malware_download")
        self.assertEqual(intel.url_status, "online")
        self.assertEqual(intel.tags, ["exe", "emotet"])
        urlhaus_src = next(s for s in result.sources_checked if s.source == "URLhaus (abuse.ch)")
        self.assertEqual(urlhaus_src.label, "Confirmed threat")
        self.assertTrue(any(e.externally_verified for e in result.evidence))

    def test_no_match_urlhaus_response_never_claims_safe(self):
        os.environ["URLHAUS_AUTH_KEY"] = "test-secret-key"
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"query_status": "no_results"}

        ml_unavail = (MLAnalysisResult(model_loaded=False, prediction="unavailable"), [])
        with patch(
            "backend.providers.urlhaus.httpx.AsyncClient",
            return_value=_mock_async_client(response=mock_resp),
        ), patch("backend.main.predict_url_ml", return_value=ml_unavail):
            result = _run(
                analyze_url_endpoint(URLScanRequest(url="https://example.com"))
            )

        self.assertEqual(result.risk_score, 0)
        self.assertEqual(result.verdict, "LOW RISK")
        intel = result.external_intelligence[0]
        self.assertEqual(intel.status, "NOT LISTED")
        urlhaus_src = next(s for s in result.sources_checked if s.source == "URLhaus (abuse.ch)")
        self.assertEqual(urlhaus_src.label, "No match found")
        self.assertIn("does NOT guarantee", result.explanation)

    def test_timeout_and_http_errors_handled_gracefully(self):
        provider = URLhausProvider(auth_key="test-key", timeout_seconds=1.0)

        with patch(
            "backend.providers.urlhaus.httpx.AsyncClient",
            return_value=_mock_async_client(side_effect=httpx.TimeoutException("timed out")),
        ):
            out = _run(provider.check_url("https://example.com"))
            self.assertEqual(out.intel.status, "UNAVAILABLE")
            self.assertIn("timed out", out.intel.summary.lower())

        mock_500 = MagicMock()
        mock_500.status_code = 503
        with patch(
            "backend.providers.urlhaus.httpx.AsyncClient",
            return_value=_mock_async_client(response=mock_500),
        ):
            out = _run(provider.check_url("https://example.com"))
            self.assertEqual(out.intel.status, "UNAVAILABLE")
            self.assertIn("503", out.intel.summary)

    def test_message_scan_history_and_stats_work_together(self):
        os.environ["URLHAUS_AUTH_KEY"] = ""
        msg = _run(
            analyze_message_endpoint(
                MessageScanRequest(
                    message="URGENT: Your account will be suspended. Verify OTP at http://bit.ly/3xVerify"
                )
            )
        )
        self.assertEqual(msg.verdict, "HIGH RISK")
        self.assertGreaterEqual(msg.risk_score, 60)
        self.assertEqual(len(msg.external_intelligence), 1)
        self.assertEqual(msg.external_intelligence[0].status, "UNAVAILABLE")

        hist = history_endpoint(limit=10, scan_type=None)
        self.assertEqual(len(hist), 1)
        self.assertEqual(hist[0].id, msg.id)
        self.assertEqual(len(hist[0].sources_checked), 2)

        stats = stats_endpoint()
        self.assertEqual(stats.total_scans, 1)
        self.assertEqual(stats.message_scans, 1)
        self.assertEqual(stats.high_risk_count, 1)


if __name__ == "__main__":
    unittest.main()
