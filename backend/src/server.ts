import app from './app';
import prisma from './lib/prisma';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function main() {
  try {
    await prisma.$connect();
    console.log('[DB] SQLite connected');

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
