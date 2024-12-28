import { createFileProcessor } from '../../src/utils/fileProcessorHelpers';
import CircuitBreaker from 'opossum';
import { logMessage, logError, LogLevel } from '../../src/utils/logHelpers';
import { isValidMimeType } from '../../src/utils/fileUtils';

jest.mock('opossum', () => {
  return jest.fn().mockImplementation(() => ({
    fire: jest.fn((fileData) => saveFileMock(fileData)),
    on: jest.fn(),
  }));
});

jest.mock('../../src/utils/fileUtils', () => ({
  isValidMimeType: jest.fn(),
}));

jest.mock('../../src/utils/logHelpers', () => ({
  logMessage: jest.fn(),
  logError: jest.fn(),
  LogLevel: {
    Warn: 'warn',
    Info: 'info',
  },
}));

let saveFileMock: jest.Mock;
let mockFileQueries: any;

describe('createFileProcessor', () => {
  let mockDb: any;
  let mockLogger: any;
  let mockFaceEncodingService: jest.Mock;

  beforeEach(() => {
    mockDb = {};
    mockLogger = { warn: jest.fn(), info: jest.fn() };
    mockFaceEncodingService = jest.fn();
    saveFileMock = jest.fn().mockResolvedValue(undefined);
    mockFileQueries = { saveFile: saveFileMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('processes valid files successfully', async () => {
    const { processUploadedFiles } = createFileProcessor(
      mockDb,
      mockLogger,
      mockFaceEncodingService,
      mockFileQueries
    );

    (isValidMimeType as jest.Mock).mockReturnValue(true);
    mockFaceEncodingService.mockResolvedValue([[0.1, 0.2], [0.3, 0.4]]);

    const files = [
      { originalname: 'file1.jpg', mimetype: 'image/jpeg', path: '/path/file1.jpg' } as Express.Multer.File,
      { originalname: 'file2.jpg', mimetype: 'image/jpeg', path: '/path/file2.jpg' } as Express.Multer.File,
    ];

    const results = await processUploadedFiles(files, 'test-session-id');

    expect(results).toEqual([
      { file: 'file1.jpg', status: 'success' },
      { file: 'file2.jpg', status: 'success' },
    ]);
    expect(saveFileMock).toHaveBeenCalledTimes(2);
    expect(saveFileMock).toHaveBeenCalledWith({
      filePath: '/path/file1.jpg',
      encodings: [[0.1, 0.2], [0.3, 0.4]],
      sessionId: 'test-session-id',
      createdAt: expect.any(Date),
    });
    expect(saveFileMock).toHaveBeenCalledWith({
      filePath: '/path/file2.jpg',
      encodings: [[0.1, 0.2], [0.3, 0.4]],
      sessionId: 'test-session-id',
      createdAt: expect.any(Date),
    });
  });

  it('handles invalid file types', async () => {
    const { processUploadedFiles } = createFileProcessor(
      mockDb,
      mockLogger,
      mockFaceEncodingService,
      mockFileQueries
    );

    (isValidMimeType as jest.Mock).mockReturnValue(false);

    const files = [
      { originalname: 'file1.exe', mimetype: 'application/x-msdownload', path: '/path/file1.exe' } as Express.Multer.File,
    ];

    const results = await processUploadedFiles(files, 'test-session-id');

    expect(results).toEqual([
      {
        file: 'file1.exe',
        status: 'failed',
        error: 'Invalid MIME type: application/x-msdownload',
      },
    ]);
    expect(mockLogger.warn).toHaveBeenCalledWith('Invalid file type: file1.exe');
    expect(saveFileMock).not.toHaveBeenCalled();
  });

  it('handles file processing failures', async () => {
    const { processUploadedFiles } = createFileProcessor(
      mockDb,
      mockLogger,
      mockFaceEncodingService,
      mockFileQueries
    );

    (isValidMimeType as jest.Mock).mockReturnValue(true);
    mockFaceEncodingService.mockRejectedValue(new Error('Encoding error'));

    const files = [
      { originalname: 'file1.jpg', mimetype: 'image/jpeg', path: '/path/file1.jpg' } as Express.Multer.File,
    ];

    const results = await processUploadedFiles(files, 'test-session-id');

    expect(results).toEqual([
      {
        file: 'file1.jpg',
        status: 'failed',
        error: 'Encoding error',
      },
    ]);
    expect(logError).toHaveBeenCalledWith(expect.any(Error), 'Error processing file: file1.jpg');
  });

  it('logs Circuit Breaker events', () => {
    const circuitBreakerOnMock = jest.fn();
    (CircuitBreaker as unknown as jest.Mock).mockImplementation(() => ({
      fire: jest.fn(),
      on: circuitBreakerOnMock,
    }));

    createFileProcessor(mockDb, mockLogger, mockFaceEncodingService, mockFileQueries);

    expect(circuitBreakerOnMock).toHaveBeenCalledWith('open', expect.any(Function));
    expect(circuitBreakerOnMock).toHaveBeenCalledWith('halfOpen', expect.any(Function));
    expect(circuitBreakerOnMock).toHaveBeenCalledWith('close', expect.any(Function));

    const openCallback = circuitBreakerOnMock.mock.calls.find(([event]) => event === 'open')?.[1];
    if (openCallback) openCallback();

    expect(logMessage).toHaveBeenCalledWith(LogLevel.Warn, 'Circuit breaker for saveFile opened');
  });
});