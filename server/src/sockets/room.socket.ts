import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma';

interface UserPresence {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  cursor?: { line: number; column: number; fileId?: string };
}

// In-memory active room presence map: roomId -> Map<socketId, UserPresence>
const activeRooms = new Map<string, Map<string, UserPresence>>();

export const setupRoomSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentUser: { userId: string; name: string; avatar?: string } | null = null;

    socket.on('room:join', async (data: { roomId: string; user: { userId: string; name: string; avatar?: string } }) => {
      const { roomId, user } = data;
      currentRoomId = roomId;
      currentUser = user;

      socket.join(roomId);

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Map());
      }
      const roomPresence = activeRooms.get(roomId)!;
      roomPresence.set(socket.id, {
        socketId: socket.id,
        userId: user.userId,
        name: user.name,
        avatar: user.avatar,
      });

      const membersList = Array.from(roomPresence.values());

      // Notify joining user of current active members
      socket.emit('room:members', membersList);

      // Notify other members that user joined
      socket.to(roomId).emit('user:joined', {
        user,
        members: membersList,
      });

      // Also create a system message in room chat
      try {
        const sysMsg = await prisma.message.create({
          data: {
            roomId,
            userId: user.userId,
            message: `${user.name} joined the room.`,
            type: 'system',
          },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        });
        io.to(roomId).emit('chat:message', sysMsg);
      } catch {
        // System message failure non-blocking
      }
    });

    socket.on('code:update', async (data: { roomId: string; fileId: string; content: string; language?: string }) => {
      const { roomId, fileId, content, language } = data;

      // Broadcast immediately to peers
      socket.to(roomId).emit('code:update', { fileId, content, language, updatedBy: socket.id });

      // Debounced / async persist to DB
      try {
        await prisma.file.update({
          where: { id: fileId },
          data: {
            content,
            ...(language ? { language } : {}),
          },
        });
      } catch (err) {
        console.warn('File autosave warning:', err);
      }
    });

    socket.on('code:cursor', (data: { roomId: string; fileId: string; cursor: { line: number; column: number } }) => {
      const { roomId, fileId, cursor } = data;
      if (currentRoomId && activeRooms.has(roomId)) {
        const presence = activeRooms.get(roomId)?.get(socket.id);
        if (presence) {
          presence.cursor = { ...cursor, fileId };
        }
      }
      socket.to(roomId).emit('code:cursor', {
        socketId: socket.id,
        userId: currentUser?.userId,
        name: currentUser?.name,
        fileId,
        cursor,
      });
    });

    socket.on('chat:send', async (data: { roomId: string; userId: string; message: string }) => {
      const { roomId, userId, message } = data;
      if (!message.trim()) return;

      try {
        const chatMsg = await prisma.message.create({
          data: {
            roomId,
            userId,
            message: message.trim(),
            type: 'chat',
          },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        });

        io.to(roomId).emit('chat:message', chatMsg);
      } catch (err) {
        console.error('Chat error:', err);
      }
    });

    socket.on('task:update', (data: { roomId: string; task: any }) => {
      io.to(data.roomId).emit('task:update', data.task);
    });

    socket.on('file:tree_change', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('file:tree_change');
    });

    const handleLeave = () => {
      if (currentRoomId && activeRooms.has(currentRoomId)) {
        const roomPresence = activeRooms.get(currentRoomId)!;
        roomPresence.delete(socket.id);

        const remainingMembers = Array.from(roomPresence.values());
        if (remainingMembers.length === 0) {
          activeRooms.delete(currentRoomId);
        } else {
          socket.to(currentRoomId).emit('user:left', {
            socketId: socket.id,
            user: currentUser,
            members: remainingMembers,
          });
        }
      }
    };

    socket.on('room:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
