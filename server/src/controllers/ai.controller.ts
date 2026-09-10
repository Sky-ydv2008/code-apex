import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const handleAIRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, code = '', prompt = '', language = 'javascript', roomId } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'AI request type is required' });
    }

    const aiResponse = await AIService.processRequest(type, code, prompt, language);

    // Save request to database asynchronously if user is authenticated
    if (userId) {
      prisma.aIRequest.create({
        data: {
          userId,
          roomId: roomId || null,
          type,
          input: code.length > 500 ? code.substring(0, 500) + '...' : code,
          output: aiResponse.result.length > 2000 ? aiResponse.result.substring(0, 2000) + '...' : aiResponse.result,
        },
      }).catch(err => console.warn('Failed to log AI request:', err));
    }

    return res.json(aiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI Processing Failed';
    return res.status(500).json({ error: message });
  }
};
