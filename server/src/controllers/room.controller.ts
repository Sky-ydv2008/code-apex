import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character room code
}

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, description, language = 'javascript', isPublic = true } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    let roomCode = generateRoomCode();
    // Ensure uniqueness
    let existing = await prisma.room.findUnique({ where: { roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { roomCode } });
    }

    const defaultContent = language === 'python'
      ? `# CodeCraft AI - ${name}\n\ndef main():\n    print("Hello from CodeCraft AI!")\n\nif __name__ == "__main__":\n    main()\n`
      : `// CodeCraft AI - ${name}\n\nfunction main() {\n  console.log("Hello from CodeCraft AI!");\n}\n\nmain();\n`;

    const room = await prisma.room.create({
      data: {
        name,
        description,
        roomCode,
        language,
        isPublic,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        projects: {
          create: {
            name: 'Workspace',
            files: {
              create: [
                {
                  name: language === 'python' ? 'main.py' : 'index.js',
                  path: language === 'python' ? 'main.py' : 'index.js',
                  language,
                  content: defaultContent,
                },
              ],
            },
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        projects: { include: { files: true } },
      },
    });

    return res.status(201).json({ room });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create room';
    return res.status(500).json({ error: message });
  }
};

export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { idOrCode } = req.params;

    const room = await prisma.room.findFirst({
      where: {
        OR: [{ id: idOrCode }, { roomCode: idOrCode }],
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        projects: { include: { files: true } },
        tasks: { include: { createdBy: { select: { id: true, name: true } } } },
        messages: {
          take: 50,
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    return res.json({ room });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch room';
    return res.status(500).json({ error: message });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { roomCode } = req.body;
    if (!roomCode) return res.status(400).json({ error: 'Room code required' });

    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.trim().toUpperCase() },
      include: { members: true },
    });

    if (!room) return res.status(404).json({ error: 'Invalid room code' });

    const existingMember = room.members.find((m) => m.userId === userId);
    if (!existingMember) {
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role: 'EDITOR',
        },
      });
    }

    return res.json({ roomId: room.id, roomCode: room.roomCode });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to join room';
    return res.status(500).json({ error: message });
  }
};

export const listPublicRooms = async (_req: AuthRequest, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true } },
      },
    });

    return res.json({ rooms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list public rooms';
    return res.status(500).json({ error: message });
  }
};

export const getUserRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const members = await prisma.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const rooms = members.map((m) => m.room);
    return res.json({ rooms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user rooms';
    return res.status(500).json({ error: message });
  }
};

export const addTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { roomId, title } = req.body;
    if (!roomId || !title) return res.status(400).json({ error: 'Room ID and Title required' });

    const task = await prisma.task.create({
      data: {
        roomId,
        title,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    return res.status(201).json({ task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add task';
    return res.status(500).json({ error: message });
  }
};

export const toggleTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed: Boolean(completed) },
    });

    return res.json({ task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle task';
    return res.status(500).json({ error: message });
  }
};
