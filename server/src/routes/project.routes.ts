import { Router } from 'express';
import {
  createFile,
  updateFile,
  deleteFile,
  renameFile,
  exportProject,
} from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/files', authenticateToken, createFile);
router.put('/files/:fileId', authenticateToken, updateFile);
router.delete('/files/:fileId', authenticateToken, deleteFile);
router.patch('/files/:fileId/rename', authenticateToken, renameFile);
router.get('/:projectId/export', exportProject);

export default router;
