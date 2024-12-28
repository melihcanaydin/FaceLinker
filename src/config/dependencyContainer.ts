import path from 'path';
import knex from 'knex';
import { configureUpload } from '../middleware/fileUploadMiddleware';
import { logger } from '../utils/logHelpers';
import { createFaceEncodingService } from '../services/imageEncodingService';
import { createFileProcessor } from '../utils/fileProcessorHelpers';
import { createFileQueries } from '../database/fileDatabaseQueries';
import { createSessionQueries } from '../database/sessionQueries';
import knexConfig from '../knexfile';
import { initializeDatabase } from '../database/initializeDatabase';
import { createHttpClient } from '../utils/httpClient';
import { config } from '../config/config';

const FACE_ENCODING_API_URL = config.api.faceEncodingUrl;
const UPLOAD_DIR = config.uploads.directory;
const MAX_FILE_SIZE = config.uploads.maxFileSize;
const ALLOWED_MIME_TYPES = config.uploads.allowedMimeTypes;

const environment = process.env.NODE_ENV || 'development';

const db = knex(knexConfig[environment]);

const httpClient = createHttpClient(FACE_ENCODING_API_URL, { FaceLinker: 'Face Encoding App' });
const fileQueries = createFileQueries(db);
const sessionQueries = createSessionQueries(db, logger);
const faceEncodingService = createFaceEncodingService(FACE_ENCODING_API_URL, httpClient);

initializeDatabase(db)
  .then(() => logger.info('Database initialized successfully'))
  .catch((error) => {
    logger.error('Database initialization failed', { error });
    process.exit(1);
  });
  
export const container = {
  db,
  logger,
  fileQueries,
  sessionQueries,
  picUpload: configureUpload({
    uploadDir: UPLOAD_DIR,
    maxFileSize: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  }),
  faceEncodingService,
  fileProcessor: createFileProcessor(db, logger, faceEncodingService, fileQueries),
};