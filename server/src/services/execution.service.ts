import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  error?: string;
}

export class ExecutionService {
  private static readonly TIMEOUT_MS = 6000; // 6 sec timeout

  public static async runCode(code: string, language: string): Promise<ExecutionResult> {
    const lang = language.toLowerCase();
    if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
      return this.runNodeJS(code);
    } else if (lang === 'python' || lang === 'py') {
      return this.runPython(code);
    } else {
      return {
        stdout: '',
        stderr: `Execution for language '${language}' is not supported yet. Supported: JavaScript, Python.`,
        exitCode: 1,
        executionTimeMs: 0,
        error: 'Unsupported language',
      };
    }
  }

  private static async runNodeJS(code: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `codecraft_${crypto.randomBytes(8).toString('hex')}.js`);

    // Wrap execution with safety hooks if needed
    fs.writeFileSync(tempFile, code, 'utf8');

    const startTime = Date.now();
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let killed = false;

      const child = spawn(process.execPath, [tempFile], {
        env: { NODE_ENV: 'sandbox' },
        timeout: this.TIMEOUT_MS,
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, this.TIMEOUT_MS);

      child.on('close', (code) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        this.cleanupFile(tempFile);

        if (killed) {
          resolve({
            stdout,
            stderr: stderr + '\n[Execution Error]: Time Limit Exceeded (6.0s limit)',
            exitCode: 124,
            executionTimeMs,
            error: 'Time Limit Exceeded',
          });
        } else {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code ?? 0,
            executionTimeMs,
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        this.cleanupFile(tempFile);
        resolve({
          stdout,
          stderr: `Process Error: ${err.message}`,
          exitCode: 1,
          executionTimeMs,
          error: err.message,
        });
      });
    });
  }

  private static async runPython(code: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `codecraft_${crypto.randomBytes(8).toString('hex')}.py`);

    fs.writeFileSync(tempFile, code, 'utf8');

    const startTime = Date.now();
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let killed = false;

      const child = spawn('python', [tempFile], {
        timeout: this.TIMEOUT_MS,
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, this.TIMEOUT_MS);

      child.on('close', (code) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        this.cleanupFile(tempFile);

        if (killed) {
          resolve({
            stdout,
            stderr: stderr + '\n[Execution Error]: Time Limit Exceeded (6.0s limit)',
            exitCode: 124,
            executionTimeMs,
            error: 'Time Limit Exceeded',
          });
        } else {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code ?? 0,
            executionTimeMs,
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        this.cleanupFile(tempFile);
        resolve({
          stdout,
          stderr: `Python Process Error: ${err.message}`,
          exitCode: 1,
          executionTimeMs,
          error: err.message,
        });
      });
    });
  }

  private static cleanupFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
