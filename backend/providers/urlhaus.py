import os
from typing import Optional

import httpx

from backend.models import EvidenceItem, ThreatIntelResult
from backend.providers.base import ProviderOutput, ThreatIntelProvider

URLHAUS_API_URL = "https://urlhaus-api.abuse.ch/v1/url/"


def _normalize_lookup_url(raw_url: str) -> str:
    cleaned = raw_url.strip()
    if "://" not in cleaned:
        return f"http://{cleaned}"
    return cleaned


class URLhausProvider(ThreatIntelProvider):
    """Official abuse.ch URLhaus URL lookup provider."""

    name = "URLhaus (abuse.ch)"

    def __init__(
        self,
        auth_key: Optional[str] = None,
        timeout_seconds: float = 5.0,
        api_url: str = URLHAUS_API_URL,
    ) -> None:
        self._auth_key = auth_key
        self.timeout_seconds = timeout_seconds
        self.api_url = api_url

    def _get_auth_key(self) -> str:
        if self._auth_key is not None:
            return self._auth_key.strip()
        return (os.getenv("URLHAUS_AUTH_KEY") or os.getenv("URLHAUS_API_KEY") or "").strip()

    async def check_url(self, url: str) -> ProviderOutput:
        target = _normalize_lookup_url(url)
        lowered = target.lower()
        if lowered.startswith(("javascript:", "data:", "vbscript:")):
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="Skipped external URLhaus lookup for non-HTTP URI scheme.",
                    checked_target=url.strip(),
                )
            )

        auth_key = self._get_auth_key()
        if not auth_key:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="URLhaus Auth-Key is not configured on the backend. External lookup skipped.",
                    checked_target=target,
                )
            )

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    self.api_url,
                    data={"url": target},
                    headers={"Auth-Key": auth_key},
                )
        except httpx.TimeoutException:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary=f"URLhaus request timed out after {self.timeout_seconds:.1f}s.",
                    checked_target=target,
                )
            )
        except httpx.HTTPError:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="Unable to reach URLhaus API due to a network or connection error.",
                    checked_target=target,
                )
            )

        if response.status_code in (401, 403):
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="URLhaus rejected the configured Auth-Key (HTTP 401/403).",
                    checked_target=target,
                )
            )
        if response.status_code == 429:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="URLhaus rate limit reached (HTTP 429). Try again shortly.",
                    checked_target=target,
                )
            )
        if response.status_code >= 500 or response.status_code != 200:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary=f"URLhaus API returned unexpected HTTP {response.status_code}.",
                    checked_target=target,
                )
            )

        try:
            payload = response.json()
        except ValueError:
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="URLhaus API returned an invalid JSON response.",
                    checked_target=target,
                )
            )

        if not isinstance(payload, dict):
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="UNAVAILABLE",
                    verified=False,
                    summary="URLhaus API returned an unexpected payload format.",
                    checked_target=target,
                )
            )

        query_status = payload.get("query_status")
        if query_status == "ok":
            threat_type = payload.get("threat") or "malware_distribution"
            url_status = payload.get("url_status") or "unknown"
            date_added = payload.get("date_added")
            raw_tags = payload.get("tags")
            tags = [str(t) for t in raw_tags] if isinstance(raw_tags, list) else []
            reference_url = payload.get("urlhaus_reference")

            tag_text = f" Tags: {', '.join(tags)}." if tags else ""
            detail = (
                f"URLhaus confirmed this URL in its threat database "
                f"(threat: {threat_type}, status: {url_status}"
                + (f", added: {date_added}" if date_added else "")
                + f").{tag_text}"
            )

            intel = ThreatIntelResult(
                provider=self.name,
                status="CONFIRMED MALICIOUS",
                verified=True,
                summary=detail,
                threat_type=threat_type,
                url_status=url_status,
                date_added=date_added,
                tags=tags,
                reference_url=reference_url,
                checked_target=target,
            )
            evidence = [
                EvidenceItem(
                    id="intel_urlhaus_confirmed",
                    title="Confirmed Malicious URL in URLhaus",
                    category="External Threat Intelligence",
                    severity="high",
                    points=85,
                    detail=detail,
                    matched_text=threat_type,
                    source=self.name,
                    externally_verified=True,
                )
            ]
            return ProviderOutput(intel=intel, evidence=evidence)

        if query_status == "no_results":
            return ProviderOutput(
                intel=ThreatIntelResult(
                    provider=self.name,
                    status="NOT LISTED",
                    verified=True,
                    summary="No match found in URLhaus. Note: not being listed does not guarantee the URL is safe.",
                    checked_target=target,
                )
            )

        return ProviderOutput(
            intel=ThreatIntelResult(
                provider=self.name,
                status="UNAVAILABLE",
                verified=False,
                summary=f"URLhaus lookup did not complete (query_status: {query_status or 'unknown'}).",
                checked_target=target,
            )
        )
