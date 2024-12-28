import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  uploads: {
    directory: path.resolve(
      process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
    ),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png').split(','),
  },
  api: {
    faceEncodingUrl: process.env.FACE_ENCODING_API_URL || 'http://localhost:8000/v1/selfie',
  },
  database: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'facelinker',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },
};

export const getUploadDir = (): string => config.uploads.directory;
export const getMaxFileSize = (): number => config.uploads.maxFileSize;
export const getAllowedMimeTypes = (): string[] => config.uploads.allowedMimeTypes;
export const getDatabaseConfig = () => config.database;