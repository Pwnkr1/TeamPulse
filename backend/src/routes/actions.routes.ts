import { Router } from 'express';
import { getActions, updateAction } from '../controllers/actions.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate, requireRole('manager'));

router.get('/', getActions);
router.patch('/:id', updateAction);

export default router;
