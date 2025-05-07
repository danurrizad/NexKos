'use client'
import React, { useEffect, useState } from "react";
import{
  Card,
  CardHeader,
  CardBody
} from '@/components/card'
import{
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableBody
} from '@/components/ui/table'
import Button from "@/components/ui/button/Button";
import { dataKamar } from '@/services/TableDummy'
import { AppRegistrationIcon, DeleteIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import useRoomService from "@/services/RoomService";

interface FormInterface{
  roomNumber: string,
  floor: number | null,
  capacity: number | null,
  price: number | null,
  status: string
}

export default function Kamar() {
  const [loading, setLoading] = useState({
    fetch: false,
    add: false,
    update: false
  })
  // const { getAllRooms, createRoom, updateRoomById, deleteRoomById } = useRoomService()
  const { getAllRooms } = useRoomService()
  const [roomsData, setRoomsData] = useState<FormInterface | []>([])
  const [limitPerPage, setLimitPerPage] = useState<number>(10)
  const [page, setPage] = useState<number>(1)
  const [showModal, setShowModal] = useState({
    type: "",
    add: false,
    update: false,
  })

  const [form, setForm] = useState<FormInterface>({
    roomNumber: "",
    floor: null,
    capacity: null,
    price: null,
    status: ""
  }) 

  const fetchRooms = async() => {
    try {
      setLoading({ ...loading, fetch: true})
      const response = await getAllRooms(page, limitPerPage)
      setRoomsData(response?.data.data)
      console.log("response room get: ", response)
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, fetch: false})
    }
  }

  useEffect(()=>{
    fetchRooms()
  }, [])

  const handleOpenModal = (type: string) => {
    setShowModal({ ...showModal, type: type, [type]: true})
  }

  const handleCloseModal = (type: string) => {
    setShowModal({ ...showModal, type: "", [type]: false})
  }

  const handleSubmit = async() => {
    try {
      console.log("body to submit", form)
    } catch (error) {
      console.error(error)
    }
  }

  const renderModal = (type: string) => {
    if(type==='add' || type==='update'){
      return(
        <Modal
          isOpen={showModal.add}
          onClose={()=>handleCloseModal(type)}
        >
          <Card>
            <CardHeader>
              { type==='add' ? "Tambah" : "Ubah"} Kamar
            </CardHeader>
            <CardBody>
              <form>
                <div className="mb-4">
                  <Label>Nomor Kamar <span className="text-red-500">*</span></Label>
                  <Input
                    defaultValue={form.roomNumber}
                    onChange={(e)=>setForm({...form, roomNumber: e.target.value})}
                  />
                </div>
                <div className="mb-4">
                  <Label>Letak (lantai)<span className="text-red-500">*</span></Label>
                  <Select 
                    placeholder="Pilih lantai"
                    options={[{label: "1", value: "1"}, {label: "2", value: "2"}]} 
                    onChange={(e)=>setForm({...form, floor: Number(e)})}
                  />
                </div>
                <div className="mb-4">
                  <Label>Kapasitas<span className="text-red-500">*</span></Label>
                  <Input
                    defaultValue={form.capacity?.toString()}
                    onChange={(e)=>setForm({ ...form, capacity: Number(e.target.value)})}
                  />
                </div>
                <div className="mb-4">
                  <Label>Harga<span className="text-red-500">*</span></Label>
                  <Input
                    defaultValue={form.price?.toString()}
                    onChange={(e)=>setForm({ ...form, price: Number(e.target.value)})}
                  />
                </div>
              </form>
            </CardBody>
            <CardBody>
              <div className="flex justify-end gap-4">
                <Button type="button" onClick={()=>handleCloseModal(type)} className="border-1 py-2 px-5 bg-gray-400 text-white hover:bg-gray-600">Kembali</Button>
                <Button type="button" onClick={handleSubmit} className="border-1 py-2 px-5 bg-green-500 text-white hover:bg-green-700">Tambah</Button>
              </div>
            </CardBody>
          </Card>
        </Modal>
      )
    }
  }
  return (
    <div className="">
      { renderModal(showModal.type) }

      <Card className="overflow-x-auto">
        <CardHeader>
          <Button onClick={()=>handleOpenModal('add')} className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Kamar
          </Button>
        </CardHeader>
        <CardBody>
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nomor Kamar
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Letak (Lantai)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Kapasitas
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Harga
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
              { dataKamar.map((data, index)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.roomNumber}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.floorUnit}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.capacity}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm flex justify-center items-center h-full">
                      <Badge color={ data.status==='nonaktif' ? 'dark' : data.status==='terisi' ? 'success' : data.status==='kosong' ? 'info' : 'light'}>
                        {data.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="px-5 py-4 sm:px-6 flex justify-center dark:text-white text-theme-sm">
                      <div 
                        className={`
                          text-center w-fit px-4
                          rounded-sm ${data.status==="nonaktif" ? "bg-gray-300" : data.status==="terisi" ? "bg-green-300" : data.status==="kosong" ? "bg-blue-300" : ""}`}
                        >
                        {data.status.toUpperCase()}
                      </div>
                    </TableCell> */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      {data.price.toLocaleString('id-ID',{
                        style: 'currency',
                        currency: 'IDR'
                      })}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <div className="flex justify-center gap-4">
                        <Button className="bg-blue-500"><AppRegistrationIcon/></Button>
                        <Button className="bg-red-500"><DeleteIcon/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
