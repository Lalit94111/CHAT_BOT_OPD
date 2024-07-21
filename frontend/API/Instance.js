import axios from 'axios';

const Backend_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: Backend_URL, 
  timeout: 6000, 
  headers: { 
    'Content-Type': 'application/json',
  },
});

export default api

