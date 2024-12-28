import CircuitBreaker from 'opossum';
import { isValidMimeType } from '../utils/fileUtils';
import { logError, logMessage, LogLevel } from '../utils/logHelpers';
import { circuitBreakerConfig } from '../config/circuitBrakerConfig';

export const createFileProcessor = (
  db: any,
  logger: any,
  faceEncodingService: (filePath: string) => Promise<number[][]>,
  fileQueries: {
    saveFile: (fileData: {
      filePath: string;
      encodings: number[][];
      sessionId: string;
      createdAt: Date;
    }) => Promise<void>;
  }
) => {
  const saveFileBreaker = new CircuitBreaker(fileQueries.saveFile, circuitBreakerConfig);

  saveFileBreaker.on('open', () => logMessage(LogLevel.Warn, 'Circuit breaker for saveFile opened'));
  saveFileBreaker.on('halfOpen', () => logMessage(LogLevel.Info, 'Circuit breaker for saveFile is half-open'));
  saveFileBreaker.on('close', () => logMessage(LogLevel.Info, 'Circuit breaker for saveFile closed'));

  const processUploadedFiles = async (
    files: Express.Multer.File[],
    sessionId: string
  ) => {
    const results = await Promise.all(
      files.map(async (file) => {
        if (!isValidMimeType(file.mimetype)) {
          logger.warn(`Invalid file type: ${file.originalname}`);
          return {
            file: file.originalname,
            status: 'failed',
            error: `Invalid MIME type: ${file.mimetype}`,
          };
        }

        try {
          const encodings = await faceEncodingService(file.path);

          await saveFileBreaker.fire({
            filePath: file.path,
            encodings,
            sessionId,
            createdAt: new Date(),
          });

          logger.info(`File processed successfully: ${file.originalname}`);
          return { file: file.originalname, status: 'success' };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logError(error, `Error processing file: ${file.originalname}`);
          return { file: file.originalname, status: 'failed', error: errorMessage };
        }
      })
    );

    return results;
  };

  return { processUploadedFiles };
};