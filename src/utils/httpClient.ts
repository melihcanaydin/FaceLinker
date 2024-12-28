import axios, { AxiosInstance } from 'axios';
import { logMessage, logError, LogLevel } from './logHelpers';

export const createHttpClient = (
  baseURL: string,
  defaultHeaders: Record<string, string> = {},
  timeout = 5000
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout,
  });

  client.interceptors.request.use(
    (config) => {
      logMessage(
        LogLevel.Info,
        `HTTP Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      return config;
    },
    (error) => {
      logError(error, 'HTTP Request Error');
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      logMessage(
        LogLevel.Info,
        `HTTP Response: ${response.status} ${response.config.url}`
      );
      return response;
    },
    (error) => {
      const status = error.response?.status || 'Unknown';
      const data = error.response?.data || error.message;
      logError(error, `HTTP Response Error - Status: ${status}`);
      logMessage(LogLevel.Error, `Response Data: ${JSON.stringify(data)}`);
      return Promise.reject(error);
    }
  );

  return client;
};