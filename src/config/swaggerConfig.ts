import swaggerJSDoc from 'swagger-jsdoc';
import { createSessionDoc, getSessionSummaryDoc } from '../swaggerDocs/sessionDocs';
import { uploadFilesDoc } from '../swaggerDocs/fileDocs';
import { databaseDocs } from '../swaggerDocs/databaseSchemaDocs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Face Encoding API',
      version: '1.0.0',
      description: 'API documentation for the Face Linker.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Sessions', description: 'Session management endpoints' },
      { name: 'Files', description: 'File upload and processing endpoints' },
    ],
    paths: {
      ...createSessionDoc,
      ...getSessionSummaryDoc,
      ...uploadFilesDoc,
    },
    components: {
      schemas: {
        FilesTable: databaseDocs.FilesTable,
        SessionsTable: databaseDocs.SessionsTable,
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;