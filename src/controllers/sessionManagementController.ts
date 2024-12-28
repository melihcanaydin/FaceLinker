import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelpers';
import { container } from '../config/dependencyContainer';

export const createSession = () => async (req: Request, res: Response) => {
  const { customerId } = req.body;

  if (!customerId) {
    return sendError(res, 400, 'Customer ID is required');
  }

  try {
    const sessionId = await container.sessionQueries.createSession(customerId);
    return sendSuccess(res, { sessionId });
  } catch (error) {
    container.logger.error('Failed to create session', { error });
    return sendError(res, 500, 'Failed to create session');
  }
};

export const getSessionSummary = () => async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    const files = await container.fileQueries.getFilesBySessionId(sessionId);

    if (!files.length) {
      return sendError(res, 404, 'Session not found or no files uploaded');
    }

    const summary = files.map((file) => ({
      filePath: file.file_path,
      encodings: file.encodings,
    }));

    return sendSuccess(res, { sessionId, summary });
  } catch (error) {
    container.logger.error('Failed to retrieve session summary', { error });
    return sendError(res, 500, 'Failed to retrieve session summary');
  }
};