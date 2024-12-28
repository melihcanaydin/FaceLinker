import fs from 'fs';
import { createFaceEncodingService } from '../../src/services/imageEncodingService';
import axios from 'axios';
import FormData from 'form-data';

jest.mock('fs');
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        post: jest.fn(),
    })),
}));
jest.mock('form-data');

describe('faceEncodingService', () => {
    const mockHttpClient = axios.create() as jest.MockedFunction<typeof axios.create>['prototype'];
    const apiUrl = 'http://mock-api-url';

    beforeEach(() => {
        jest.clearAllMocks();
        (FormData.prototype.append as jest.Mock) = jest.fn();
        (FormData.prototype.getHeaders as jest.Mock) = jest.fn().mockReturnValue({
            'content-type': 'multipart/form-data',
        });
    });

    it('should throw an error if the file does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        await expect(faceEncodingService('/invalid/file/path')).rejects.toThrow(
            'Face Linker is currently unavailable'
        );

        expect(fs.existsSync).toHaveBeenCalledWith('/invalid/file/path');
    });

    it('should throw an error if the API call fails', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        (mockHttpClient.post as jest.Mock).mockRejectedValue(new Error('API error'));
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        await expect(faceEncodingService('/valid/file/path')).rejects.toThrow(
            'Face Linker is currently unavailable'
        );

        expect(fs.existsSync).toHaveBeenCalledWith('/valid/file/path');
        expect(fs.createReadStream).toHaveBeenCalledWith('/valid/file/path');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            apiUrl,
            expect.any(FormData),
            expect.objectContaining({
                headers: { 'content-type': 'multipart/form-data' },
            })
        );
    });

    it('should return face encodings on successful API call', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
            data: [[0.1, 0.2], [0.3, 0.4]],
        });
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        const result = await faceEncodingService('/valid/file/path');

        expect(fs.existsSync).toHaveBeenCalledWith('/valid/file/path');
        expect(fs.createReadStream).toHaveBeenCalledWith('/valid/file/path');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            apiUrl,
            expect.any(FormData),
            expect.objectContaining({
                headers: { 'content-type': 'multipart/form-data' },
            })
        );
        expect(result).toEqual([[0.1, 0.2], [0.3, 0.4]]);
    });

    it('should construct FormData with correct file details', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
            data: [[0.1, 0.2], [0.3, 0.4]],
        });
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        await faceEncodingService('/valid/file/path');

        expect(appendSpy).toHaveBeenCalledWith('file', expect.anything());
    });

    it('should handle large files gracefully', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
            data: [[0.5, 0.6], [0.7, 0.8]],
        });
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        const result = await faceEncodingService('/large/file/path');

        expect(result).toEqual([[0.5, 0.6], [0.7, 0.8]]);
    });

    it('should handle API timeouts', async () => {
        jest.useFakeTimers();
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        (mockHttpClient.post as jest.Mock).mockImplementation(() => {
            return new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 10000));
        });
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        const promise = faceEncodingService('/slow/file/path');

        jest.advanceTimersByTime(5000);
        await expect(promise).rejects.toThrow('Face Linker is currently unavailable');
    });

    it('should integrate file processing and face encoding successfully', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.createReadStream as jest.Mock).mockReturnValue({});
        (mockHttpClient.post as jest.Mock).mockResolvedValue({
            data: [[0.9, 0.8], [0.7, 0.6]],
        });
        const faceEncodingService = createFaceEncodingService(apiUrl, mockHttpClient);

        const result = await faceEncodingService('/valid/file/path');

        expect(result).toEqual([[0.9, 0.8], [0.7, 0.6]]);
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(fs.createReadStream).toHaveBeenCalledTimes(1);
    });
});