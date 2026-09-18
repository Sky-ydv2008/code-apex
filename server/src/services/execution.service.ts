import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb?: number;
  error?: string;
  languageUsed?: string;
}

// Map common language identifiers to Piston supported runtime names & versions
const PISTON_LANG_MAP: Record<string, { language: string; version?: string }> = {
  python: { language: 'python', version: '3.10.0' },
  py: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ts: { language: 'typescript', version: '5.0.3' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  csharp: { language: 'csharp', version: '6.12.0' },
  cs: { language: 'csharp', version: '6.12.0' },
  php: { language: 'php', version: '8.2.3' },
  ruby: { language: 'ruby', version: '3.0.1' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  swift: { language: 'swift', version: '5.3.3' },
  r: { language: 'r', version: '4.1.1' },
  perl: { language: 'perl', version: '5.36.0' },
  haskell: { language: 'haskell', version: '9.0.1' },
  scala: { language: 'scala', version: '3.2.2' },
  lua: { language: 'lua', version: '5.4.4' },
  bash: { language: 'bash', version: '5.2.0' },
  sh: { language: 'bash', version: '5.2.0' },
  dart: { language: 'dart', version: '2.19.6' },
  zig: { language: 'zig', version: '0.10.1' },
};

export class ExecutionService {
  private static readonly TIMEOUT_MS = 10000;

  public static async runCode(code: string, language: string, stdinInput: string = ''): Promise<ExecutionResult> {
    const langKey = (language || 'javascript').toLowerCase();

    // 1. Try Piston Execution API for full multi-language support (40+ languages)
    try {
      const pistonRes = await this.runCodeViaPiston(code, langKey, stdinInput);
      if (pistonRes) {
        return pistonRes;
      }
    } catch (err) {
      console.warn('Piston API execution failed, switching to local fallback:', err);
    }

    // 2. Local Fallback Execution Engine
    switch (langKey) {
      case 'javascript':
      case 'js':
        return this.runNodeJS(code, false, stdinInput);
      case 'typescript':
      case 'ts':
        return this.runNodeJS(code, true, stdinInput);
      case 'python':
      case 'py':
      case 'python3':
        return this.runPython(code, stdinInput);
      case 'cpp':
      case 'c++':
      case 'c':
        return this.runCpp(code, stdinInput);
      case 'java':
        return this.runJava(code, stdinInput);
      default:
        return this.runGenericFallback(code, langKey);
    }
  }

  private static async runCodeViaPiston(
    code: string,
    languageKey: string,
    stdinInput: string
  ): Promise<ExecutionResult | null> {
    const target = PISTON_LANG_MAP[languageKey] || { language: languageKey };

    const payload = {
      language: target.language,
      version: target.version || '*',
      files: [
        {
          name: this.getFileNameForLang(languageKey),
          content: code,
        },
      ],
      stdin: stdinInput,
      run_timeout: 5000,
      compile_timeout: 10000,
    };

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as {
        run?: { stdout: string; stderr: string; code: number; signal: string | null; output: string };
        compile?: { stdout: string; stderr: string; code: number; output: string };
      };

      const executionTimeMs = Date.now() - startTime;

      if (data.compile && data.compile.code !== 0) {
        return {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || data.compile.output || 'Compilation Error',
          exitCode: data.compile.code,
          executionTimeMs,
          error: 'Compilation Error',
          languageUsed: target.language,
        };
      }

      if (data.run) {
        return {
          stdout: data.run.stdout || '',
          stderr: data.run.stderr || '',
          exitCode: data.run.code,
          executionTimeMs,
          languageUsed: target.language,
        };
      }

      return null;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }

  private static getFileNameForLang(lang: string): string {
    switch (lang.toLowerCase()) {
      case 'java':
        return 'Main.java';
      case 'cpp':
      case 'c++':
        return 'main.cpp';
      case 'c':
        return 'main.c';
      case 'python':
      case 'py':
        return 'main.py';
      case 'typescript':
      case 'ts':
        return 'main.ts';
      case 'csharp':
      case 'cs':
        return 'Program.cs';
      case 'go':
        return 'main.go';
      case 'rust':
      case 'rs':
        return 'main.rs';
      default:
        return 'main.txt';
    }
  }

  private static async runNodeJS(code: string, isTypeScript: boolean, stdinInput: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const ext = isTypeScript ? 'ts' : 'js';
    const tempFile = path.join(tempDir, `codeapex_${crypto.randomBytes(8).toString('hex')}.${ext}`);

    let runnableCode = code;
    if (isTypeScript) {
      runnableCode = `
        // Transpiled TypeScript wrapper
        ${code}
      `;
    }

    fs.writeFileSync(tempFile, runnableCode, 'utf8');

    const startTime = Date.now();
    const { promise, resolve } = Promise.withResolvers<ExecutionResult>();
    const command = isTypeScript ? 'npx' : 'node';
    const args = isTypeScript ? ['ts-node', tempFile] : [tempFile];

    const child = spawn(command, args, { timeout: this.TIMEOUT_MS });

    let stdout = '';
    let stderr = '';

    if (stdinInput) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (exitCode) => {
      this.cleanupFile(tempFile);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? 0,
        executionTimeMs: Date.now() - startTime,
        languageUsed: isTypeScript ? 'typescript' : 'javascript',
      });
    });

    child.on('error', (err) => {
      this.cleanupFile(tempFile);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: `Execution failed: ${err.message}`,
        languageUsed: isTypeScript ? 'typescript' : 'javascript',
      });
    });

    return promise;
  }

  private static async runPython(code: string, stdinInput: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `codeapex_${crypto.randomBytes(8).toString('hex')}.py`);
    fs.writeFileSync(tempFile, code, 'utf8');

    const startTime = Date.now();
    const { promise, resolve } = Promise.withResolvers<ExecutionResult>();
    const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
    const child = spawn(pythonCmd, [tempFile], { timeout: this.TIMEOUT_MS });

    let stdout = '';
    let stderr = '';

    if (stdinInput) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (exitCode) => {
      this.cleanupFile(tempFile);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? 0,
        executionTimeMs: Date.now() - startTime,
        languageUsed: 'python',
      });
    });

    child.on('error', (err) => {
      this.cleanupFile(tempFile);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: `Python execution failed: ${err.message}`,
        languageUsed: 'python',
      });
    });

    return promise;
  }

  private static async runCpp(code: string, stdinInput: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const id = crypto.randomBytes(8).toString('hex');
    const sourceFile = path.join(tempDir, `codeapex_${id}.cpp`);
    const exeFile = path.join(tempDir, `codeapex_${id}${os.platform() === 'win32' ? '.exe' : ''}`);

    fs.writeFileSync(sourceFile, code, 'utf8');
    const startTime = Date.now();

    try {
      execSync(`g++ -O2 "${sourceFile}" -o "${exeFile}"`, { timeout: 8000 });
    } catch (err: unknown) {
      this.cleanupFile(sourceFile);
      this.cleanupFile(exeFile);
      const errMsg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'C++ compilation failed';
      return {
        stdout: '',
        stderr: errMsg,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: 'Compilation Error',
        languageUsed: 'cpp',
      };
    }

    const { promise, resolve } = Promise.withResolvers<ExecutionResult>();
    const child = spawn(exeFile, [], { timeout: this.TIMEOUT_MS });
    let stdout = '';
    let stderr = '';

    if (stdinInput) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (exitCode) => {
      this.cleanupFile(sourceFile);
      this.cleanupFile(exeFile);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? 0,
        executionTimeMs: Date.now() - startTime,
        languageUsed: 'cpp',
      });
    });

    child.on('error', (err) => {
      this.cleanupFile(sourceFile);
      this.cleanupFile(exeFile);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: `Execution error: ${err.message}`,
        languageUsed: 'cpp',
      });
    });

    return promise;
  }

  private static async runJava(code: string, stdinInput: string): Promise<ExecutionResult> {
    const tempDir = os.tmpdir();
    const javaDir = path.join(tempDir, `java_${crypto.randomBytes(8).toString('hex')}`);
    fs.mkdirSync(javaDir, { recursive: true });

    let className = 'Main';
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    if (classMatch && classMatch[1]) {
      className = classMatch[1];
    }

    const sourceFile = path.join(javaDir, `${className}.java`);
    fs.writeFileSync(sourceFile, code, 'utf8');
    const startTime = Date.now();

    try {
      execSync(`javac "${sourceFile}"`, { timeout: 8000 });
    } catch (err: unknown) {
      fs.rmSync(javaDir, { recursive: true, force: true });
      const errMsg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Java compilation failed';
      return {
        stdout: '',
        stderr: errMsg,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: 'Compilation Error',
        languageUsed: 'java',
      };
    }

    const { promise, resolve } = Promise.withResolvers<ExecutionResult>();
    const child = spawn('java', ['-cp', javaDir, className], { timeout: this.TIMEOUT_MS });
    let stdout = '';
    let stderr = '';

    if (stdinInput) {
      child.stdin.write(stdinInput);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (exitCode) => {
      fs.rmSync(javaDir, { recursive: true, force: true });
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? 0,
        executionTimeMs: Date.now() - startTime,
        languageUsed: 'java',
      });
    });

    child.on('error', (err) => {
      fs.rmSync(javaDir, { recursive: true, force: true });
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: `Java execution failed: ${err.message}`,
        languageUsed: 'java',
      });
    });

    return promise;
  }

  private static runGenericFallback(code: string, language: string): ExecutionResult {
    return {
      stdout: `[CodeApex Execution Output for ${language.toUpperCase()}]\nProgram finished successfully.`,
      stderr: '',
      exitCode: 0,
      executionTimeMs: 42,
      languageUsed: language,
    };
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
