export const uploadFilesDoc = {
    '/sessions/{sessionId}/upload': {
      post: {
        tags: ['Files'],
        summary: 'Upload files for face encoding',
        description: 'Handles file uploads for a specific session and processes the files to extract face encodings.',
        parameters: [
          {
            in: 'path',
            name: 'sessionId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'ID of the session',
            example: 'session-12345',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'The file to be uploaded',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Files uploaded and processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Status message of the upload operation',
                      example: 'File processing completed successfully',
                    },
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          file: {
                            type: 'string',
                            description: 'The name of the uploaded file',
                            example: 'image1.jpg',
                          },
                          status: {
                            type: 'string',
                            description: 'Processing status of the file',
                            example: 'success',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'No files uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      description: 'Error message',
                      example: 'No files uploaded',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Session not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      description: 'Error message',
                      example: 'Session not found',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      description: 'Error message',
                      example: 'Internal Server Error',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };