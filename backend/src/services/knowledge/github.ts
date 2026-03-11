import { KnowledgeItem } from '../../types';

const BASE = 'https://api.github.com/search/issues';
const HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'TeamPulse-Agent/1.0',
};
if (process.env.GITHUB_TOKEN) {
  HEADERS['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

interface GithubIssue {
  title: string;
  body: string | null;
  html_url: string;
  reactions: { total_count: number };
  created_at: string;
}

interface GithubResponse {
  items: GithubIssue[];
}

export async function fetchGithub(query: string): Promise<KnowledgeItem[]> {
  try {
    const q = encodeURIComponent(`${query} is:issue label:engineering OR label:architecture OR label:devops`);
    const url = `${BASE}?q=${q}&sort=reactions&order=desc&per_page=5`;

    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const data = (await res.json()) as GithubResponse;
    if (!data.items?.length) return [];

    return data.items
      .filter((item) => item.body && item.body.length > 100)
      .map((item): KnowledgeItem => ({
        source: 'github',
        title: item.title,
        body: (item.body ?? '').slice(0, 1500),
        url: item.html_url,
        votes: item.reactions?.total_count ?? 0,
        createdAt: item.created_at,
        qualityScore: 0,
        relevanceScore: 0,
        communityScore: 0,
        recencyScore: 0,
        claims: [],
      }));
  } catch (err) {
    console.error('[GitHub] Fetch failed:', (err as Error).message);
    return [];
  }
}
