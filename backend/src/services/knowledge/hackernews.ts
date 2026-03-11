import { KnowledgeItem } from '../../types';

const BASE = 'https://hn.algolia.com/api/v1/search';

interface HNHit {
  title: string;
  story_text: string | null;
  url: string | null;
  objectID: string;
  points: number;
  created_at: string;
}

interface HNResponse {
  hits: HNHit[];
}

export async function fetchHackerNews(query: string): Promise<KnowledgeItem[]> {
  try {
    const q = encodeURIComponent(query);
    const url = `${BASE}?query=${q}&tags=story&hitsPerPage=5&numericFilters=points>10`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const data = (await res.json()) as HNResponse;
    if (!data.hits?.length) return [];

    return data.hits
      .filter((hit) => hit.story_text && hit.story_text.length > 80)
      .map((hit): KnowledgeItem => ({
        source: 'hackernews',
        title: hit.title,
        body: (hit.story_text ?? '').slice(0, 1500),
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        votes: hit.points ?? 0,
        createdAt: hit.created_at,
        qualityScore: 0,
        relevanceScore: 0,
        communityScore: 0,
        recencyScore: 0,
        claims: [],
      }));
  } catch (err) {
    console.error('[HackerNews] Fetch failed:', (err as Error).message);
    return [];
  }
}
