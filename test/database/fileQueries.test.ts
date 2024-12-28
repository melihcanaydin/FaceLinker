import { createFileQueries } from "../../src/database/fileDatabaseQueries";

describe("fileQueries", () => {
  let mockDb: jest.Mocked<any>;
  let fileQueries: ReturnType<typeof createFileQueries>;

  beforeEach(() => {
    mockDb = jest.fn().mockReturnValue({
      insert: jest.fn(),
      select: jest.fn(),
      where: jest.fn(),
    });

    fileQueries = createFileQueries(mockDb);
  });

  afterEach(() => jest.clearAllMocks());

  it("should save a file to the database", async () => {
    const fileData = {
      filePath: "/uploads/image1.jpg",
      encodings: [[0.1, 0.2], [0.3, 0.4]],
      sessionId: "test-session-id",
      createdAt: new Date("2024-12-08T12:00:00Z"),
    };

    mockDb().insert.mockResolvedValueOnce(undefined);

    await fileQueries.saveFile(fileData);

    expect(mockDb).toHaveBeenCalledWith("files");
    expect(mockDb().insert).toHaveBeenCalledWith({
      file_path: "/uploads/image1.jpg",
      encodings: JSON.stringify([[0.1, 0.2], [0.3, 0.4]]),
      session_id: "test-session-id",
      created_at: new Date("2024-12-08T12:00:00Z"),
    });
  });

  it("should get files by session ID from the database", async () => {
    const sessionId = "test-session-id";
    const mockFiles = [
      { file_path: "/uploads/image1.jpg", encodings: "[[0.1, 0.2], [0.3, 0.4]]" },
      { file_path: "/uploads/image2.jpg", encodings: "[[0.5, 0.6], [0.7, 0.8]]" },
    ];

    mockDb = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(mockFiles),
      }),
    });

    fileQueries = createFileQueries(mockDb);

    const result = await fileQueries.getFilesBySessionId(sessionId);

    expect(mockDb).toHaveBeenCalledWith("files");
    expect(mockDb().select).toHaveBeenCalledWith("file_path", "encodings");
    expect(mockDb().select().where).toHaveBeenCalledWith("session_id", sessionId);
    expect(result).toEqual(mockFiles);
  });
});