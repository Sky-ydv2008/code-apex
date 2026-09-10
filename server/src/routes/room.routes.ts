import { Router } from 'express';
import {
  createRoom,
  getRoom,
  joinRoom,
  listPublicRooms,
  getUserRooms,
  addTask,
  toggleTask,
} from '../controllers/room.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createRoom);
router.get('/public', listPublicRooms);
router.get('/my-rooms', authenticateToken, getUserRooms);
router.get('/:idOrCode', getRoom);
router.post('/join', authenticateToken, joinRoom);
router.post('/tasks', authenticateToken, addTask);
router.patch('/tasks/:taskId', authenticateToken, toggleTask);

export default router;
