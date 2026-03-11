import { KnowledgeItem } from '../../types';
import { fetchGithub } from './github';
import { fetchHackerNews } from './hackernews';
import { fetchReddit } from './reddit';
import { fetchStackOverflow } from './stackoverflow';
import { scoreItems, balanceSources } from './scorer';

const CATEGORY_QUERIES: Record<string, string> = {
  code_coupling: 'tightly coupled code refactoring architecture dependency injection software engineering',
  duplication: 'duplicate code shared library DRY principle refactoring engineering team',
  devops: 'CI CD pipeline deployment automation DevOps engineering workflow',
  management: 'sprint priorities engineering team management retrospective alignment',
  communication: 'engineering team communication async blocker escalation psychological safety',
  technical_debt: 'technical debt legacy code refactoring velocity engineering team',
};

export async function aggregateKnowledge(
  description: string,
  category: string
): Promise<{ items: KnowledgeItem[]; sourceBreakdown: Record<string, number> }> {
  const categoryQuery = CATEGORY_QUERIES[category] ?? category;
  // Combine category-specific terms with the actual description (first 120 chars)
  const query = `${categoryQuery} ${description.slice(0, 120)}`;

  console.log(`[Aggregator] Querying: "${query.slice(0, 80)}..."`);

  // Fetch from all 4 sources in parallel (5 items max per source)
  const [github, hn, reddit, so] = await Promise.allSettled([
    fetchGithub(categoryQuery),
    fetchHackerNews(query),
    fetchReddit(query),
    fetchStackOverflow(categoryQuery),
  ]);

  const raw: KnowledgeItem[] = [
    ...(github.status === 'fulfilled' ? github.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(so.status === 'fulfilled' ? so.value : []),
  ];

  console.log(`[Aggregator] Raw items: GitHub=${github.status === 'fulfilled' ? github.value.length : 0}, HN=${hn.status === 'fulfilled' ? hn.value.length : 0}, Reddit=${reddit.status === 'fulfilled' ? reddit.value.length : 0}, SO=${so.status === 'fulfilled' ? so.value.length : 0}`);

  // Score and balance
  const scored = scoreItems(raw, query);
  const balanced = balanceSources(scored);

  // Source breakdown for transparency
  const sourceBreakdown = balanced.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + 1;
    return acc;
  }, {});

  return { items: balanced, sourceBreakdown };
}
