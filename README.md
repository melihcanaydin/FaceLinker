# FaceLinker

![Node.js](https://img.shields.io/badge/Node.js-14.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Knex](https://img.shields.io/badge/Knex.js-Supported-orange)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13.x-blue)
![API](https://img.shields.io/badge/API-RESTful-red)
![Jest](https://img.shields.io/badge/Testing-Jest-brightgreen)
![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-yellow)

## Introduction

This project implements a backend API to manage sessions and process face encoding from uploaded images. It supports the following functionalities:

- Creating user sessions to track uploaded files.
- Handling file uploads with encoding extraction.
- Storing and retrieving metadata for uploaded files.
- Logging and monitoring service health with circuit breakers.

The system is designed to be modular and scalable, allowing integration with additional services or APIs in the future.

## Why I Made These Choices

### 1. API-Driven Design

The project follows an API-driven architecture where each route serves a specific purpose:

- POST /sessions: Creates a session for tracking uploads.
- POST /sessions/:sessionId/upload: Handles image uploads, processes them, and extracts encodings.
- GET /sessions/:sessionId/summary: Retrieves uploaded file metadata for a session.

This separation of routes ensures flexibility and simplifies debugging while maintaining clear responsibilities.

### 2. Folder Structure and Naming

The folder structure adheres to clean architecture principles:

- config: Centralized configuration management (e.g., database, file upload, circuit breaker settings).
- controllers: Handles request/response logic for sessions and file operations.
- database: Contains database initialization and query definitions for sessions and files.
- services: Encapsulates business logic for face encoding.
- utils: Provides reusable utilities (e.g., logging, file processing helpers).
- routes: Defines HTTP routes for various endpoints.

This structure ensures separation of concerns, making the codebase easy to maintain and extend.

### 3. Circuit Breaker for Reliability

A circuit breaker mechanism is implemented to handle failures gracefully:

- It prevents excessive retries when services like face encoding API are down.
- Automatically resets after a defined timeout period, restoring functionality.

### 4. Error Handling

Error handling ensures meaningful feedback is provided to clients:

- Validates inputs and files before processing.
- Catches and logs internal errors using a centralized logger.
- Returns descriptive error messages to the client.

### 5. Dependency Injection and appContainer.ts

The project uses a Dependency Injection (DI) pattern, centralized in appContainer.ts, for managing the application’s dependencies. This approach provides several benefits:

- Centralized Dependency Management: appContainer.ts acts as a single source of truth for initializing and managing services, utilities, and configurations such as database connections, file processors, and logging.
- Improved Testability: Dependencies can be easily mocked or replaced during testing, leading to more isolated and reliable tests.
- Scalability: Adding new services or modifying existing ones is straightforward as all dependencies are defined in one place.
- Cleaner Code: Controllers and services do not need to handle the initialization of dependencies themselves, leading to better separation of concerns.

Key Responsibilities of appContainer.ts:

#### 1. Database Initialization:

- Ensures the database connection is properly configured and ready for queries.

#### 2. Service Configuration:

- Initializes services such as the faceEncodingService for processing image encodings.

#### 3. Middleware Setup:

- Configures file upload settings using multer.

#### 4. Logging:

- Provides centralized logging utilities to track application behavior.

Using Dependency Injection via appContainer.ts makes the architecture modular and maintainable, especially for larger applications requiring multiple services and external integrations.

Example Response:

```json
{
  "error": "File not found for processing"
}
```

### API Documentation

This project includes comprehensive API documentation using Swagger. You can access the Swagger UI to explore and test the API endpoints interactively.

##### URL:

- Swagger Documentation: http://localhost:3000/api-docs

##### Features:

- Lists all available endpoints with detailed descriptions.
- Provides example requests and responses.
- Allows you to test endpoints directly from the browser.

#### Endpoints

### 1. POST /sessions

- Description: Creates a new session for tracking uploaded files.
- Request Body:

```json
{ "customerId": "<customer_id>" }
```

- Response:

```json
{ "sessionId": "<unique_session_id>" }
```

### 2. POST /sessions/:sessionId/upload

- Description: Uploads files for a given session and extracts face encodings.
- Request Parameters: sessionId (path parameter).
- Response:

```json
{
  "message": "File processing completed successfully",
  "results": [
    { "file": "image1.jpg", "status": "success" },
    { "file": "image2.jpg", "status": "failed", "error": "Invalid file type" }
  ]
}
```

### 3. GET /sessions/:sessionId/summary

- Description: Retrieves metadata for files uploaded in a session.
- Response:

```json
{
  "sessionId": "<session_id>",
  "summary": [
    {
      "filePath": "/uploads/image1.jpg",
      "encodings": [[0.1, 0.2, ...]]
    }
  ]
}
```

### Future Improvements

This project meets current requirements but could be enhanced further:

#### Backend

#### 1. Extend APIs:

- Add support for batch processing.

#### 2. Add Authentication:

- Implement authentication mechanisms (e.g., OAuth, API keys).

#### 3. Enhance Performance:

- Optimize database queries and implement caching for frequently accessed data.

### How to Run the Project

### Prerequisites

```bash
Ensure you have the following installed:
- Node.js (>=22.x)
- Docker
```

### Environment Variables

Create a .env file in the project root with the following variables:

```bash
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
FACE_ENCODING_API_URL=http://localhost:8000/v1/selfie
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
PORT=3000

DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=facelinker
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### Running the Application

### 1. Navigate to Project Directory

```bash
cd /path/to/your/project
```

### 2. Start the Application

```bash
docker-compose up
```

- If you’ve made changes to the code or Dockerfile, use the --build flag to rebuild the containers:

```bash
docker-compose up --build
```

### 3. Access the API:

- Create Session: http://localhost:3000/sessions
- Upload Files: http://localhost:3000/sessions/:sessionId/upload
- Retrieve Summary: http://localhost:3000/sessions/:sessionId/summary

I am also sharing POSTMAN Collection so you can test it easier.

#### Running Tests

To ensure the system works as expected:

```bash
npm test
```

## Built By

**Melih Can Aydın**
Connect with me on:

- [GitHub](https://github.com/melihcanaydin)
- [LinkedIn](https://www.linkedin.com/in/melihcanaydin/)
