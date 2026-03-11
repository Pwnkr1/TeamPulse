import OpenAI from 'openai';
import { KnowledgeItem, ClassificationResult } from '../../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_CATEGORIES = [
  'code_coupling', 'duplication', 'devops',
  'management', 'communication', 'technical_debt',
];

export async function classifyProblem(
  description: string,
  knowledgeItems: KnowledgeItem[]
): Promise<ClassificationResult> {
  const claimsContext = knowledgeItems
    .slice(0, 6)
    .map((item, i) => `[${i + 1}] (${item.source}) ${item.claims.slice(0, 2).join(' ')}`)
    .join('\n');

  const prompt = `You are a software engineering problem classifier.

PROBLEM DESCRIPTION:
"${description}"

RELEVANT CONTEXT from GitHub, HackerNews, Reddit, and StackOverflow:
${claimsContext || 'No external context available.'}

Classify this problem into exactly ONE category from this list:
- code_coupling: tightly coupled modules, cascading changes, dependency issues
- duplication: repeated work, reinventing existing solutions, DRY violations
- devops: CI/CD, deployment, infrastructure, pipeline issues
- management: unclear priorities, process issues, retrospective dysfunction
- communication: team alignment, escalation, async communication failures
- technical_debt: legacy code, slow velocity, maintenance burden

Respond with ONLY valid JSON in this exact format:
{
  "category": "<one of the categories above>",
  "confidence": <number 0.0 to 1.0>,
  "summary": "<one sentence explaining why this category fits, based only on the description above>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content) as ClassificationResult;

    if (!VALID_CATEGORIES.includes(parsed.category)) {
      parsed.category = 'code_coupling'; // safe default
    }
    parsed.confidence = Math.min(Math.max(parsed.confidence ?? 0.7, 0), 1);
    parsed.summary = parsed.summary ?? 'Problem classified based on description.';

    return parsed;
  } catch (err) {
    console.error('[Classifier] OpenAI error:', (err as Error).message);
    return { category: 'code_coupling', confidence: 0.5, summary: 'Classification unavailable.' };
  }
}
