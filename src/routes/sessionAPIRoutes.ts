import { Router } from 'express';
import { createSession, getSessionSummary } from '../controllers/sessionManagementController';
import { uploadFiles } from '../controllers/fileController';
import { container } from '../config/dependencyContainer';

const router = Router();

router.post('/', createSession());
router.post(
    '/:sessionId/upload',
    container.picUpload.array('images', 5),
    uploadFiles(
        container.db,
        container.logger,
        container.fileProcessor.processUploadedFiles
    )
);
router.get('/:sessionId/summary', getSessionSummary());

export default router;