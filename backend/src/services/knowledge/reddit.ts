import { KnowledgeItem } from '../../types';

const SUBREDDITS = 'programming+devops+softwareengineering+ExperiencedDevs+cscareerquestions';
const BASE = `https://www.reddit.com/r/${SUBREDDITS}/search.json`;

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  score: number;
  created_utc: number;
  num_comments: number;
}

interface RedditResponse {
  data: {
    children: Array<{ data: RedditPost }>;
  };
}

export async function fetchReddit(query: string): Promise<KnowledgeItem[]> {
  try {
    const q = encodeURIComponent(query);
    const url = `${BASE}?q=${q}&sort=relevance&limit=5&restrict_sr=true&t=year`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'TeamPulse-Agent/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as RedditResponse;
    const posts = data?.data?.children ?? [];

    return posts
      .map((c) => c.data)
      .filter((p) => p.selftext && p.selftext.length > 100 && p.selftext !== '[deleted]')
      .map((p): KnowledgeItem => ({
        source: 'reddit',
        title: p.title,
        body: p.selftext.slice(0, 1500),
        url: p.url,
        votes: p.score ?? 0,
        createdAt: new Date(p.created_utc * 1000).toISOString(),
        qualityScore: 0,
        relevanceScore: 0,
        communityScore: 0,
        recencyScore: 0,
        claims: [],
      }));
  } catch (err) {
    console.error('[Reddit] Fetch failed:', (err as Error).message);
    return [];
  }
}
