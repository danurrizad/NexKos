'use client'
import { useAlert } from "@/context/AlertContext";
import axiosInstance from "@/utils/AxiosInstance";
import { setTokens } from "@/utils/auth";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string[] | string;
    };
  };
  message?: string;
}

const useAuthService = () => {
  const { showAlert } = useAlert();

  const handleError = (error: unknown) => {
    const typedError = error as ErrorResponse;
    if (typedError?.response) {
      if (Array.isArray(typedError?.response?.data?.message)) {
        typedError?.response?.data?.message?.forEach(element => {
          showAlert({
            variant: "error",
            title: "Error!",
            message: element,
          });
        });
      } else {
        showAlert({
          variant: "error",
          title: "Error!",
          message: typedError?.response?.data?.message || "Unknown error!",
        });
      }
    } else {
      showAlert({
        variant: "error",
        title: "Error!",
        message: typedError?.message || "Server error!",
      });
    }
    throw error;
  };

  const login = async (body: LoginBody): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>('auth/login', body);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);
      return response.data;
    } catch (error) {
      return handleError(error) as never;
    }
  };

  return {
    login,
  };
};

export default useAuthService;