import { Response } from 'express';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';
import { sendError } from './responseHelpers';
import fs from 'fs';

const logDirectory = path.join(__dirname, '../../LOGS');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

export enum LogLevel {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

const isTestEnvironment = process.env.NODE_ENV === 'test';

const loggerTransports = [
    new transports.Console(),
    ...(isTestEnvironment
        ? []
        : [
            new transports.DailyRotateFile({
                dirname: logDirectory,
                filename: 'application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
                level: LogLevel.Info,
            }),
            new transports.DailyRotateFile({
                dirname: logDirectory,
                filename: 'error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
                level: LogLevel.Error,
            }),
        ]),
];

export const logger = createLogger({
    level: LogLevel.Info,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
            const metaInfo = meta.meta ? JSON.stringify(meta.meta) : '';
            return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaInfo}`;
        })
    ),
    transports: loggerTransports,
});

export const logMessage = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    logger.log({ level, message, ...(meta ? { meta } : {}) });
};

export const logError = (error: unknown, context: string): void => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`[${context}] ${message}`, { error });
};

export const logAndSendError = (
    res: Response<any, Record<string, any>>,
    error: unknown,
    statusCode = 500,
    context = 'Error',
    meta?: Record<string, unknown>
) => {
    logError(error, context);

    if (meta) {
        logger.error(`[${context}] Detailed Metadata`, { meta });
    }

    sendError(res, statusCode, 'An unexpected error occurred');
};