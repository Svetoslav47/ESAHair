import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

export default apiClient;
export { AxiosError };

