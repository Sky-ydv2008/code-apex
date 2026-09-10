import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createFile = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, path, language = 'javascript', content = '' } = req.body;

    if (!projectId || !name || !path) {
      return res.status(400).json({ error: 'projectId, name, and path are required' });
    }

    const file = await prisma.file.create({
      data: {
        projectId,
        name,
        path,
        language,
        content,
      },
    });

    return res.status(201).json({ file });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create file';
    return res.status(500).json({ error: message });
  }
};

export const updateFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const { content, language } = req.body;

    const file = await prisma.file.update({
      where: { id: fileId },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(language ? { language } : {}),
      },
    });

    return res.json({ file });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update file';
    return res.status(500).json({ error: message });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    await prisma.file.delete({ where: { id: fileId } });

    return res.json({ success: true, fileId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete file';
    return res.status(500).json({ error: message });
  }
};

export const renameFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const { name, path } = req.body;

    const file = await prisma.file.update({
      where: { id: fileId },
      data: { name, path },
    });

    return res.json({ file });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to rename file';
    return res.status(500).json({ error: message });
  }
};

export const exportProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { files: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    let markdownExport = `# ${project.name}\n\n`;
    if (project.description) markdownExport += `${project.description}\n\n`;

    for (const file of project.files) {
      markdownExport += `## File: \`${file.path}\`\n\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`;
    }

    return res.json({
      project,
      markdown: markdownExport,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return res.status(500).json({ error: message });
  }
};
