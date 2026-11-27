from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from backend.models import EvidenceItem, ThreatIntelResult


@dataclass
class ProviderOutput:
    intel: ThreatIntelResult
    evidence: list[EvidenceItem] = field(default_factory=list)


class ThreatIntelProvider(ABC):
    """Base interface for external threat-intelligence providers."""

    name: str = "Unknown Provider"

    @abstractmethod
    async def check_url(self, url: str) -> ProviderOutput:
        """Query the external provider for a URL without downloading or executing it."""
        raise NotImplementedError
