import { API_URL } from '@/constants/appConstants';
import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import GetCookie from '@/hooks/getCookie';
import SetCookie from '@/hooks/setCookie';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Refresh token handling
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: AxiosError) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = GetCookie('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            if (isRefreshing) {
                return handleRefreshingState(originalRequest);
            }
            return handleTokenRefresh(originalRequest);
        }
        return Promise.reject(error);
    }
);

// Helper functions
const handleRefreshingState = async (originalRequest: any) => {
    return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
    }).catch(() => {
        window.location.href = '/'; 
    });
};

const handleTokenRefresh = async (originalRequest: any) => {
    isRefreshing = true;
    try {
        const { data } = await axiosInstance.post(`/User/refresh-token`, {}, { withCredentials: true });
        if (data.data) {
            SetCookie('jwt', data.jwtToken);
            processQueue(null, data.jwtToken);
            originalRequest.headers.Authorization = `Bearer ${data.jwtToken}`;
            return axiosInstance(originalRequest);
        }
    } catch (err) {
        processQueue(err as AxiosError, null);
        return Promise.reject(err);
    } finally {
        isRefreshing = false;
    }
};

export default axiosInstance;
