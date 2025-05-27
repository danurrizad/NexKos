'use client';
import { useAlert } from "@/context/AlertContext";
import axiosInstance from "@/utils/AxiosInstance";

interface BodyForm{
  billId: number,
  amountPaid: string,
  paymentDate: string,
  paymentMethod: string,
  gatewayName: string,
  note: string,
  paymentProof: File | null,
  transactionReference: string
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const usePaymentService = () =>{
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

    const getAllPayments = async(page: string | number, limit: string | number) => {
        try {
            const response = await axiosInstance.get(`payments?page=${page}&limit=${limit}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }
    
    const getPaymentById = async(id: number | null) => {
        try {
            const response = await axiosInstance.get(`payments/${id}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createPayment = async(body: FormData) => {
        try {
            const response = await axiosInstance.post('payments', body)
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updatePaymentById = async(id: number | null, body: Partial<BodyForm>) => {
        try {
            const response = await axiosInstance.patch(`payments/${id}`, body)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deletePaymentById = async(id: number | null) => {
        try {
            const response = await axiosInstance.delete(`payments/${id}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    return{
        getAllPayments,
        getPaymentById,
        createPayment,
        updatePaymentById,
        deletePaymentById
    }
}

export default usePaymentService