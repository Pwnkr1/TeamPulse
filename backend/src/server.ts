import app from './app';
import prisma from './lib/prisma';
import { startScheduler } from './services/scheduler';
import { ensureSeeded } from './lib/ensureSeeded';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function main() {
  try {
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected');
    await ensureSeeded();
    startScheduler();

    app.listen(PORT, () => {
      console.log(`[Server] TeamPulse backend running on http://localhost:${PORT}`);
      console.log(`[Server] Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

main();
