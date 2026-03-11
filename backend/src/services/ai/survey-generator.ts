import OpenAI from 'openai';
import { KnowledgeItem, GeneratedQuestion } from '../../types';
import { calcQuestionCount } from '../knowledge/scorer';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Verify every question overlaps with source claims ────────────────────
function verifyGrounding(question: GeneratedQuestion, allClaims: string[]): boolean {
  const qWords = new Set(
    question.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4)
  );
  const claimText = allClaims.join(' ').toLowerCase();
  let overlap = 0;
  for (const word of qWords) {
    if (claimText.includes(word)) overlap++;
  }
  // At least 30% of meaningful words must appear in claims
  return overlap / Math.max(qWords.size, 1) >= 0.30;
}

export async function generateSurvey(
  description: string,
  category: string,
  knowledgeItems: KnowledgeItem[]
): Promise<GeneratedQuestion[]> {
  const questionCount = calcQuestionCount(knowledgeItems);

  // Build grounded claims context — each claim labeled with its source and URL
  const claimsBlock = knowledgeItems
    .slice(0, 8)
    .flatMap((item) =>
      item.claims.map(
        (claim) => `• [${item.source.toUpperCase()}] (${item.url}) "${claim}"`
      )
    )
    .slice(0, 20)
    .join('\n');

  const allClaims = knowledgeItems.flatMap((i) => i.claims);

  const prompt = `You are a survey designer for a software engineering retrospective tool.

Your ONLY job is to write questions that help a developer reflect on their own mindset and approach to the problem they submitted. You are NOT writing a quiz. You are NOT asking for factual answers.

DEVELOPER'S PROBLEM:
"${description}"

CATEGORY: ${category.replace(/_/g, ' ')}

EVIDENCE CLAIMS — extracted from real developer discussions on GitHub, HackerNews, Reddit, and StackOverflow:
${claimsBlock}

STRICT RULES — you MUST follow all of these:
1. Write EXACTLY ${questionCount} questions
2. Every question MUST probe a concept, approach, or pattern explicitly mentioned in the evidence claims above
3. Do NOT invent company names, statistics, or solutions not present in the claims
4. Each question must have EXACTLY 4 answer options that reflect a spectrum from avoidance → awareness → action → mastery
5. The insight_label must name the specific mindset pattern being probed (e.g. "Reveals escalation vs avoidance pattern")
6. source_ref must be the URL from the claim that grounded this question

Return ONLY valid JSON as an array of ${questionCount} objects in this format:
[
  {
    "text": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "insight_label": "what this reveals about the developer's mindset",
    "source_ref": "https://url-of-the-claim-used"
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{"questions":[]}';
    let parsed: Array<{
      text: string;
      options: string[];
      insight_label: string;
      source_ref: string;
    }> = [];

    try {
      const obj = JSON.parse(content);
      parsed = Array.isArray(obj) ? obj : (obj.questions ?? obj.survey ?? []);
    } catch {
      console.error('[SurveyGen] JSON parse failed');
      return getFallbackQuestions(category, questionCount);
    }

    // Post-generation grounding verification
    const grounded = parsed.filter((q) =>
      verifyGrounding(
        { text: q.text, options: q.options ?? [], insightLabel: q.insight_label, sourceRef: q.source_ref, orderIndex: 0 },
        allClaims
      )
    );

    console.log(`[SurveyGen] ${parsed.length} generated, ${grounded.length} passed grounding check`);

    const questions: GeneratedQuestion[] = grounded.map((q, i) => ({
      text: q.text,
      options: (q.options ?? []).slice(0, 4),
      insightLabel: q.insight_label ?? 'Reveals developer mindset',
      sourceRef: q.source_ref ?? '',
      orderIndex: i,
    }));

    // Ensure minimum 2 questions — pad with fallback if grounding rejected too many
    if (questions.length < 2) {
      return getFallbackQuestions(category, Math.max(2, questionCount - questions.length));
    }

    return questions;
  } catch (err) {
    console.error('[SurveyGen] OpenAI error:', (err as Error).message);
    return getFallbackQuestions(category, questionCount);
  }
}

// ── Fallback questions per category (never hallucinated — static) ─────────
const FALLBACKS: Record<string, GeneratedQuestion[]> = {
  code_coupling: [
    {
      text: 'When you discover that changing one module breaks unrelated parts of the system, what is your immediate response?',
      options: [
        'Fix all broken parts immediately before moving on',
        'Document the dependency map first, then fix systematically',
        'Patch the urgent breakages and create a refactor ticket',
        'Feel overwhelmed and escalate to the team lead',
      ],
      insightLabel: 'Reveals systemic thinking vs reactive patching pattern',
      sourceRef: '',
      orderIndex: 0,
    },
    {
      text: 'How often do you define clear module boundaries before writing implementation code?',
      options: [
        'Always — I design interfaces before any implementation',
        'Often — when the feature feels architecturally significant',
        'Sometimes — when I remember to',
        'Rarely — I focus on making things work first',
      ],
      insightLabel: 'Reveals design-first vs implementation-first mindset',
      sourceRef: '',
      orderIndex: 1,
    },
  ],
  devops: [
    {
      text: 'When a CI/CD pipeline fails on your pull request, what is your first action?',
      options: [
        'Read the error logs immediately and trace the root cause',
        'Check if it is a known flaky test before investigating',
        'Ask a DevOps engineer to look at it',
        'Re-run the pipeline hoping it passes',
      ],
      insightLabel: 'Reveals problem ownership vs dependency on others',
      sourceRef: '',
      orderIndex: 0,
    },
    {
      text: 'How confident are you in deploying your own service to production without help?',
      options: [
        'Fully confident — I own the deploy process end to end',
        'Mostly confident — I follow a checklist and ask if unsure',
        'Somewhat — I can do it but feel anxious about it',
        'Not confident — I always need a senior engineer present',
      ],
      insightLabel: 'Reveals DevOps ownership vs learned helplessness',
      sourceRef: '',
      orderIndex: 1,
    },
  ],
};

function getFallbackQuestions(category: string, count: number): GeneratedQuestion[] {
  const base = FALLBACKS[category] ?? FALLBACKS.code_coupling;
  return base.slice(0, count);
}
