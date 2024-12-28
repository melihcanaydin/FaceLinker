import { Response } from 'express';

export const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ error: message });
};

export const sendSuccess = (res: Response, data: unknown) => {
    return res.status(200).json(data);
};