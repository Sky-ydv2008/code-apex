import { Router } from 'express';
import {
  getChallenges,
  getChallengeBySlug,
  submitChallenge,
  getLeaderboard,
} from '../controllers/challenge.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getChallenges);
router.get('/leaderboard', getLeaderboard);
router.get('/:slug', getChallengeBySlug);
router.post('/submit', authenticateToken, submitChallenge);

export default router;
