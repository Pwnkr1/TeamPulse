import { Router } from 'express';
import { getInbox, getMessage, markRead, markAllRead, triggerRetroEmails } from '../controllers/inbox.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate);

router.get('/', getInbox);
router.get('/:id', getMessage);
router.patch('/:id/read', markRead);
router.post('/mark-all-read', markAllRead);

// Manager-only: manually trigger the weekly retro job (for testing)
router.post('/admin/trigger-retro', requireRole('manager'), triggerRetroEmails);

export default router;
