import axios from 'axios';

const api = axios.create({
  baseURL: 'https://utnlibrary-backend-production.up.railway.app',
});

export default api;
