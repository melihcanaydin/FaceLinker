import { createSession, getSessionSummary } from '../../src/controllers/sessionManagementController';
import { container } from '../../src/config/dependencyContainer';
import { Request, Response } from 'express';

jest.mock('../../src/config/dependencyContainer', () => ({
  container: {
    sessionQueries: {
      createSession: jest.fn(),
    },
    fileQueries: {
      getFilesBySessionId: jest.fn(),
    },
    logger: {
      error: jest.fn(),
    },
  },
}));

jest.mock('../../src/utils/responseHelpers', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

const { sendSuccess, sendError } = require('../../src/utils/responseHelpers');

describe('SessionController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session successfully', async () => {
      const mockSessionId = 'test-session-id';
      (container.sessionQueries.createSession as jest.Mock).mockResolvedValue(mockSessionId);

      const req = { body: { customerId: 'test-customer' } } as Request;
      const res = {} as Response;

      await createSession()(req, res);

      expect(container.sessionQueries.createSession).toHaveBeenCalledWith('test-customer');
      expect(sendSuccess).toHaveBeenCalledWith(res, { sessionId: mockSessionId });
    });

    it('should return 400 if customerId is missing', async () => {
      const req = { body: {} } as Request;
      const res = {} as Response;

      await createSession()(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, 'Customer ID is required');
      expect(container.sessionQueries.createSession).not.toHaveBeenCalled();
    });

    it('should return 500 if an error occurs', async () => {
      (container.sessionQueries.createSession as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = { body: { customerId: 'test-customer' } } as Request;
      const res = {} as Response;

      await createSession()(req, res);

      expect(container.logger.error).toHaveBeenCalledWith('Failed to create session', expect.any(Object));
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Failed to create session');
    });
  });

  describe('getSessionSummary', () => {
    it('should retrieve session summary successfully', async () => {
      const mockFiles = [
        { file_path: '/path/to/file1', encodings: [[0.1, 0.2]] },
        { file_path: '/path/to/file2', encodings: [[0.3, 0.4]] },
      ];
      (container.fileQueries.getFilesBySessionId as jest.Mock).mockResolvedValue(mockFiles);

      const req = { params: { sessionId: 'test-session-id' } } as unknown as Request;
      const res = {} as Response;

      await getSessionSummary()(req, res);

      expect(container.fileQueries.getFilesBySessionId).toHaveBeenCalledWith('test-session-id');
      expect(sendSuccess).toHaveBeenCalledWith(res, {
        sessionId: 'test-session-id',
        summary: [
          { filePath: '/path/to/file1', encodings: [[0.1, 0.2]] },
          { filePath: '/path/to/file2', encodings: [[0.3, 0.4]] },
        ],
      });
    });

    it('should return 404 if no files are found', async () => {
      (container.fileQueries.getFilesBySessionId as jest.Mock).mockResolvedValue([]);

      const req = { params: { sessionId: 'test-session-id' } } as unknown as Request;
      const res = {} as Response;

      await getSessionSummary()(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, 'Session not found or no files uploaded');
    });

    it('should return 500 if an error occurs', async () => {
      (container.fileQueries.getFilesBySessionId as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = { params: { sessionId: 'test-session-id' } } as unknown as Request;
      const res = {} as Response;

      await getSessionSummary()(req, res);

      expect(container.logger.error).toHaveBeenCalledWith('Failed to retrieve session summary', expect.any(Object));
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Failed to retrieve session summary');
    });
  });
});