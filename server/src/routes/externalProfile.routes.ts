import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { ExternalProfileService } from '../services/externalProfile.service';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// GET /api/external-profile/user/:userId
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        leetcodeHandle: true,
        codeforcesHandle: true,
        codechefHandle: true,
        gfgHandle: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stats = await ExternalProfileService.getCombinedStats({
      leetcodeHandle: user.leetcodeHandle,
      codeforcesHandle: user.codeforcesHandle,
      codechefHandle: user.codechefHandle,
      gfgHandle: user.gfgHandle,
    });

    res.json({ handles: user, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch platform profile stats', details: String(err) });
  }
});

// GET /api/external-profile/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        leetcodeHandle: true,
        codeforcesHandle: true,
        codechefHandle: true,
        gfgHandle: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stats = await ExternalProfileService.getCombinedStats({
      leetcodeHandle: user.leetcodeHandle,
      codeforcesHandle: user.codeforcesHandle,
      codechefHandle: user.codechefHandle,
      gfgHandle: user.gfgHandle,
    });

    res.json({ handles: user, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch platform profile stats', details: String(err) });
  }
});

// POST /api/external-profile/handles - Update user's coding handles
router.post('/handles', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { leetcodeHandle, codeforcesHandle, codechefHandle, gfgHandle, bio } = req.body as {
      leetcodeHandle?: string;
      codeforcesHandle?: string;
      codechefHandle?: string;
      gfgHandle?: string;
      bio?: string;
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        leetcodeHandle: leetcodeHandle !== undefined ? leetcodeHandle.trim() : undefined,
        codeforcesHandle: codeforcesHandle !== undefined ? codeforcesHandle.trim() : undefined,
        codechefHandle: codechefHandle !== undefined ? codechefHandle.trim() : undefined,
        gfgHandle: gfgHandle !== undefined ? gfgHandle.trim() : undefined,
        bio: bio !== undefined ? bio.trim() : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        leetcodeHandle: true,
        codeforcesHandle: true,
        codechefHandle: true,
        gfgHandle: true,
        bio: true,
        points: true,
        streakCount: true,
      },
    });

    const stats = await ExternalProfileService.getCombinedStats({
      leetcodeHandle: updatedUser.leetcodeHandle,
      codeforcesHandle: updatedUser.codeforcesHandle,
      codechefHandle: updatedUser.codechefHandle,
      gfgHandle: updatedUser.gfgHandle,
    });

    res.json({ user: updatedUser, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update platform handles', details: String(err) });
  }
});

export default router;
