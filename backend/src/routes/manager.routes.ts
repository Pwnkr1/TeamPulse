import { Router } from 'express';
import {
  getStats,
  getTeam,
  getCoaching,
  getCategoryChart,
  getRadarChart,
  getTrendChart,
} from '../controllers/manager.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate, requireRole('manager'));

router.get('/stats', getStats);
router.get('/team', getTeam);
router.get('/coaching/:developerId', getCoaching);
router.get('/chart/categories', getCategoryChart);
router.get('/chart/radar', getRadarChart);
router.get('/chart/trend', getTrendChart);

export default router;
