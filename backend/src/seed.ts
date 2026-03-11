import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TeamPulse database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const devPassword = await bcrypt.hash('Dev@123', 10);
  const mgrPassword = await bcrypt.hash('Mgr@123', 10);

  const alex = await prisma.user.upsert({
    where: { email: 'alex.chen@team.com' },
    update: { avatar: 'AC' },
    create: {
      email: 'alex.chen@team.com',
      name: 'Alex Chen',
      passwordHash: devPassword,
      role: 'developer',
      team: 'Platform',
      avatar: 'AC',
    },
  });

  const raj = await prisma.user.upsert({
    where: { email: 'raj.kumar@team.com' },
    update: { avatar: 'RK' },
    create: {
      email: 'raj.kumar@team.com',
      name: 'Raj Kumar',
      passwordHash: devPassword,
      role: 'developer',
      team: 'Infrastructure',
      avatar: 'RK',
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: 'priya.dev@team.com' },
    update: { avatar: 'PS' },
    create: {
      email: 'priya.dev@team.com',
      name: 'Priya Sharma',
      passwordHash: devPassword,
      role: 'developer',
      team: 'Platform',
      avatar: 'PS',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sarah.mgr@team.com' },
    update: { avatar: 'SM' },
    create: {
      email: 'sarah.mgr@team.com',
      name: 'Sarah Mitchell',
      passwordHash: mgrPassword,
      role: 'manager',
      team: 'Engineering',
      avatar: 'SM',
    },
  });

  console.log(`✓ Users: Alex Chen, Raj Kumar, Priya Sharma, Sarah Mitchell`);

  // ── Problems ───────────────────────────────────────────────────────────────
  const problem1 = await prisma.problem.upsert({
    where: { id: 'seed-problem-1' },
    update: {},
    create: {
      id: 'seed-problem-1',
      description:
        'Every time I update the payment module, three unrelated services break. The codebase has grown organically and nobody knows what depends on what anymore.',
      category: 'code_coupling',
      urgency: 'high',
      status: 'survey_completed',
      classification: JSON.stringify({ category: 'code_coupling', confidence: 0.87, summary: 'Tightly coupled services with implicit dependencies.' }),
      developerId: alex.id,
    },
  });

  const problem2 = await prisma.problem.upsert({
    where: { id: 'seed-problem-2' },
    update: {},
    create: {
      id: 'seed-problem-2',
      description:
        'Our CI pipeline takes 45 minutes and fails randomly on 20% of builds due to flaky integration tests. Developers are re-running pipelines instead of fixing root causes.',
      category: 'devops',
      urgency: 'high',
      status: 'survey_completed',
      classification: JSON.stringify({ category: 'devops', confidence: 0.91, summary: 'Pipeline reliability crisis causing workarounds.' }),
      developerId: raj.id,
    },
  });

  const problem3 = await prisma.problem.upsert({
    where: { id: 'seed-problem-3' },
    update: {},
    create: {
      id: 'seed-problem-3',
      description:
        'We have duplicated the user authentication logic in at least 4 different microservices. When we found a security bug we had to patch each one separately.',
      category: 'duplication',
      urgency: 'medium',
      status: 'surveyed',
      classification: JSON.stringify({ category: 'duplication', confidence: 0.83, summary: 'Authentication duplication creating security and maintenance overhead.' }),
      developerId: priya.id,
    },
  });

  console.log(`✓ Problems: ${problem1.id}, ${problem2.id}, ${problem3.id}`);

  // ── Surveys ────────────────────────────────────────────────────────────────
  const survey1Deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const survey1 = await prisma.survey.upsert({
    where: { id: 'seed-survey-1' },
    update: {},
    create: {
      id: 'seed-survey-1',
      problemId: problem1.id,
      developerId: alex.id,
      title: 'Code Coupling Mindset Survey',
      category: 'code_coupling',
      status: 'completed',
      deadline: survey1Deadline,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      coachingSummary:
        'Alex demonstrates strong systemic awareness, recognising cascading dependency issues early. Growth opportunity: establish explicit module contracts before implementation begins.',
      mindsetScore: 72,
    },
  });

  const survey2 = await prisma.survey.upsert({
    where: { id: 'seed-survey-2' },
    update: {},
    create: {
      id: 'seed-survey-2',
      problemId: problem2.id,
      developerId: raj.id,
      title: 'DevOps Mindset Survey',
      category: 'devops',
      status: 'completed',
      deadline: survey1Deadline,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      coachingSummary:
        'Raj shows good ownership instincts but tends to accept flakiness as a given. Challenge: treat every flaky test as a production bug with a root cause to fix.',
      mindsetScore: 58,
    },
  });

  const survey3 = await prisma.survey.upsert({
    where: { id: 'seed-survey-3' },
    update: {},
    create: {
      id: 'seed-survey-3',
      problemId: problem3.id,
      developerId: priya.id,
      title: 'Duplication Mindset Survey',
      category: 'duplication',
      status: 'pending',
      deadline: survey1Deadline,
    },
  });

  console.log(`✓ Surveys: ${survey1.id}, ${survey2.id}, ${survey3.id}`);

  // ── Survey Questions ───────────────────────────────────────────────────────
  // Delete existing questions for idempotency
  await prisma.surveyResponse.deleteMany({ where: { surveyId: { in: [survey1.id, survey2.id, survey3.id] } } });
  await prisma.surveyQuestion.deleteMany({ where: { surveyId: { in: [survey1.id, survey2.id, survey3.id] } } });

  const q1s1 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey1.id,
      text: 'When you discover that changing one module breaks unrelated parts of the system, what is your immediate response?',
      options: JSON.stringify([
        'Fix all broken parts immediately before moving on',
        'Document the dependency map first, then fix systematically',
        'Patch the urgent breakages and create a refactor ticket',
        'Feel overwhelmed and escalate to the team lead',
      ]),
      insightLabel: 'Reveals systemic thinking vs reactive patching pattern',
      sourceRef: '',
      orderIndex: 0,
    },
  });

  const q2s1 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey1.id,
      text: 'How often do you define clear module boundaries before writing implementation code?',
      options: JSON.stringify([
        'Always — I design interfaces before any implementation',
        'Often — when the feature feels architecturally significant',
        'Sometimes — when I remember to',
        'Rarely — I focus on making things work first',
      ]),
      insightLabel: 'Reveals design-first vs implementation-first mindset',
      sourceRef: '',
      orderIndex: 1,
    },
  });

  const q3s1 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey1.id,
      text: 'When a team member asks why their change broke your module, what do you do?',
      options: JSON.stringify([
        'Show them the interface contract that was violated',
        'Walk through the dependency graph together',
        'Help them fix it and add a regression test',
        'Fix it yourself without explaining',
      ]),
      insightLabel: 'Reveals knowledge sharing vs hero-coder pattern',
      sourceRef: '',
      orderIndex: 2,
    },
  });

  const q1s2 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey2.id,
      text: 'When a CI/CD pipeline fails on your pull request, what is your first action?',
      options: JSON.stringify([
        'Read the error logs immediately and trace the root cause',
        'Check if it is a known flaky test before investigating',
        'Ask a DevOps engineer to look at it',
        'Re-run the pipeline hoping it passes',
      ]),
      insightLabel: 'Reveals problem ownership vs dependency on others',
      sourceRef: '',
      orderIndex: 0,
    },
  });

  const q2s2 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey2.id,
      text: 'How confident are you in deploying your own service to production without help?',
      options: JSON.stringify([
        'Fully confident — I own the deploy process end to end',
        'Mostly confident — I follow a checklist and ask if unsure',
        'Somewhat — I can do it but feel anxious about it',
        'Not confident — I always need a senior engineer present',
      ]),
      insightLabel: 'Reveals DevOps ownership vs learned helplessness',
      sourceRef: '',
      orderIndex: 1,
    },
  });

  const q1s3 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey3.id,
      text: 'When you encounter the same logic in two places, what do you do?',
      options: JSON.stringify([
        'Immediately extract it into a shared library',
        'File a tech debt ticket and note both locations',
        'Leave it for now and plan to consolidate later',
        'Accept duplication as a pragmatic trade-off',
      ]),
      insightLabel: 'Reveals DRY discipline vs pragmatic acceptance',
      sourceRef: '',
      orderIndex: 0,
    },
  });

  const q2s3 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey3.id,
      text: 'When a security vulnerability is discovered in shared logic you duplicated, what is your reflection?',
      options: JSON.stringify([
        'I should have built a shared library from the start',
        'I need a better process for tracking duplicate code',
        'I will be more careful about copying code in the future',
        'This was unavoidable given the time pressure',
      ]),
      insightLabel: 'Reveals accountability vs circumstance attribution',
      sourceRef: '',
      orderIndex: 1,
    },
  });

  console.log('✓ Survey questions seeded');

  // ── Survey Responses (Alex and Raj completed their surveys) ────────────────
  // Alex's answers (survey1): option index 1, 0, 1 → use answer text
  const s1Options1 = ['Fix all broken parts immediately before moving on', 'Document the dependency map first, then fix systematically', 'Patch the urgent breakages and create a refactor ticket', 'Feel overwhelmed and escalate to the team lead'];
  const s1Options2 = ['Always — I design interfaces before any implementation', 'Often — when the feature feels architecturally significant', 'Sometimes — when I remember to', 'Rarely — I focus on making things work first'];
  const s1Options3 = ['Show them the interface contract that was violated', 'Walk through the dependency graph together', 'Help them fix it and add a regression test', 'Fix it yourself without explaining'];

  await prisma.surveyResponse.createMany({
    data: [
      { surveyId: survey1.id, developerId: alex.id, questionId: q1s1.id, answer: s1Options1[1] },
      { surveyId: survey1.id, developerId: alex.id, questionId: q2s1.id, answer: s1Options2[0] },
      { surveyId: survey1.id, developerId: alex.id, questionId: q3s1.id, answer: s1Options3[1] },
    ],
  });

  // Raj's answers (survey2): option index 1, 2
  const s2Options1 = ['Read the error logs immediately and trace the root cause', 'Check if it is a known flaky test before investigating', 'Ask a DevOps engineer to look at it', 'Re-run the pipeline hoping it passes'];
  const s2Options2 = ['Fully confident — I own the deploy process end to end', 'Mostly confident — I follow a checklist and ask if unsure', 'Somewhat — I can do it but feel anxious about it', 'Not confident — I always need a senior engineer present'];

  await prisma.surveyResponse.createMany({
    data: [
      { surveyId: survey2.id, developerId: raj.id, questionId: q1s2.id, answer: s2Options1[1] },
      { surveyId: survey2.id, developerId: raj.id, questionId: q2s2.id, answer: s2Options2[2] },
    ],
  });

  console.log('✓ Survey responses seeded');

  // ── Action Items ───────────────────────────────────────────────────────────
  await prisma.actionItem.deleteMany({ where: { id: { in: ['seed-action-1', 'seed-action-2', 'seed-action-3', 'seed-action-4', 'seed-action-5'] } } });
  await prisma.actionItem.createMany({
    data: [
      {
        id: 'seed-action-1',
        title: 'Create dependency graph for payment module',
        description: 'Map all services that import from or call the payment module. Use this to establish explicit interface contracts.',
        priority: 'high',
        status: 'in_progress',
        assigneeId: alex.id,
        surveyId: survey1.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: 'code_coupling',
      },
      {
        id: 'seed-action-2',
        title: 'Add integration test isolation layer',
        description: 'Identify and quarantine the top 5 flaky tests. Run them in an isolated environment before allowing merge.',
        priority: 'high',
        status: 'todo',
        assigneeId: raj.id,
        surveyId: survey2.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: 'devops',
      },
      {
        id: 'seed-action-3',
        title: 'Extract shared auth library',
        description: 'Consolidate the 4 duplicated auth implementations into a single auth-service library with a versioned interface.',
        priority: 'high',
        status: 'todo',
        assigneeId: priya.id,
        surveyId: survey3.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        category: 'duplication',
      },
      {
        id: 'seed-action-4',
        title: 'Document module interface contracts',
        description: 'For every inter-service call, document the expected input/output contract in the team wiki.',
        priority: 'medium',
        status: 'todo',
        assigneeId: alex.id,
        surveyId: survey1.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        category: 'code_coupling',
      },
      {
        id: 'seed-action-5',
        title: 'Set up pipeline failure alerting',
        description: 'Configure Slack notifications for pipeline failures with direct links to the failing step logs.',
        priority: 'medium',
        status: 'completed',
        assigneeId: raj.id,
        surveyId: survey2.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'devops',
      },
    ],
  });

  console.log('✓ Action items seeded');
  console.log('\n✅ Seeding complete!');
  console.log('\nDemo credentials:');
  console.log('  Developer: alex.chen@team.com  / Dev@123');
  console.log('  Developer: raj.kumar@team.com  / Dev@123');
  console.log('  Developer: priya.dev@team.com  / Dev@123');
  console.log('  Manager:   sarah.mgr@team.com  / Mgr@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
