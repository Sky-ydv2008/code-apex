import { Router } from 'express';
import { ContestController } from '../controllers/contest.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', ContestController.getContests);
router.get('/:idOrSlug', ContestController.getContest);
router.get('/:contestId/leaderboard', ContestController.getLeaderboard);

// Protected routes
router.post('/', authMiddleware, ContestController.createContest);
router.post('/:contestId/join', authMiddleware, ContestController.joinContest);
router.post('/:contestId/problems/:problemId/submit', authMiddleware, ContestController.submitProblem);
router.post('/:contestId/anti-cheat', authMiddleware, ContestController.logAntiCheat);

export default router;
