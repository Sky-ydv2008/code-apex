import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma';

interface UserPresence {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  cursor?: { line: number; column: number; fileId?: string };
  isMuted?: boolean;
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
        isMuted: true,
      });

      const membersList = Array.from(roomPresence.values());

      // Notify joining user of current active members
      socket.emit('room:members', membersList);

      // Notify other members that user joined
      socket.to(roomId).emit('user:joined', {
        socketId: socket.id,
        user: { userId: user.userId, name: user.name, avatar: user.avatar },
      });

      // Also create a system message in room chat
      try {
        const sysMsg = await prisma.message.create({
          data: {
            roomId,
            userId: user.userId,
            message: `${user.name} joined the room`,
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
      // Broadcast to all other clients in the room
      socket.to(roomId).emit('code:update', { fileId, content, language });

      // Debounce DB persistence could be added here
      try {
        await prisma.file.update({
          where: { id: fileId },
          data: { content, language: language || undefined },
        });
      } catch {
        // file write non-blocking
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

      try {
        const createdMsg = await prisma.message.create({
          data: {
            roomId,
            userId,
            message,
            type: 'chat',
          },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        });

        io.to(roomId).emit('chat:message', createdMsg);
      } catch (err) {
        console.error('Failed to send chat message:', err);
      }
    });

    socket.on('task:update', (data: { roomId: string; task: unknown }) => {
      io.to(data.roomId).emit('task:update', data.task);
    });

    socket.on('file:tree_change', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('file:tree_change');
    });

    // Voice Chat Signaling Events (WebRTC)
    socket.on('voice:signal', (data: { toSocketId: string; signal: unknown }) => {
      io.to(data.toSocketId).emit('voice:signal', {
        fromSocketId: socket.id,
        signal: data.signal,
      });
    });

    socket.on('voice:state', (data: { roomId: string; isMuted: boolean }) => {
      if (currentRoomId && activeRooms.has(data.roomId)) {
        const presence = activeRooms.get(data.roomId)?.get(socket.id);
        if (presence) {
          presence.isMuted = data.isMuted;
        }
      }
      socket.to(data.roomId).emit('voice:state', {
        socketId: socket.id,
        isMuted: data.isMuted,
      });
    });

    // Anti-Cheat Realtime Proctoring Broadcast
    socket.on('anticheat:alert', (data: { contestId?: string; roomId?: string; eventType: string; strikes: number; name?: string }) => {
      const targetRoom = data.contestId || data.roomId || currentRoomId;
      if (targetRoom) {
        socket.to(targetRoom).emit('anticheat:alert', {
          socketId: socket.id,
          userId: currentUser?.userId,
          name: currentUser?.name || data.name,
          eventType: data.eventType,
          strikes: data.strikes,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const handleLeave = () => {
      if (currentRoomId && activeRooms.has(currentRoomId)) {
        const roomPresence = activeRooms.get(currentRoomId)!;
        roomPresence.delete(socket.id);

        if (roomPresence.size === 0) {
          activeRooms.delete(currentRoomId);
        } else {
          socket.to(currentRoomId).emit('user:left', { socketId: socket.id, userId: currentUser?.userId });
        }
      }
    };

    socket.on('room:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};
