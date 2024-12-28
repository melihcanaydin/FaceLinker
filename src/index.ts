import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import sessionRoutes from './routes/sessionAPIRoutes';
import { logMessage, LogLevel } from './utils/logHelpers';
import { container } from "./config/dependencyContainer";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.send('Face Linker is running!');
});

app.use('/sessions', sessionRoutes);

const startServer = async () => {
  try {
    await container.db.raw('SELECT 1+1 AS result');
    logMessage(LogLevel.Info, 'Database connected successfully.');

    app.listen(port, () => {
      logMessage(LogLevel.Info, `Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    logMessage(LogLevel.Error, 'Error during server startup', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
};

startServer();

export { app }