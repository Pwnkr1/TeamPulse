import { Router } from 'express';
import { listRequests, approveRequest, rejectRequest } from '../controllers/requests.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate, requireRole('manager'));

router.get('/', listRequests);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);

export default router;
