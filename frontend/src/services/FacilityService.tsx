'use client';
import { useAlert } from "@/context/AlertContext";
import { getTokens } from "@/utils/auth";
import axiosInstance from "@/utils/AxiosInstance";

interface BodyForm{
    name: string,
    description: string,
    icon: string
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useFacilityService = () =>{
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

    const getAllFacilities = async(page: string | number, limit: string | number) => {
        try {
            const response = await axiosInstance.get(`facilities?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const getSelectionFacilities = async() => {
        try {
            const response = await axiosInstance.get(`facilities/selection`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createFacility = async(body: BodyForm) => {
        try {
            const response = await axiosInstance.post('facilities', body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updateFacilityById = async(id: number, body: BodyForm) => {
        try {
            const response = await axiosInstance.patch(`facilities/${id}`, body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deleteFacilityById = async(id: number) => {
        try {
            const response = await axiosInstance.delete(`facilities/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    return{
        getAllFacilities,
        getSelectionFacilities,
        createFacility,
        updateFacilityById,
        deleteFacilityById
    }
}

export default useFacilityService