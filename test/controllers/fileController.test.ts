import { uploadFiles } from "../../src/controllers/fileController";

describe("fileController", () => {
    let mockDb: jest.Mock;
    let mockLogger: jest.Mocked<any>;
    let mockProcessUploadedFiles: jest.Mock;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        mockDb = jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
                first: jest.fn().mockResolvedValue({ session_id: "test-session-id" }),
            }),
        });

        mockLogger = { warn: jest.fn(), info: jest.fn(), error: jest.fn() };
        mockProcessUploadedFiles = jest.fn();

        mockReq = { params: { sessionId: "test-session-id" }, files: [] };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => jest.clearAllMocks());

    it("should process uploaded files and return results", async () => {
        // Arrange
        mockReq.files = [{ originalname: "file1.jpg" }, { originalname: "file2.jpg" }];
        const mockResults = [
            { file: "file1.jpg", status: "success" },
            { file: "file2.jpg", status: "failed" },
        ];
        mockProcessUploadedFiles.mockResolvedValueOnce(mockResults);

        // Act
        const handler = uploadFiles(mockDb, mockLogger, mockProcessUploadedFiles);
        await handler(mockReq, mockRes);

        // Assert
        expect(mockDb).toHaveBeenCalledWith("sessions");
        expect(mockProcessUploadedFiles).toHaveBeenCalledWith(mockReq.files, "test-session-id");
        expect(mockLogger.warn).toHaveBeenCalledWith("Some files failed to process for session: test-session-id");
        expect(mockLogger.info).toHaveBeenCalledWith("Processed files for session: test-session-id");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "File processing completed with some failures",
            results: mockResults,
        });
    });
});