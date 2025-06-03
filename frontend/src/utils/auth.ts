'use client'
import axiosInstance from './AxiosInstance';
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react';

interface DecodedInterface {
  sub: number;  // user id
  email: string;
  name: string;
  role: string;
  exp: number;  // expiration time
  iat: number;  // issued at
}

interface ErrorProps {
  response: {
    status: number
    data: {
      message: string
    }
  }
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const getTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return { accessToken, refreshToken };
  }
  return { accessToken: null, refreshToken: null };
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedInterface>(token);
    // Buffer time untuk access token 2 detik
    const bufferTime = 2 * 1000; // 2 detik dalam milidetik
    return decoded.exp ? (decoded.exp * 1000) < (Date.now() + bufferTime) : true;
  } catch {
    return true;
  }
};


let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async (): Promise<string> => {
  // Prevent multiple refresh requests
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const { refreshToken } = getTokens();

  if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
    clearTokens();
    window.location.href = '/login?error=No refresh token available';
    throw new Error('No refresh token available');
  }

  isRefreshing = true;
  refreshPromise = performRefresh(refreshToken);

  try {
    const newAccessToken = await refreshPromise;
    return newAccessToken;
  } catch (error) {
    console.error('Refresh failed:', error);
    clearTokens();
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const performRefresh = async (refreshToken: string): Promise<string> => {
  try {
    console.log('Attempting to refresh token...');
    const response = await axiosInstance.post(`auth/refresh`, { token: refreshToken });
    console.log('Refresh response:', response);

    const accessToken = response.data?.data?.access_token
    const newRefreshToken = response.data?.data?.refresh_token

    if (!accessToken || !newRefreshToken) {
      console.log('Invalid token response structure');
      throw new Error('Invalid token response structure');
    }

    setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (errorType: unknown) {
    const error = errorType as ErrorProps
    console.error('Refresh token error:', error);
    
    // If refresh fails due to expired/invalid token, don't retry
    if (error.response?.status === 401) {
      console.log('Refresh token invalid/expired on server');
    }
    
    throw error;
  }
};

export const logout = async () => {
  try {
    const { accessToken } = getTokens();
    if (accessToken) {
      try {
        const response = await axiosInstance.post(
          `auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response;
      } catch (logoutError) {
        console.log('Error during server logout:', logoutError);
        // Continue with local cleanup even if server logout fails
      }
    }
  } catch (error) {
    console.log('Error logging out:', error);
  } finally {
    clearTokens();
    window.location.href = '/login';
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.config) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      // If this is a refresh token request that failed, redirect immediately
      if (originalRequest.url?.includes('auth/refresh')) {
        clearTokens();
        const errorMessage = error.response?.data?.message || 'Session expired';
        window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
        return Promise.reject(error);
      }

      // For other requests, try to refresh only if we haven't tried before
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (errorType: unknown) {
          const refreshError = errorType as ErrorProps
          // If refresh fails, redirect immediately
          clearTokens();
          const errorMessage = refreshError.response?.data?.message || 'Authentication failed';
          window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
          return Promise.reject(refreshError);
        }
      } else {
        // If we've already tried to refresh and still getting 401, redirect
        clearTokens();
        const errorMessage = error.response?.data?.message || 'Session expired';
        window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.log('Access forbidden - insufficient permissions');
      window.location.href = '/unauthorized';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

const useAuth = () => {
  const [decodedUser, setDecodedUser] = useState<DecodedInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeToken = async () => {
    try {
      const { accessToken } = getTokens();
      if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
        setDecodedUser(null);
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }

      // Check if token is expired
      if (isTokenExpired(accessToken)) {
        console.log('Access token expired, attempting refresh...');
        try {
          const newAccessToken = await refreshAccessToken();
          const newDecoded = jwtDecode<DecodedInterface>(newAccessToken);
          setDecodedUser(newDecoded);
        } catch (error: unknown) {
          console.error('Token refresh failed in useAuth:', error);
          setDecodedUser(null);
          clearTokens();
          window.location.href = '/login';
          return;
        }
      } else {
        // Token is still valid
        const decoded = jwtDecode<DecodedInterface>(accessToken);
        setDecodedUser(decoded);
      }
    } catch (error: unknown) {
      console.error('Error in decodeToken:', error);
      setDecodedUser(null);
      clearTokens();
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  return {
    user: decodedUser,
    isLoading,
    isAuthenticated: !!decodedUser,
    refreshUser: decodeToken,
  };
};

export default useAuth;