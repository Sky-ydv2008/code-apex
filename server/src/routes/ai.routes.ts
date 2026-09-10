import { Router } from 'express';
import { handleAIRequest } from '../controllers/ai.controller';

const router = Router();

router.post('/process', handleAIRequest);

export default router;
