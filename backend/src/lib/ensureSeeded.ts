import bcrypt from 'bcryptjs';
import prisma from './prisma';

/**
 * Ensures demo users always exist in the database.
 * Uses upsert — safe to call on every server startup.
 */
export async function ensureSeeded(): Promise<void> {
  const devHash = await bcrypt.hash('Dev@123', 10);
  const mgrHash = await bcrypt.hash('Mgr@123', 10);

  await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex.chen@team.com' },
      update: {},
      create: {
        email: 'alex.chen@team.com',
        name: 'Alex Chen',
        passwordHash: devHash,
        role: 'developer',
        team: 'Platform',
        avatar: 'AC',
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.mgr@team.com' },
      update: {},
      create: {
        email: 'sarah.mgr@team.com',
        name: 'Sarah Mitchell',
        passwordHash: mgrHash,
        role: 'manager',
        team: 'Engineering',
        avatar: 'SM',
        status: 'active',
      },
    }),
  ]);

  console.log('[Seed] Demo users ready — alex.chen@team.com / sarah.mgr@team.com');
}
