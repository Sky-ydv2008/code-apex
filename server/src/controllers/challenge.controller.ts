import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExecutionService } from '../services/execution.service';

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.query;

    const challenges = await prisma.challenge.findMany({
      where: difficulty ? { difficulty: String(difficulty).toUpperCase() } : {},
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        points: true,
        language: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { points: 'asc' },
    });

    return res.json({ challenges });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch challenges';
    return res.status(500).json({ error: message });
  }
};

export const getChallengeBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { slug },
    });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    return res.json({
      challenge: {
        ...challenge,
        testCases: JSON.parse(challenge.testCases),
        hints: JSON.parse(challenge.hints),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch challenge';
    return res.status(500).json({ error: message });
  }
};

export const submitChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { challengeId, code } = req.body;
    if (!challengeId || !code) {
      return res.status(400).json({ error: 'challengeId and code are required' });
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const testCases: Array<{ input: string; expected: string }> = JSON.parse(challenge.testCases);

    // Combine code with test case execution runner
    let testRunnerCode = code + '\n\n';
    testRunnerCode += 'const __results = [];\n';
    testCases.forEach((tc, idx) => {
      testRunnerCode += `try { __results.push(String(${tc.input})); } catch(e) { __results.push("Error: " + e.message); }\n`;
    });
    testRunnerCode += 'console.log(JSON.stringify(__results));\n';

    const execResult = await ExecutionService.runCode(testRunnerCode, challenge.language);

    let status = 'ACCEPTED';
    let passedCount = 0;
    let testResults: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];

    if (execResult.exitCode !== 0) {
      status = 'COMPILE_ERROR';
    } else {
      try {
        const lastLine = execResult.stdout.trim().split('\n').pop() || '[]';
        const actualOutputs: string[] = JSON.parse(lastLine);

        testResults = testCases.map((tc, i) => {
          const actual = actualOutputs[i] ?? 'No Output';
          const passed = actual.trim() === tc.expected.trim();
          if (passed) passedCount++;
          return { input: tc.input, expected: tc.expected, actual, passed };
        });

        if (passedCount < testCases.length) {
          status = 'WRONG_ANSWER';
        }
      } catch {
        status = 'COMPILE_ERROR';
      }
    }

    // Record submission
    const submission = await prisma.submission.create({
      data: {
        challengeId,
        userId,
        code,
        status,
        executionTime: execResult.executionTimeMs,
      },
    });

    // If accepted, award points to user
    if (status === 'ACCEPTED') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: challenge.points },
        },
      });
    }

    return res.json({
      status,
      submission,
      testResults,
      executionTimeMs: execResult.executionTimeMs,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return res.status(500).json({ error: message });
  }
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        points: true,
        streakCount: true,
        _count: { select: { submissions: { where: { status: 'ACCEPTED' } } } },
      },
      orderBy: [{ points: 'desc' }, { streakCount: 'desc' }],
      take: 20,
    });

    return res.json({ leaderboard: users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
    return res.status(500).json({ error: message });
  }
};
