import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendEmail, buildRetroEmailHtml } from './email';

export function startScheduler(): void {
  // Every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', () => {
    console.log('[Scheduler] Running weekly retro email job...');
    sendWeeklyRetroEmails().catch((err) =>
      console.error('[Scheduler] Weekly retro job failed:', err.message)
    );
  });
  console.log('[Scheduler] Weekly retro email job scheduled — every Monday at 09:00');
}

export async function sendWeeklyRetroEmails(): Promise<{ sent: number; errors: number }> {
  const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';

  // Get the manager (first manager found — or configurable via env)
  const manager = await prisma.user.findFirst({
    where: { role: 'manager' },
    select: { name: true },
  });
  const managerName = manager?.name ?? 'Your Manager';

  // Get all active developers with their open actions and pending surveys
  const developers = await prisma.user.findMany({
    where: { role: 'developer', status: 'active' },
    include: {
      assignedActions: {
        where: { status: { not: 'done' } },
        select: { title: true, priority: true, dueDate: true, category: true },
      },
      surveys: {
        where: { status: 'pending' },
        select: { title: true, deadline: true, category: true },
      },
    },
  });

  let sent = 0;
  let errors = 0;

  for (const dev of developers) {
    try {
      const subject = `TeamPulse Weekly Retro — ${weekLabel}`;
      const body = buildRetroEmailHtml({
        developerName: dev.name,
        managerName,
        weekLabel,
        actions: dev.assignedActions,
        pendingSurveys: dev.surveys,
        appUrl,
      });

      // Always save to inbox
      await prisma.inboxMessage.create({
        data: {
          userId: dev.id,
          subject,
          body,
          fromName: managerName,
          fromEmail: process.env.SMTP_FROM_EMAIL ?? 'manager@teampulse.dev',
          type: 'retro',
        },
      });

      // Send actual email if SMTP is configured
      await sendEmail(dev.email, subject, body);
      sent++;
    } catch (err: unknown) {
      console.error(`[Scheduler] Failed for ${dev.email}:`, (err as Error).message);
      errors++;
    }
  }

  console.log(`[Scheduler] Weekly retro done — ${sent} sent, ${errors} errors`);
  return { sent, errors };
}
