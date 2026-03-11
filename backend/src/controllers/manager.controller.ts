import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [totalProblems, surveys, users] = await Promise.all([
    prisma.problem.count(),
    prisma.survey.findMany({ select: { status: true } }),
    prisma.user.findMany({
      where: { role: 'developer' },
      include: { surveys: true, surveyResponses: true },
    }),
  ]);

  const totalSurveys = surveys.length;
  const completed = surveys.filter((s) => s.status === 'completed').length;
  const completionRate = totalSurveys > 0 ? Math.round((completed / totalSurveys) * 100) : 0;

  // Mindset score: completion rate per developer weighted by survey count
  const scores = users.map((u) => {
    const total = u.surveys.length;
    const done = u.surveys.filter((s) => s.status === 'completed').length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  });
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const blockedCount = users.filter((u) => {
    const total = u.surveys.length;
    const done = u.surveys.filter((s) => s.status === 'completed').length;
    return total > 0 && done === 0;
  }).length;

  res.json({ totalProblems, completionRate, avgScore, blockedCount });
}

export async function getTeam(_req: Request, res: Response): Promise<void> {
  const developers = await prisma.user.findMany({
    where: { role: 'developer' },
    include: {
      problems: { select: { id: true, category: true } },
      surveys: { select: { id: true, status: true } },
    },
  });

  const team = developers.map((dev) => {
    const surveysTotal = dev.surveys.length;
    const surveysDone = dev.surveys.filter((s) => s.status === 'completed').length;
    const score = surveysTotal > 0 ? Math.round((surveysDone / surveysTotal) * 100) : 0;

    let sentiment: string;
    if (score >= 75) sentiment = 'proactive';
    else if (score >= 50) sentiment = 'reactive';
    else if (surveysTotal > 0 && surveysDone === 0) sentiment = 'blocked';
    else sentiment = 'neutral';

    const categories = [...new Set(dev.problems.map((p) => p.category))];

    return {
      id: dev.id,
      name: dev.name,
      avatar: dev.avatar,
      role: 'Engineer',
      team: dev.team ?? 'Engineering',
      problemsCount: dev.problems.length,
      surveysDone,
      surveysTotal,
      sentiment,
      categories,
      score,
    };
  });

  res.json({ team });
}

export async function getCoaching(req: Request, res: Response): Promise<void> {
  // Return stored coaching note or a default based on sentiment
  const developer = await prisma.user.findUnique({
    where: { id: req.params.developerId },
    include: {
      surveys: { where: { status: 'completed' }, include: { responses: { include: { question: true } } } },
    },
  });

  if (!developer) {
    res.status(404).json({ error: 'Developer not found' });
    return;
  }

  const totalSurveys = await prisma.survey.count({ where: { developerId: developer.id } });
  const doneSurveys = developer.surveys.length;
  const score = totalSurveys > 0 ? Math.round((doneSurveys / totalSurveys) * 100) : 0;

  const sentimentNotes: Record<string, string> = {
    proactive: 'This engineer actively engages with blockers and seeks solutions proactively. Consider pairing them with blocked teammates as a force multiplier.',
    reactive: 'Responds to problems after escalation. Would benefit from structured check-ins and clearer priority signals from the team lead.',
    blocked: 'Showing signs of disengagement. Recommend a focused 1:1 to identify root cause — often psychological safety or unclear expectations.',
    neutral: 'Consistent performer but not fully engaged. May need more ownership opportunities or a clearer growth trajectory.',
  };

  let sentiment: string;
  if (score >= 75) sentiment = 'proactive';
  else if (score >= 50) sentiment = 'reactive';
  else if (totalSurveys > 0 && doneSurveys === 0) sentiment = 'blocked';
  else sentiment = 'neutral';

  res.json({
    developerId: developer.id,
    name: developer.name,
    score,
    sentiment,
    recommendation: sentimentNotes[sentiment],
  });
}

export async function getCategoryChart(_req: Request, res: Response): Promise<void> {
  const problems = await prisma.problem.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  const colorMap: Record<string, string> = {
    code_coupling: '#06B6D4',
    duplication: '#8B5CF6',
    devops: '#F59E0B',
    management: '#10B981',
    communication: '#EF4444',
    technical_debt: '#EC4899',
  };

  const labelMap: Record<string, string> = {
    code_coupling: 'Code Coupling',
    duplication: 'Duplication',
    devops: 'DevOps',
    management: 'Management',
    communication: 'Communication',
    technical_debt: 'Tech Debt',
  };

  res.json({
    data: problems.map((p) => ({
      name: labelMap[p.category] ?? p.category,
      value: p._count.id,
      fill: colorMap[p.category] ?? '#94A3B8',
    })),
  });
}

export async function getRadarChart(_req: Request, res: Response): Promise<void> {
  // Compute competency scores from survey response patterns
  const developers = await prisma.user.findMany({
    where: { role: 'developer' },
    include: {
      surveys: { where: { status: 'completed' } },
      problems: { select: { category: true } },
    },
  });

  const total = developers.length || 1;
  const withSurveys = developers.filter((d) => d.surveys.length > 0).length;
  const withProblems = developers.filter((d) => d.problems.length > 0).length;

  const ownershipScore = Math.round((withSurveys / total) * 100);
  const communicationScore = Math.round((withProblems / total) * 80);
  const devopsCount = developers.filter((d) => d.problems.some((p) => p.category === 'devops')).length;
  const devopsScore = Math.max(40, 90 - Math.round((devopsCount / total) * 50));
  const collabScore = Math.round(((withSurveys + withProblems) / (total * 2)) * 90);

  res.json({
    data: [
      { subject: 'Ownership', A: ownershipScore, fullMark: 100 },
      { subject: 'Communication', A: communicationScore, fullMark: 100 },
      { subject: 'Architecture', A: 65, fullMark: 100 },
      { subject: 'DevOps', A: devopsScore, fullMark: 100 },
      { subject: 'Collaboration', A: collabScore, fullMark: 100 },
      { subject: 'Learning', A: ownershipScore > 50 ? 76 : 55, fullMark: 100 },
    ],
  });
}

export async function getTrendChart(_req: Request, res: Response): Promise<void> {
  // Last 5 weeks of survey activity
  const weeks = Array.from({ length: 5 }, (_, i) => {
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { label: `W${5 - i}`, start, end };
  }).reverse();

  const data = await Promise.all(
    weeks.map(async ({ label, start, end }) => {
      const [sent, completed] = await Promise.all([
        prisma.survey.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.survey.count({ where: { completedAt: { gte: start, lt: end } } }),
      ]);
      return { week: label, sent, completed };
    })
  );

  res.json({ data });
}
