export const databaseDocs = {
    FilesTable: {
      type: 'object',
      description: 'Schema for the files table.',
      properties: {
        file_path: { type: 'string', description: 'Path to the uploaded file.' },
        encodings: { type: 'string', description: 'JSON string of face encodings.' },
        session_id: { type: 'string', description: 'Session ID associated with the file.' },
        created_at: { type: 'string', format: 'date-time', description: 'Timestamp when the file was created.' },
      },
    },
    SessionsTable: {
      type: 'object',
      description: 'Schema for the sessions table.',
      properties: {
        session_id: { type: 'string', description: 'Unique identifier for the session.' },
        customer_id: { type: 'string', description: 'ID of the customer associated with the session.' },
        created_at: { type: 'string', format: 'date-time', description: 'Timestamp when the session was created.' },
        updated_at: { type: 'string', format: 'date-time', description: 'Timestamp when the session was last updated.' },
      },
    },
  };