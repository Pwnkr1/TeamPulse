import OpenAI from 'openai';
import prisma from '../../lib/prisma';
import { KnowledgeItem } from '../../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CoachingResult {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  actionItems: string[];
  mindsetScore: number; // 0–100
  coachingTone: 'encouraging' | 'challenging' | 'neutral';
}

// Build a compact survey response summary for the prompt
function buildResponseSummary(
  questions: Array<{ text: string; options: string[] }>,
  answers: number[] // indices into options
): string {
  return questions
    .map((q, i) => {
      const chosen = q.options[answers[i]] ?? 'No answer';
      return `Q: ${q.text}\nA: ${chosen}`;
    })
    .join('\n\n');
}

// Derive a simple mindset score from answer indices (higher index = more mature response)
function deriveMindsetScore(answers: number[], optionCounts: number[]): number {
  if (answers.length === 0) return 50;
  const maxIndex = 3; // 4 options: 0-3
  const total = answers.reduce((sum, a, i) => {
    const max = (optionCounts[i] ?? 4) - 1;
    return sum + (a / Math.max(max, 1));
  }, 0);
  const avg = total / answers.length;
  // Map 0–1 to 30–95 (no one gets 0 or 100)
  return Math.round(30 + avg * 65);
}

export async function generateCoaching(
  problemDescription: string,
  category: string,
  questions: Array<{ text: string; options: string[] }>,
  answers: number[],
  knowledgeItems: KnowledgeItem[]
): Promise<CoachingResult> {
  const responseSummary = buildResponseSummary(questions, answers);
  const mindsetScore = deriveMindsetScore(
    answers,
    questions.map((q) => q.options.length)
  );

  // Top 3 high-quality claims for grounding
  const topClaims = knowledgeItems
    .slice(0, 5)
    .flatMap((i) => i.claims)
    .slice(0, 8)
    .map((c) => `• ${c}`)
    .join('\n');

  const prompt = `You are a senior engineering coach providing a private, constructive retrospective debrief.

DEVELOPER'S PROBLEM:
"${problemDescription}"

CATEGORY: ${category.replace(/_/g, ' ')}

SURVEY RESPONSES (developer's self-assessment):
${responseSummary}

EVIDENCE FROM COMMUNITY DISCUSSIONS (use these to ground your coaching):
${topClaims || 'No external evidence available.'}

MINDSET SCORE (computed): ${mindsetScore}/100

Your task is to write a personalised coaching debrief. Be direct, specific, and empathetic.

RULES:
1. Do NOT invent statistics or company names not in the evidence above
2. Strengths and growth areas must directly relate to the survey answers
3. Action items must be concrete, implementable within 2 weeks
4. Tone: if score >= 70 use "encouraging", if score <= 45 use "challenging", else "neutral"
5. Maximum 3 strengths, 3 growth areas, 4 action items

Return ONLY valid JSON:
{
  "summary": "2–3 sentence personalised debrief",
  "strengths": ["strength 1", "strength 2"],
  "growthAreas": ["area 1", "area 2"],
  "actionItems": ["action 1", "action 2", "action 3"],
  "coachingTone": "encouraging|challenging|neutral"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content) as Omit<CoachingResult, 'mindsetScore'>;

    const validTones = ['encouraging', 'challenging', 'neutral'] as const;
    const tone = validTones.includes(parsed.coachingTone as (typeof validTones)[number])
      ? (parsed.coachingTone as (typeof validTones)[number])
      : mindsetScore >= 70
        ? 'encouraging'
        : mindsetScore <= 45
          ? 'challenging'
          : 'neutral';

    return {
      summary: parsed.summary ?? 'Coaching debrief generated based on your survey responses.',
      strengths: (parsed.strengths ?? []).slice(0, 3),
      growthAreas: (parsed.growthAreas ?? []).slice(0, 3),
      actionItems: (parsed.actionItems ?? []).slice(0, 4),
      mindsetScore,
      coachingTone: tone,
    };
  } catch (err) {
    console.error('[Coaching] OpenAI error:', (err as Error).message);
    return getFallbackCoaching(category, mindsetScore);
  }
}

// ── Pipeline wrapper: fetch context from DB then run coaching ─────────────
export async function runCoachingPipeline(
  developerId: string,
  surveyId: string
): Promise<void> {
  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, developerId },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
      responses: true,
      problem: true,
    },
  });

  if (!survey || !survey.problem) {
    console.error(`[Coaching] Survey ${surveyId} or problem not found`);
    return;
  }

  const questions = survey.questions.map((q) => ({
    text: q.text,
    options: JSON.parse(q.options) as string[],
  }));

  // Map stored answer text → option indices
  const answers = survey.questions.map((q, i) => {
    const resp = survey.responses.find((r) => r.questionId === q.id);
    const opts = questions[i]?.options ?? [];
    const idx = resp ? opts.indexOf(resp.answer) : -1;
    return idx >= 0 ? idx : 0;
  });

  const result = await generateCoaching(
    survey.problem.description,
    survey.problem.category,
    questions,
    answers,
    [] // no knowledge items needed at coaching stage
  );

  // Persist coaching result
  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      coachingSummary: result.summary,
      mindsetScore: result.mindsetScore,
    },
  });

  // Create action items from coaching
  if (result.actionItems.length > 0) {
    await prisma.actionItem.createMany({
      data: result.actionItems.map((title) => ({
        title,
        description: `Generated from coaching debrief: ${result.coachingTone} tone`,
        priority: result.coachingTone === 'challenging' ? 'high' : 'medium',
        status: 'todo',
        assigneeId: developerId,
        surveyId,
      })),
    });
  }

  console.log(`[Coaching] Pipeline complete for survey ${surveyId}, score: ${result.mindsetScore}`);
}

function getFallbackCoaching(category: string, mindsetScore: number): CoachingResult {
  const tone: CoachingResult['coachingTone'] =
    mindsetScore >= 70 ? 'encouraging' : mindsetScore <= 45 ? 'challenging' : 'neutral';

  return {
    summary: `Your responses show a ${mindsetScore >= 60 ? 'solid' : 'developing'} awareness of ${category.replace(/_/g, ' ')} challenges. There are clear opportunities to deepen your approach.`,
    strengths: [
      'Willingness to reflect on your own process',
      'Recognition of the problem space',
    ],
    growthAreas: [
      'Building more systematic habits around ' + category.replace(/_/g, ' '),
      'Proactive rather than reactive problem-solving',
    ],
    actionItems: [
      'Schedule a 30-minute architecture review with your team this sprint',
      'Document one decision you made this week and its trade-offs',
      'Identify one manual step in your workflow to automate',
      'Share this retrospective output with your team lead',
    ],
    mindsetScore,
    coachingTone: tone,
  };
}
