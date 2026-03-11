import { KnowledgeItem } from '../../types';

// ── Relevance: word-overlap TF score ──────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

const STOPWORDS = new Set([
  'this', 'that', 'with', 'have', 'from', 'they', 'will', 'what',
  'when', 'your', 'been', 'were', 'would', 'could', 'should', 'about',
  'more', 'also', 'just', 'into', 'than', 'then', 'some', 'very',
  'after', 'before', 'their', 'there', 'which', 'these', 'those',
]);

function relevanceScore(query: string, item: KnowledgeItem): number {
  const queryTokens = new Set(tokenize(query).filter((t) => !STOPWORDS.has(t)));
  const itemTokens = tokenize(`${item.title} ${item.body}`).filter((t) => !STOPWORDS.has(t));

  if (queryTokens.size === 0) return 0;

  let matches = 0;
  for (const token of itemTokens) {
    if (queryTokens.has(token)) matches++;
  }

  const uniqueMatches = new Set(itemTokens.filter((t) => queryTokens.has(t))).size;
  const coverage = uniqueMatches / queryTokens.size;
  const density = Math.min(matches / (itemTokens.length || 1), 1);

  return Math.min(coverage * 0.6 + density * 0.4, 1);
}

// ── Community: normalize votes by source ──────────────────────────────────
const MAX_VOTES: Record<string, number> = {
  github: 500,
  hackernews: 1000,
  reddit: 5000,
  stackoverflow: 300,
};

function communityScore(item: KnowledgeItem): number {
  const max = MAX_VOTES[item.source] ?? 500;
  return Math.min(item.votes / max, 1);
}

// ── Recency: decay over 3 years ────────────────────────────────────────────
function recencyScore(item: KnowledgeItem): number {
  const ageMs = Date.now() - new Date(item.createdAt).getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365);
  if (ageYears <= 0.5) return 1.0;
  if (ageYears <= 1) return 0.85;
  if (ageYears <= 2) return 0.65;
  if (ageYears <= 3) return 0.45;
  return 0.25;
}

// ── Claim extraction ───────────────────────────────────────────────────────
export function extractClaims(text: string, maxClaims = 3): string[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 8 && s.split(' ').length <= 60);

  // Prefer sentences with actionable or specific language
  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    let score = 0;
    if (/we (switched|refactored|introduced|moved|implemented|found)/.test(lower)) score += 3;
    if (/the (solution|fix|approach|pattern) (was|is|worked)/.test(lower)) score += 2;
    if (/instead of|rather than|instead we/.test(lower)) score += 2;
    if (/\d+(%|x|times|days|hours|weeks)/.test(lower)) score += 2; // has metrics
    if (/coupling|interface|module|service|contract|boundary/.test(lower)) score += 1;
    return { s, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxClaims)
    .map((x) => x.s);
}

// ── Main scorer ────────────────────────────────────────────────────────────
export function scoreItems(items: KnowledgeItem[], query: string): KnowledgeItem[] {
  return items.map((item) => {
    const rel = relevanceScore(query, item);
    const com = communityScore(item);
    const rec = recencyScore(item);
    const quality = rel * 0.45 + com * 0.30 + rec * 0.25;

    return {
      ...item,
      relevanceScore: parseFloat(rel.toFixed(3)),
      communityScore: parseFloat(com.toFixed(3)),
      recencyScore: parseFloat(rec.toFixed(3)),
      qualityScore: parseFloat(quality.toFixed(3)),
      claims: extractClaims(`${item.title}. ${item.body}`),
    };
  });
}

// ── Source balancing: no source > 40% of final pool ───────────────────────
export function balanceSources(items: KnowledgeItem[], minScore = 0.15): KnowledgeItem[] {
  const passing = items
    .filter((i) => i.qualityScore >= minScore)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  if (passing.length === 0) return items.slice(0, 4); // fallback

  const MAX_SHARE = 0.40;
  const result: KnowledgeItem[] = [];
  const sourceCounts: Record<string, number> = {};

  for (const item of passing) {
    const currentShare = (sourceCounts[item.source] ?? 0) / Math.max(result.length, 1);
    if (result.length >= 12) break;
    if (result.length > 3 && currentShare >= MAX_SHARE) continue;
    result.push(item);
    sourceCounts[item.source] = (sourceCounts[item.source] ?? 0) + 1;
  }

  return result;
}

// ── Question count based on quality ───────────────────────────────────────
export function calcQuestionCount(items: KnowledgeItem[]): number {
  const high = items.filter((i) => i.qualityScore >= 0.50).length;
  const mid = items.filter((i) => i.qualityScore >= 0.25 && i.qualityScore < 0.50).length;
  const count = high + Math.floor(mid / 2);
  return Math.max(2, Math.min(count, 6));
}
