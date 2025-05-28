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

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const getTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    return { accessToken, refreshToken };
  }
  console.log('diluar if')
  return { accessToken: null, refreshToken: null };
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedInterface>(token);
    return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
  } catch {
    return true;
  }
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken || refreshToken === 'undefined') {
    clearTokens();
    // window.location.href = '/login';
    throw new Error('No refresh token available');
  }

  try {
    const response = await axiosInstance.post(`auth/refresh`, {
      token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;
    if (!access_token || !refresh_token) {
      throw new Error('Invalid token response');
    }

    setTokens(access_token, refresh_token);
    return access_token;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

export const logout = async () => {
  try {
    const { accessToken } = getTokens();
    if (accessToken) {
      const decoded = jwtDecode<DecodedInterface>(accessToken);
      const response = await axiosInstance.post(
        `auth/logout`,
        { userId: decoded.sub },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
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

    // Jika error bukan dari axios atau tidak ada config
    if (!error.config) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearTokens();
        // if (window.location.pathname !== '/login') {
        //   window.location.href = '/login';
        // }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
      return Promise.reject(error);
    }

    // Handle network error
    if (!error.response) {
      console.error('Network Error:', error);
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
      if (accessToken) {
        const decoded = jwtDecode<DecodedInterface>(accessToken);
        
        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          const newAccessToken = await refreshAccessToken();
          const newDecoded = jwtDecode<DecodedInterface>(newAccessToken);
          setDecodedUser(newDecoded);
        } else {
          setDecodedUser(decoded);
        }
      } else {
        setDecodedUser(null);
      }
    } catch (error) {
      console.error('Token decode error:', error);
      setDecodedUser(null);
      clearTokens();
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
  };
};

export default useAuth;