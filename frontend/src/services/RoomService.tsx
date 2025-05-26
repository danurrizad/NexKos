'use client';
import { useAlert } from "@/context/AlertContext";
import axiosInstance from "@/utils/AxiosInstance";

interface BodyForm{
    roomNumber: number | null,
    status: string,
    price: number | null,
    capacity: number | null,
    floor: number | null,
    description: string,
    facilityIds: number[]
}

interface ErrorResponse {
    response?: {
      data?: {
        message?: string[] | string;
      };
    };
    message?: string;
  }

const useRoomService = () =>{
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

    const getAllRooms = async(page: string | number, limit: string | number) => {
        try {
            const response = await axiosInstance.get(`rooms?page=${page}&limit=${limit}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const getSelectionRooms = async() => {
        try {
            const response = await axiosInstance.get(`rooms/selection`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createRoom = async(body: BodyForm) => {
        try {
            const response = await axiosInstance.post('rooms', body)
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updateRoomById = async(id: number, body: BodyForm) => {
        try {
            const response = await axiosInstance.patch(`rooms/${id}`, body)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deleteRoomById = async(id: number) => {
        try {
            const response = await axiosInstance.delete(`rooms/${id}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    return{
        getAllRooms,
        getSelectionRooms,
        createRoom,
        updateRoomById,
        deleteRoomById
    }
}

export default useRoomService