import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { aggregateKnowledge } from '../services/knowledge/aggregator';
import { classifyProblem } from '../services/ai/classifier';
import { generateSurvey } from '../services/ai/survey-generator';

const submitSchema = z.object({
  category: z.enum(['code_coupling', 'duplication', 'devops', 'management', 'communication', 'technical_debt']),
  urgency: z.enum(['low', 'medium', 'high']),
  description: z.string().min(20).max(2000),
});

export async function submitProblem(req: Request, res: Response): Promise<void> {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { category, urgency, description } = parsed.data;
  const developerId = req.user!.userId;

  // 1 — Save problem record immediately
  const problem = await prisma.problem.create({
    data: { developerId, category, urgency, description, status: 'analyzing' },
  });

  // 2 — Run full pipeline asynchronously (respond immediately with problem ID)
  // We return fast so the frontend can show the progress UI
  res.status(202).json({
    problemId: problem.id,
    message: 'Problem received. Analysis pipeline started.',
  });

  // 3 — Run pipeline in background
  runPipeline(problem.id, category, description, developerId).catch((err) => {
    console.error(`[Pipeline] Failed for problem ${problem.id}:`, err.message);
    prisma.problem.update({
      where: { id: problem.id },
      data: { status: 'error' },
    }).catch(() => {});
  });
}

async function runPipeline(
  problemId: string,
  category: string,
  description: string,
  developerId: string
): Promise<void> {
  console.log(`[Pipeline] Starting for problem ${problemId}`);

  // Step A — Knowledge Retrieval from all 4 sources
  console.log('[Pipeline] Fetching knowledge from GitHub, HackerNews, Reddit, StackOverflow...');
  const { items, sourceBreakdown } = await aggregateKnowledge(description, category);
  console.log(`[Pipeline] Got ${items.length} quality items. Breakdown:`, sourceBreakdown);

  // Step B — AI Classification (anchored to retrieved context)
  console.log('[Pipeline] Classifying problem with OpenAI...');
  const classification = await classifyProblem(description, items);

  // Step C — Build similar cases from top items
  const similarCases = items.slice(0, 4).map((item) => ({
    source: item.source,
    title: item.title,
    url: item.url,
    summary: item.claims[0] ?? item.body.slice(0, 200),
    qualityScore: item.qualityScore,
  }));

  // Step D — Update problem with classification
  await prisma.problem.update({
    where: { id: problemId },
    data: {
      status: 'survey_generating',
      classification: JSON.stringify(classification),
      similarCases: JSON.stringify(similarCases),
      sourcesUsed: JSON.stringify(sourceBreakdown),
    },
  });

  // Step E — Generate survey questions anchored to retrieved claims
  console.log('[Pipeline] Generating survey questions...');
  const questions = await generateSurvey(description, category, items);
  console.log(`[Pipeline] Generated ${questions.length} questions`);

  // Step F — Create survey + questions in DB
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  const survey = await prisma.survey.create({
    data: {
      problemId,
      developerId,
      title: `${classification.category.replace(/_/g, ' ')} Mindset Survey`,
      category,
      status: 'pending',
      deadline,
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          options: JSON.stringify(q.options),
          insightLabel: q.insightLabel,
          sourceRef: q.sourceRef,
          orderIndex: q.orderIndex,
        })),
      },
    },
  });

  // Step G — Mark problem complete
  await prisma.problem.update({
    where: { id: problemId },
    data: { status: 'survey_generated' },
  });

  console.log(`[Pipeline] Done. Survey ${survey.id} created for problem ${problemId}`);
}

export async function getProblems(req: Request, res: Response): Promise<void> {
  const problems = await prisma.problem.findMany({
    where: { developerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: { survey: { select: { id: true, status: true } } },
  });

  res.json({
    problems: problems.map((p) => ({
      ...p,
      classification: p.classification ? JSON.parse(p.classification) : null,
      similarCases: p.similarCases ? JSON.parse(p.similarCases) : [],
      sourcesUsed: p.sourcesUsed ? JSON.parse(p.sourcesUsed) : {},
    })),
  });
}
