'use client'
import { useAlert } from "@/context/AlertContext";
import config from "@/utils/config";
// import axiosInstance from "@/utils/AxiosInstance";
import axios from "axios";

interface BodyLogin{
    email: string,
    password: string
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useAuthService = () =>{
    const { showAlert } = useAlert()
    const API = config.BACKEND_URL

    const handleError = (error: unknown) =>{
        const typedError = error as ErrorResponse;
        if(typedError?.response){
            if(Array.isArray(typedError?.response?.data?.message)){
                typedError?.response?.data?.message?.forEach(element => {
                    showAlert({
                        variant: "error",
                        title: "Error!",
                        message: element,
                      })
                });
            }else{
                showAlert({
                    variant: "error",
                    title: "Error!",
                    message: typedError?.response?.data?.message || "Unknown error!",
                })
            }
        }else{
            showAlert({
                variant: "error",
                title: "Error!",
                message: typedError?.message || "Server error!",
              })

        }
        throw error
    }

    const login = async(body: BodyLogin) => {
        try {
            const response = await axios.post(`${API}/auth/login`, body)
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }
    return{
        login
    }
}

export default useAuthService