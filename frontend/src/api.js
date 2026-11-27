const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) {
        detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(detail);
  }

  return res.json();
}

export function checkHealth() {
  return request("/health");
}

export function analyzeUrl(url) {
  return request("/analyze/url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function analyzeMessage(message) {
  return request("/analyze/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function fetchHistory(limit = 50, scanType = "") {
  const params = new URLSearchParams({ limit: String(limit) });
  if (scanType) params.set("scan_type", scanType);
  return request(`/history?${params.toString()}`);
}

export function fetchStats() {
  return request("/stats");
}

export function fetchMlMetrics() {
  return request("/ml/metrics");
}
