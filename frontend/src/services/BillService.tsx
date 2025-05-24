'use client';
import { useAlert } from "@/context/AlertContext";
import { getTokens } from "@/utils/auth";
import axiosInstance from "@/utils/AxiosInstance";

interface BodyForm{
    billingPeriod: string,
    dueDate: string,
    note?: string,
    occupantId: number
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useBillService = () =>{
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

    const getAllBills = async(page: string | number, limit: string | number) => {
        try {
            const response = await axiosInstance.get(`bills?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }
    
    const getBillById = async(id: number) => {
        try {
            const response = await axiosInstance.get(`bills/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createBill = async(body: BodyForm) => {
        try {
            const response = await axiosInstance.post('bills', body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updateBillById = async(id: number, body: Partial<BodyForm>) => {
        try {
            const response = await axiosInstance.patch(`bills/${id}`, body, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deleteBillById = async(id: number) => {
        try {
            const response = await axiosInstance.delete(`bills/${id}`, {
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
        getAllBills,
        getBillById,
        createBill,
        updateBillById,
        deleteBillById
    }
}

export default useBillService