import { Knex } from 'knex';

export const createFileQueries = (db: Knex) => {
  const saveFile = async (fileData: {
    filePath: string;
    encodings: number[][];
    sessionId: string;
    createdAt: Date;
  }) => {
    await db('files').insert({
      file_path: fileData.filePath,
      encodings: JSON.stringify(fileData.encodings),
      session_id: fileData.sessionId,
      created_at: fileData.createdAt,
    });
  };

  const getFilesBySessionId = async (sessionId: string) => {
    return await db('files')
      .select('file_path', 'encodings')
      .where('session_id', sessionId);
  };

  return {
    saveFile,
    getFilesBySessionId,
  };
};