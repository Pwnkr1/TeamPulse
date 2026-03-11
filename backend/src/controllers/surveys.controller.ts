import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { runCoachingPipeline } from '../services/ai/coaching';

export async function getSurveys(req: Request, res: Response): Promise<void> {
  const surveys = await prisma.survey.findMany({
    where: { developerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      questions: { select: { id: true }, orderBy: { orderIndex: 'asc' } },
    },
  });

  res.json({
    surveys: surveys.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      status: s.status,
      deadline: s.deadline,
      completedAt: s.completedAt,
      questionCount: s.questions.length,
    })),
  });
}

export async function getSurveyById(req: Request, res: Response): Promise<void> {
  const survey = await prisma.survey.findFirst({
    where: { id: req.params.id, developerId: req.user!.userId },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!survey) {
    res.status(404).json({ error: 'Survey not found' });
    return;
  }

  res.json({
    survey: {
      ...survey,
      questions: survey.questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options) as string[],
      })),
    },
  });
}

const respondSchema = z.object({
  responses: z.record(z.string(), z.string()),
});

export async function respondToSurvey(req: Request, res: Response): Promise<void> {
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const developerId = req.user!.userId;
  const surveyId = req.params.id;

  const survey = await prisma.survey.findFirst({
    where: { id: surveyId, developerId },
    include: { questions: true },
  });

  if (!survey) {
    res.status(404).json({ error: 'Survey not found' });
    return;
  }
  if (survey.status === 'completed') {
    res.status(409).json({ error: 'Survey already completed' });
    return;
  }

  const { responses } = parsed.data;

  // Save each response
  await prisma.surveyResponse.createMany({
    data: Object.entries(responses).map(([questionId, answer]) => ({
      surveyId,
      developerId,
      questionId,
      answer,
    })),
  });

  // Mark survey completed
  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: 'completed', completedAt: new Date() },
  });

  res.json({ message: 'Survey completed successfully' });

  // Async: generate coaching recommendation
  runCoachingPipeline(developerId, surveyId).catch((err) =>
    console.error('[Coaching] Failed:', err.message)
  );
}
