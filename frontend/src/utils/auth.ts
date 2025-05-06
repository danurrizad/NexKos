import axios from 'axios';
import axiosInstance from './AxiosInstance';
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react';

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const getTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    window.location.href = '/signin';
    throw new Error('No refresh token available');
  }

  try {
    const response = await axiosInstance.post(`auth/refresh`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;
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
      const response = await axiosInstance.post(
        `auth/logout`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      clearTokens();
      return response
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

// Axios interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 

interface DecodedInterface{
  email: string,
  name: string,
  role: string
}

const useAuth = () => {
  const [decodedUser, setDecodedUser] = useState<DecodedInterface>({
    email: "",
    name: "",
    role: ""
  })
  const decodeToken = async() => {
    try {
      const { accessToken } = getTokens()
      if (accessToken){
        const decoded: DecodedInterface = jwtDecode(accessToken)
        setDecodedUser(decoded)
      }else{
        const newAccessToken = await refreshAccessToken()
        const decoded: DecodedInterface = jwtDecode(newAccessToken)
        setDecodedUser(decoded)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=>{
    decodeToken()
  }, [])

  return { 
    decodedUser
  }
}

export default useAuth