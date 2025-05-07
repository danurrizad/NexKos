'use client';
import { useAlert } from "@/context/AlertContext";
import { getTokens } from "@/utils/auth";
import axiosInstance from "@/utils/AxiosInstance";
import axios from "axios";

interface BodyForm{
    roomNumber: string,
    floor: number,
    capacity: number,
    price: number,
    status: string
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

    const getAllRooms = async(page: string | number, limit: string | number) => {
        try {
            // const response = await axios.get(`https://21f3-202-169-38-254.ngrok-free.app/rooms?page=${page}&limit=${limit}`, {
            const response = await axiosInstance.get(`rooms?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const createRoom = async(body: BodyForm) => {
        try {
            const response = await axiosInstance.post('api/room', body)
            return response
        } catch (error: unknown) { 
            handleError(error)
        }
    }

    const updateRoomById = async(id: string, body: BodyForm) => {
        try {
            const response = await axiosInstance.put(`api/room/${id}`, body)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    const deleteRoomById = async(id: string) => {
        try {
            const response = await axiosInstance.delete(`api/room/${id}`)
            return response
        } catch (error) {
            handleError(error)
        }
    }

    return{
        getAllRooms,
        createRoom,
        updateRoomById,
        deleteRoomById
    }
}

export default useRoomService