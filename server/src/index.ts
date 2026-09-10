import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import projectRoutes from './routes/project.routes';
import aiRoutes from './routes/ai.routes';
import codeRoutes from './routes/code.routes';
import challengeRoutes from './routes/challenge.routes';
import { setupRoomSockets } from './sockets/room.socket';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CodeCraft AI Server', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/challenges', challengeRoutes);

// Setup Sockets
setupRoomSockets(io);

// Start Server
server.listen(config.port, () => {
  console.log(`🚀 CodeCraft AI Server running on http://localhost:${config.port}`);
  console.log(`📡 Socket.IO real-time server ready`);
});
