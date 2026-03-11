import { Router } from 'express';
import { submitProblem, getProblems } from '../controllers/problems.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('developer'), submitProblem);
router.get('/', requireRole('developer'), getProblems);

export default router;
