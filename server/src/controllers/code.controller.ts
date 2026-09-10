import { Request, Response } from 'express';
import { ExecutionService } from '../services/execution.service';

export const runCode = async (req: Request, res: Response) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required for execution' });
    }

    const result = await ExecutionService.runCode(code, language);
    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution failed';
    return res.status(500).json({
      stdout: '',
      stderr: `Execution Error: ${message}`,
      exitCode: 1,
      executionTimeMs: 0,
      error: message,
    });
  }
};
