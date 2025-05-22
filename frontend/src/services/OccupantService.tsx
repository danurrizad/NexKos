'use client';
import { useAlert } from "@/context/AlertContext";
import { getTokens } from "@/utils/auth";
import axiosInstance from "@/utils/AxiosInstance";
import config from "@/utils/config";
import axios from "axios";

interface BodyForm{
    nik: number | null,
    name: string,
    gender: string,
    phone: string,
    isPrimary: boolean,
    startDate: string,
    roomId: number
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useOccupantService = () =>{
    const { showAlert } = useAlert()
    const { accessToken } = getTokens()

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

    const getAllOccupants = async(page: string | number, limit: string | number) => {
        try {
            const response = await axiosInstance.get(`occupants?page=${page}&limit=${limit}`, {
                // const response = await axios.get(`${config.BACKEND_URL}/rooms?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createOccupant = async(body: BodyForm) => {
        try {
            const response = await axiosInstance.post('occupants', body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updateOccupantById = async(id: number | null, body: Partial<BodyForm>) => {
        try {
            const response = await axiosInstance.patch(`occupants/${id}`, body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deleteOccupantById = async(id: number | null) => {
        try {
            const response = await axiosInstance.delete(`occupants/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const checkOccupantEmail = async(email: string | undefined) => {
            const response = await axios.get(`${config.BACKEND_URL}/users/check-email?email=${email}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
    }

    return{
        getAllOccupants,
        createOccupant,
        updateOccupantById,
        deleteOccupantById,
        checkOccupantEmail
    }
}

export default useOccupantService