
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export interface ResearchResult {
  title: string;
  url: string;
  content: string;
  score?: number | null;
}

export async function searchRoadmapResources(
  query: string
): Promise<ResearchResult[]> {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE is not configured.");
  }

  const response = await fetch(`${API_BASE}/api/research/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, max_results: 5 }),
  });

  if (!response.ok) {
    throw new Error(`Research search failed (${response.status}).`);
  }

  const data = await response.json();
  return data.results ?? [];
}
