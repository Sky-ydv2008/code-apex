import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { ExecutionService } from '../services/execution.service';

export interface AuthRequest extends Request {
  userId?: string;
}

export class ContestController {
  // Get all contests
  public static async getContests(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const contests = await prisma.contest.findMany({
        orderBy: { startTime: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          _count: { select: { problems: true, participants: true } },
        },
      });

      res.json({ contests });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch contests', details: String(err) });
    }
  }

  // Get single contest with problems
  public static async getContest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idOrSlug } = req.params;
      const contest = await prisma.contest.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          problems: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              points: true,
              order: true,
              description: true,
              starterCode: true,
              testCases: true,
              hints: true,
            },
          },
          _count: { select: { participants: true, submissions: true } },
        },
      });

      if (!contest) {
        res.status(404).json({ error: 'Contest not found' });
        return;
      }

      let participant = null;
      if (req.userId) {
        participant = await prisma.contestParticipant.findUnique({
          where: { contestId_userId: { contestId: contest.id, userId: req.userId } },
        });
      }

      res.json({ contest, participant });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch contest details', details: String(err) });
    }
  }

  // Create a new Contest
  public static async createContest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const {
        title,
        description,
        rules,
        startTime,
        endTime,
        durationMinutes,
        isPublic,
        antiCheatEnabled,
        maxStrikes,
        problems,
      } = req.body as {
        title: string;
        description: string;
        rules?: string;
        startTime: string;
        endTime: string;
        durationMinutes?: number;
        isPublic?: boolean;
        antiCheatEnabled?: boolean;
        maxStrikes?: number;
        problems?: Array<{
          title: string;
          difficulty: string;
          points: number;
          description: string;
          starterCode: string;
          testCases: Array<{ input: string; expected: string; hidden?: boolean }>;
        }>;
      };

      if (!title || !description || !startTime || !endTime) {
        res.status(400).json({ error: 'Title, description, startTime and endTime are required' });
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

      const newContest = await prisma.contest.create({
        data: {
          title,
          slug,
          description,
          rules: rules || 'Tab switching and window blur will trigger anti-cheat strikes. Fullscreen mode required.',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          durationMinutes: durationMinutes || 60,
          isPublic: isPublic !== false,
          antiCheatEnabled: antiCheatEnabled !== false,
          maxStrikes: maxStrikes || 3,
          createdById: userId,
          problems: {
            create: (problems || [
              {
                title: 'Two Sum Apex',
                difficulty: 'EASY',
                points: 100,
                description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
                starterCode: 'function twoSum(nums, target) {\n  // Write code here\n}',
                testCases: [
                  { input: '[2,7,11,15]\n9', expected: '[0,1]' },
                  { input: '[3,2,4]\n6', expected: '[1,2]' },
                ],
              },
            ]).map((prob, idx) => ({
              title: prob.title,
              slug: prob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + idx,
              difficulty: prob.difficulty || 'MEDIUM',
              points: prob.points || 100,
              order: idx + 1,
              description: prob.description,
              starterCode: typeof prob.starterCode === 'string' ? prob.starterCode : JSON.stringify(prob.starterCode),
              testCases: typeof prob.testCases === 'string' ? prob.testCases : JSON.stringify(prob.testCases),
            })),
          },
        },
        include: { problems: true },
      });

      res.status(201).json({ contest: newContest });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create contest', details: String(err) });
    }
  }

  // Join Contest
  public static async joinContest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { contestId } = req.params;

      const contest = await prisma.contest.findUnique({ where: { id: contestId } });
      if (!contest) {
        res.status(404).json({ error: 'Contest not found' });
        return;
      }

      const participant = await prisma.contestParticipant.upsert({
        where: { contestId_userId: { contestId, userId } },
        update: {},
        create: {
          contestId,
          userId,
          score: 0,
          strikes: 0,
        },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });

      res.json({ participant });
    } catch (err) {
      res.status(500).json({ error: 'Failed to join contest', details: String(err) });
    }
  }

  // Submit Solution for a Contest Problem
  public static async submitProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { contestId, problemId } = req.params;
      const { code, language } = req.body as { code: string; language: string };

      if (!code) {
        res.status(400).json({ error: 'Code is required' });
        return;
      }

      const problem = await prisma.contestProblem.findFirst({
        where: { id: problemId, contestId },
      });

      if (!problem) {
        res.status(404).json({ error: 'Contest problem not found' });
        return;
      }

      // Check if participant is disqualified
      const participant = await prisma.contestParticipant.findUnique({
        where: { contestId_userId: { contestId, userId } },
      });

      if (participant?.isDisqualified) {
        res.status(403).json({ error: 'You are disqualified from this contest due to anti-cheat violations.' });
        return;
      }

      // Parse test cases
      let rawCases: Array<{ input: string; expected: string; hidden?: boolean }> = [];
      try {
        rawCases = JSON.parse(problem.testCases);
      } catch {
        rawCases = [{ input: '', expected: '' }];
      }

      let passCount = 0;
      let totalExecutionTimeMs = 0;
      let overallStatus = 'ACCEPTED';

      for (const tc of rawCases) {
        const result = await ExecutionService.runCode(code, language || 'javascript', tc.input);
        totalExecutionTimeMs += result.executionTimeMs;

        if (result.exitCode !== 0 || result.error) {
          overallStatus = result.error?.includes('Compilation') ? 'COMPILE_ERROR' : 'RUNTIME_ERROR';
          break;
        }

        const normalizedOutput = result.stdout.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = (tc.expected || '').trim().replace(/\r\n/g, '\n');

        if (normalizedOutput === normalizedExpected || normalizedOutput.includes(normalizedExpected)) {
          passCount++;
        } else {
          overallStatus = 'WRONG_ANSWER';
        }
      }

      if (rawCases.length === 0) {
        passCount = 1;
        rawCases = [{ input: '', expected: '' }];
      }

      const isAllPassed = passCount === rawCases.length && overallStatus !== 'COMPILE_ERROR' && overallStatus !== 'RUNTIME_ERROR';
      const status = isAllPassed ? 'ACCEPTED' : (overallStatus === 'ACCEPTED' ? 'WRONG_ANSWER' : overallStatus);
      const earnedScore = isAllPassed ? problem.points : Math.floor((passCount / rawCases.length) * problem.points * 0.5);

      const submission = await prisma.contestSubmission.create({
        data: {
          contestId,
          problemId,
          userId,
          code,
          language: language || 'javascript',
          status,
          passCount,
          totalCount: rawCases.length,
          executionTimeMs: Math.round(totalExecutionTimeMs / (rawCases.length || 1)),
          score: earnedScore,
        },
      });

      // Update Participant score
      const userSubmissions = await prisma.contestSubmission.findMany({
        where: { contestId, userId, status: 'ACCEPTED' },
        distinct: ['problemId'],
      });

      const totalScore = userSubmissions.reduce((sum, sub) => sum + sub.score, 0);

      await prisma.contestParticipant.upsert({
        where: { contestId_userId: { contestId, userId } },
        update: {
          score: totalScore,
        },
        create: {
          contestId,
          userId,
          score: totalScore,
        },
      });

      res.json({
        submission,
        isPassed: isAllPassed,
        passCount,
        totalCount: rawCases.length,
        status,
        score: earnedScore,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process submission', details: String(err) });
    }
  }

  // Anti-cheat strike logger
  public static async logAntiCheat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { contestId } = req.params;
      const { eventType, details } = req.body as { eventType: string; details?: string };

      const contest = await prisma.contest.findUnique({ where: { id: contestId } });
      if (!contest) {
        res.status(404).json({ error: 'Contest not found' });
        return;
      }

      const participant = await prisma.contestParticipant.findUnique({
        where: { contestId_userId: { contestId, userId } },
      });

      const currentStrikes = (participant?.strikes || 0) + 1;
      const isDisqualified = currentStrikes >= contest.maxStrikes;

      const updatedParticipant = await prisma.contestParticipant.upsert({
        where: { contestId_userId: { contestId, userId } },
        update: {
          strikes: currentStrikes,
          isDisqualified,
        },
        create: {
          contestId,
          userId,
          strikes: currentStrikes,
          isDisqualified,
        },
      });

      await prisma.antiCheatLog.create({
        data: {
          contestId,
          userId,
          eventType: eventType || 'TAB_SWITCH',
          details: details || 'Tab switched or browser window lost focus during active contest',
          strikeIndex: currentStrikes,
        },
      });

      res.json({
        strikes: currentStrikes,
        maxStrikes: contest.maxStrikes,
        isDisqualified,
        warningMessage: isDisqualified
          ? 'DISQUALIFIED! Maximum anti-cheat violations reached.'
          : `WARNING (${currentStrikes}/${contest.maxStrikes}): Tab switching is strictly prohibited!`,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record anti-cheat log', details: String(err) });
    }
  }

  // Contest Leaderboard
  public static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { contestId } = req.params;

      const participants = await prisma.contestParticipant.findMany({
        where: { contestId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              points: true,
              leetcodeHandle: true,
              codeforcesHandle: true,
            },
          },
        },
        orderBy: [{ score: 'desc' }, { totalTimeMs: 'asc' }],
      });

      res.json({ leaderboard: participants });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch contest leaderboard', details: String(err) });
    }
  }
}
