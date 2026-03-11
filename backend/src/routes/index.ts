import { Router } from 'express';
import authRoutes from './auth.routes';
import problemsRoutes from './problems.routes';
import surveysRoutes from './surveys.routes';
import managerRoutes from './manager.routes';
import actionsRoutes from './actions.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemsRoutes);
router.use('/surveys', surveysRoutes);
router.use('/manager', managerRoutes);
router.use('/actions', actionsRoutes);
