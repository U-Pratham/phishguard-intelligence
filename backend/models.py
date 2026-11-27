from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class URLScanRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Suspicious URL to analyze")

    @field_validator("url")
    @classmethod
    def url_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("URL must not be empty or whitespace only.")
        return cleaned


class MessageScanRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="Suspicious SMS or email text")

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message must not be empty or whitespace only.")
        return cleaned


class EvidenceItem(BaseModel):
    id: str
    title: str
    category: str
    severity: Literal["low", "medium", "high"]
    points: int
    detail: str
    matched_text: Optional[str] = None
    source: str = "Local Heuristic Engine"
    externally_verified: bool = False


class MLFeatureContribution(BaseModel):
    feature: str
    label: str
    value: float
    importance: float


class MLAnalysisResult(BaseModel):
    model_loaded: bool = False
    model_name: str = "Not Loaded"
    model_version: str = "N/A"
    prediction: Literal["phishing", "legitimate", "unavailable"] = "unavailable"
    model_score: Optional[int] = Field(default=None, ge=0, le=100)
    summary: str = ""
    disclaimer: str = "Model output is not a guaranteed probability of maliciousness."
    top_features: list[MLFeatureContribution] = Field(default_factory=list)


class ThreatIntelResult(BaseModel):
    provider: str
    status: Literal["CONFIRMED MALICIOUS", "NOT LISTED", "UNAVAILABLE"]
    verified: bool = False
    summary: str
    threat_type: Optional[str] = None
    url_status: Optional[str] = None
    date_added: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    reference_url: Optional[str] = None
    checked_target: Optional[str] = None


class SourceStatus(BaseModel):
    source: str
    status: str
    label: str
    detail: str
    verified: bool = False


class AnalysisResult(BaseModel):
    id: Optional[int] = None
    scan_type: Literal["url", "message"]
    submitted_input: str
    risk_score: int = Field(..., ge=0, le=100)
    verdict: Literal["LOW RISK", "SUSPICIOUS", "HIGH RISK"]
    score_type: str = "Heuristic & Evidence Fusion Score (0-100, not a calibrated probability)"
    detection_source: str = "Local Heuristic Engine"
    local_summary: str = ""
    ml_analysis: Optional[MLAnalysisResult] = None
    external_intelligence: list[ThreatIntelResult] = Field(default_factory=list)
    sources_checked: list[SourceStatus] = Field(default_factory=list)
    evidence: list[EvidenceItem]
    explanation: str
    recommended_actions: list[str]
    limitations: list[str] = Field(default_factory=list)
    timestamp: str


class StatsResponse(BaseModel):
    total_scans: int
    url_scans: int
    message_scans: int
    high_risk_count: int
    suspicious_count: int
    low_risk_count: int
    average_risk_score: float
