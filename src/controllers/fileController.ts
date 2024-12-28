import { Request, Response } from 'express';

export const uploadFiles = (
  db: any,
  logger: any,
  processUploadedFiles: (files: Express.Multer.File[], sessionId: string) => Promise<any[]>
) => async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  const uploadedFiles = req.files as Express.Multer.File[];

  if (!uploadedFiles || uploadedFiles.length === 0) {
    logger.warn(`No files uploaded for session: ${sessionId}`);
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const session = await db('sessions').where('session_id', sessionId).first();

    if (!session) {
      logger.warn(`Session not found for session ID: ${sessionId}`);
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const results = await processUploadedFiles(uploadedFiles, sessionId);

    const hasFailures = results.some((result) => result.status === 'failed');
    if (hasFailures) {
      logger.warn(`Some files failed to process for session: ${sessionId}`);
    }

    logger.info(`Processed files for session: ${sessionId}`);
    res.status(200).json({
      message: hasFailures
        ? 'File processing completed with some failures'
        : 'File processing completed successfully',
      results,
    });
  } catch (error) {
    logger.error(`Error processing files for session: ${sessionId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};