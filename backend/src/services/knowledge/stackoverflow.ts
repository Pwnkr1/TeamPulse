import { KnowledgeItem } from '../../types';

const BASE = 'https://api.stackexchange.com/2.3/search/advanced';

interface SOItem {
  title: string;
  body: string;
  link: string;
  score: number;
  creation_date: number;
  is_answered: boolean;
  accepted_answer_id?: number;
}

interface SOResponse {
  items: SOItem[];
}

export async function fetchStackOverflow(query: string): Promise<KnowledgeItem[]> {
  try {
    const q = encodeURIComponent(query);
    const url = `${BASE}?order=desc&sort=votes&q=${q}&site=stackoverflow&pagesize=5&filter=withbody&accepted=True`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const data = (await res.json()) as SOResponse;
    if (!data.items?.length) return [];

    return data.items
      .filter((item) => item.body && item.body.length > 100 && item.score > 2)
      .map((item): KnowledgeItem => ({
        source: 'stackoverflow',
        title: item.title,
        body: item.body.replace(/<[^>]+>/g, ' ').slice(0, 1500), // strip HTML
        url: item.link,
        votes: item.score ?? 0,
        createdAt: new Date(item.creation_date * 1000).toISOString(),
        qualityScore: 0,
        relevanceScore: 0,
        communityScore: 0,
        recencyScore: 0,
        claims: [],
      }));
  } catch (err) {
    console.error('[StackOverflow] Fetch failed:', (err as Error).message);
    return [];
  }
}
