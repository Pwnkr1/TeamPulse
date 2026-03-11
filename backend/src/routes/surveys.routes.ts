import { Router } from 'express';
import { getSurveys, getSurveyById, respondToSurvey } from '../controllers/surveys.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('developer'), getSurveys);
router.get('/:id', requireRole('developer'), getSurveyById);
router.post('/:id/respond', requireRole('developer'), respondToSurvey);

export default router;
