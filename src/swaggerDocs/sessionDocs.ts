export const createSessionDoc = {
    '/sessions': {
      post: {
        tags: ['Sessions'],
        summary: 'Create a new session',
        description: 'This endpoint creates a new session for tracking uploaded files.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: {
                    type: 'string',
                    description: 'The ID of the customer for whom the session is being created.',
                    example: 'customer-12345',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Session created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: 'The unique ID of the created session.',
                      example: '4b1fc256-92c2-4338-9352-89255c297bad',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request. Customer ID is required.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Customer ID is required',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error. Failed to create session.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to create session',
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
  
  export const getSessionSummaryDoc = {
    '/sessions/{sessionId}/summary': {
      get: {
        tags: ['Sessions'],
        summary: 'Retrieve session summary',
        description: 'Get a summary of files uploaded for a specific session by its ID.',
        parameters: [
          {
            in: 'path',
            name: 'sessionId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'The ID of the session.',
            example: '4b1fc256-92c2-4338-9352-89255c297bad',
          },
        ],
        responses: {
          200: {
            description: 'Session summary retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: 'The ID of the session.',
                      example: '4b1fc256-92c2-4338-9352-89255c297bad',
                    },
                    summary: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          filePath: {
                            type: 'string',
                            description: 'Path to the uploaded file.',
                            example: '/uploads/image1.jpg',
                          },
                          encodings: {
                            type: 'array',
                            items: {
                              type: 'number',
                            },
                            description: 'Encodings extracted from the file.',
                            example: [0.1, 0.2, 0.3],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Session not found or no files uploaded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Session not found or no files uploaded',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error. Failed to retrieve session summary.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to retrieve session summary',
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