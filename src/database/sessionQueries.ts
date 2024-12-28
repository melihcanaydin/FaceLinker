import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export const createSessionQueries = (db: Knex, logger: any) => {
  const createSession = async (customerId: string): Promise<string> => {
    try {
      const sessionId = uuidv4();

      await db('sessions').insert({
        session_id: sessionId,
        customer_id: customerId,
        created_at: new Date(),
      });

      logger.info(`Created session: ${sessionId}`);
      return sessionId;
    } catch (error) {
      logger.error('Error creating session', error);
      throw new Error('Failed to create session');
    }
  };

  const validateSessionExists = async (sessionId: string): Promise<boolean> => {
    const session = await db('sessions')
      .where('session_id', sessionId)
      .first();
    return Boolean(session);
  };

  return {
    createSession,
    validateSessionExists,
  };
};