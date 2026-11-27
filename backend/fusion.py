from typing import Optional

from backend.models import (
    AnalysisResult,
    EvidenceItem,
    MLAnalysisResult,
    SourceStatus,
    ThreatIntelResult,
)
from backend.providers.base import ProviderOutput


def _verdict_from_score(score: int) -> str:
    if score >= 60:
        return "HIGH RISK"
    if score >= 30:
        return "SUSPICIOUS"
    return "LOW RISK"


def _provider_status_label(status: str) -> str:
    if status == "CONFIRMED MALICIOUS":
        return "Confirmed threat"
    if status == "NOT LISTED":
        return "No match found"
    return "Source unavailable"


def fuse_evidence(
    local_result: AnalysisResult,
    provider_outputs: list[ProviderOutput],
    ml_result: Optional[MLAnalysisResult] = None,
    ml_evidence: Optional[list[EvidenceItem]] = None,
) -> AnalysisResult:
    """Combine local heuristics, ML classifier, and external threat-intel without double-counting."""
    external_intel: list[ThreatIntelResult] = [p.intel for p in provider_outputs]
    external_evidence: list[EvidenceItem] = []
    for p in provider_outputs:
        external_evidence.extend(p.evidence)
    ml_ev = ml_evidence or []

    confirmed = [intel for intel in external_intel if intel.status == "CONFIRMED MALICIOUS"]
    unavailable = [intel for intel in external_intel if intel.status == "UNAVAILABLE"]
    not_listed = [intel for intel in external_intel if intel.status == "NOT LISTED"]

    ml_phishing = bool(
        ml_result and ml_result.model_loaded and ml_result.prediction == "phishing"
    )
    ml_score = (ml_result.model_score or 0) if (ml_result and ml_result.model_loaded) else 0

    if confirmed:
        local_bonus = min(10, round(local_result.risk_score * 0.12))
        ml_bonus = 5 if ml_phishing else 0
        combined_score = min(100, 85 + local_bonus + ml_bonus)
    elif ml_phishing:
        # Standalone ML suspicion without corroborating local heuristics or external threat intel
        # is capped below the SUSPICIOUS threshold (30) to prevent false-positive verdicts.
        if local_result.risk_score == 0:
            ml_contrib = min(24, round(ml_score * 0.24))
        else:
            ml_contrib = min(25, round(ml_score * 0.25))
        combined_score = min(100, local_result.risk_score + ml_contrib)
    else:
        combined_score = local_result.risk_score

    verdict = _verdict_from_score(combined_score)

    local_has_flags = len(local_result.evidence) > 0
    sources_checked: list[SourceStatus] = [
        SourceStatus(
            source="Local Heuristic Engine",
            status="SUSPICIOUS INDICATORS" if local_result.risk_score >= 30 else (
                "LOW INDICATORS" if local_has_flags else "NO LOCAL FLAGS"
            ),
            label="Suspicious indicators" if local_has_flags else "No match found",
            detail=(
                f"Local heuristics scored {local_result.risk_score}/100 with "
                f"{len(local_result.evidence)} indicator(s)."
            ),
            verified=False,
        )
    ]

    if ml_result is not None:
        if not ml_result.model_loaded:
            sources_checked.append(
                SourceStatus(
                    source="ML Classifier",
                    status="UNAVAILABLE",
                    label="Source unavailable",
                    detail=ml_result.summary,
                    verified=False,
                )
            )
        elif ml_result.prediction == "phishing":
            sources_checked.append(
                SourceStatus(
                    source=f"ML Classifier ({ml_result.model_name})",
                    status="PHISHING PREDICTED",
                    label="Suspicious indicators",
                    detail=ml_result.summary,
                    verified=False,
                )
            )
        else:
            sources_checked.append(
                SourceStatus(
                    source=f"ML Classifier ({ml_result.model_name})",
                    status="LEGITIMATE PREDICTED",
                    label="No match found",
                    detail=ml_result.summary,
                    verified=False,
                )
            )

    for intel in external_intel:
        sources_checked.append(
            SourceStatus(
                source=intel.provider,
                status=intel.status,
                label=_provider_status_label(intel.status),
                detail=intel.summary,
                verified=intel.verified,
            )
        )

    combined_evidence = [*external_evidence, *ml_ev, *local_result.evidence]

    active_sources = ["Local Heuristic Engine"]
    if ml_result and ml_result.model_loaded:
        active_sources.append(f"ML ({ml_result.model_name})")
    available_external_names = [
        intel.provider for intel in external_intel if intel.status != "UNAVAILABLE"
    ]
    active_sources.extend(dict.fromkeys(available_external_names))
    detection_source = " + ".join(active_sources)

    local_summary = (
        f"Local heuristics assigned {local_result.risk_score}/100 ({local_result.verdict}) "
        f"with {len(local_result.evidence)} indicator(s) detected."
    )

    if confirmed:
        providers_str = ", ".join(dict.fromkeys(c.provider for c in confirmed))
        explanation = (
            f"Combined investigation scored {combined_score}/100 (HIGH RISK). "
            f"External threat intelligence ({providers_str}) confirmed this target as malicious, "
            f"corroborated by {len(local_result.evidence)} local heuristic indicator(s)"
            + (f" and ML ({ml_result.prediction})." if ml_result and ml_result.model_loaded else ".")
        )
        actions = [
            "Do not open, download, or interact with this target.",
            "Block the URL/domain at your firewall, DNS filter, or email gateway if applicable.",
            "If anyone already clicked or entered credentials, reset passwords and revoke sessions immediately.",
        ]
    elif verdict == "HIGH RISK":
        explanation = (
            f"Combined investigation scored {combined_score}/100 (HIGH RISK) based on "
            f"local heuristic indicators"
            + (" and ML phishing classification." if ml_phishing else ".")
            + " No external source confirmed a match, which does not rule out a newly created threat."
        )
        actions = local_result.recommended_actions
    elif verdict == "SUSPICIOUS":
        explanation = (
            f"Combined investigation scored {combined_score}/100 (SUSPICIOUS) based on "
            + ("ML phishing indicators and " if ml_phishing else "")
            + f"{len(local_result.evidence)} local heuristic indicator(s). "
            "Treat the target with caution and verify its origin independently."
        )
        actions = local_result.recommended_actions
    else:
        if ml_phishing and local_result.risk_score == 0:
            explanation = (
                f"Combined investigation scored {combined_score}/100 (LOW RISK). "
                f"The ML classifier flagged structural patterns ({ml_score}/100), but without "
                "corroborating local heuristic or threat-intelligence indicators, standalone ML "
                "does not elevate the verdict to SUSPICIOUS. Absence of confirmed threats does NOT guarantee safety."
            )
        else:
            explanation = (
                f"Combined investigation scored {combined_score}/100 (LOW RISK). "
                "No confirmed threats or major indicators were found; however, "
                "absence of matches does NOT guarantee the target is safe."
            )
        actions = local_result.recommended_actions

    limitations = [
        "The 0–100 combined score is an explainable heuristic, ML, and evidence-fusion score, not a calibrated probability.",
    ]
    if ml_result and not ml_result.model_loaded:
        limitations.append(
            "The ML phishing URL classifier was unavailable for this scan and was excluded from scoring."
        )
    elif ml_result and ml_result.model_loaded:
        limitations.append(
            "ML classification uses URL-only structural/lexical features trained on UCI PhiUSIIL and cannot inspect live webpage content."
        )
    if not_listed:
        limitations.append(
            "A 'No match found' result from external threat intelligence only means the URL was not in that database at scan time; new phishing URLs may not be indexed yet."
        )
    if unavailable:
        limitations.append(
            "One or more external threat-intelligence sources were unavailable during this scan and were excluded from scoring."
        )
    if local_result.scan_type == "message" and not external_intel:
        limitations.append(
            "No external URLs were extracted from this message for external threat-intelligence lookup."
        )

    return AnalysisResult(
        id=local_result.id,
        scan_type=local_result.scan_type,
        submitted_input=local_result.submitted_input,
        risk_score=combined_score,
        verdict=verdict,
        score_type="Heuristic, ML & Evidence Fusion Score (0-100, not a calibrated probability)",
        detection_source=detection_source,
        local_summary=local_summary,
        ml_analysis=ml_result,
        external_intelligence=external_intel,
        sources_checked=sources_checked,
        evidence=combined_evidence,
        explanation=explanation,
        recommended_actions=actions,
        limitations=limitations,
        timestamp=local_result.timestamp,
    )
