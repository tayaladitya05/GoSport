import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`,
  withCredentials: true,
});

export default api;
