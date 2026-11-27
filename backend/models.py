from typing import Literal, Optional
from pydantic import BaseModel, Field


class URLScanRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Suspicious URL to analyze")


class MessageScanRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="Suspicious SMS or email text")


class EvidenceItem(BaseModel):
    id: str
    title: str
    category: str
    severity: Literal["low", "medium", "high"]
    points: int
    detail: str
    matched_text: Optional[str] = None
    source: str = "Local Heuristic Engine"


class AnalysisResult(BaseModel):
    id: Optional[int] = None
    scan_type: Literal["url", "message"]
    submitted_input: str
    risk_score: int = Field(..., ge=0, le=100)
    verdict: Literal["LOW RISK", "SUSPICIOUS", "HIGH RISK"]
    detection_source: str = "Local Heuristic Engine"
    evidence: list[EvidenceItem]
    explanation: str
    recommended_actions: list[str]
    timestamp: str


class StatsResponse(BaseModel):
    total_scans: int
    url_scans: int
    message_scans: int
    high_risk_count: int
    suspicious_count: int
    low_risk_count: int
    average_risk_score: float
