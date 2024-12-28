import fs from 'fs';
import FormData from 'form-data';
import { logError, logMessage, LogLevel } from '../utils/logHelpers';
import { AxiosInstance } from 'axios';
import CircuitBreaker from 'opossum';
import { circuitBreakerConfig } from '../config/circuitBrakerConfig';

export const createFaceEncodingService = (apiUrl: string, httpClient: AxiosInstance) => {
  const fetchFaceEncodings = async (filePath: string): Promise<number[][]> => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await httpClient.post(apiUrl, formData, {
        headers: formData.getHeaders(),
      });
      return response.data || [];
    } catch (error: any) {
      logError(error, 'Circuit Breaker - Face Linker');
      throw new Error('Face Linker is currently unavailable');
    }
  };

  const breaker = new CircuitBreaker(fetchFaceEncodings, circuitBreakerConfig);

  breaker.on('open', () => logMessage(LogLevel.Warn, 'Circuit breaker opened'));
  breaker.on('halfOpen', () => logMessage(LogLevel.Info, 'Circuit breaker is half-open, testing service'));
  breaker.on('close', () => logMessage(LogLevel.Info, 'Circuit breaker closed, service restored'));

  return async (filePath: string): Promise<number[][]> => {
    try {
      return await breaker.fire(filePath);
    } catch (error) {
      logError(error, 'Circuit Breaker - Face Linker');
      throw new Error('Face Linker is currently unavailable');
    }
  };
};