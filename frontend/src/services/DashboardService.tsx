'use client';
import { useAlert } from "@/context/AlertContext";
import axiosInstance from "@/utils/AxiosInstance";

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useDashboardService = () =>{
    const { showAlert } = useAlert()

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

    const getTotalSummary = async() => {
        try {
            const response = await axiosInstance.get(`/dashboard/summary`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const getBillPaymentSummary = async (period: string) => {
        try {
            const response = await axiosInstance.get(`dashboard/bill-payment-summary?monthPeriod=${period}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const getBillRecent = async (page: number, limit: number) => {
        try {
            const response = await axiosInstance.get(`dashboard/bill-recent?page=${page}&limit=${limit}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }
    

    return{
        getTotalSummary,
        getBillPaymentSummary,
        getBillRecent
    }
}

export default useDashboardService