import axios from 'axios';
import { getApiUrl } from '../utils/config';

const api = axios.create({
    baseURL: `${getApiUrl()}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const token = JSON.parse(userInfo).token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
