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
import { AppRegistrationIcon, DeleteIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "../ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import useRoomService from "@/services/RoomService";
import { useAlert } from "@/context/AlertContext";
import Spinner from "../ui/spinner/Spinner";
import Pagination from "../tables/Pagination";
import LoadingTable from "../tables/LoadingTable";
import useFacilityService from "@/services/FacilityService";
import MultiSelect from "../form/MultiSelect";
import IconDisplay from "../ui/icon/IconDisplay";

interface FormInterface{
  roomNumber: number | null,
  status: string
  price: number | null,
  capacity: number | null,
  floor: number | null,
  description: string,
  facilityIds: number[] | []
}

interface ResponseRoom{
  id: number,
  roomNumber: number,
  status: string
  price: number,
  capacity: number,
  floor: number,
  description: string,
  facilityIds: number[] | [],
  facilities: ResponseFacility[]
}

interface ResponseFacility{
  id: number,
  name: string,
  icon: string
}

interface PaginationPops{
  currentPage: number,
  limitPerPage: number,
  totalPage: number
}

interface FormErrors{
  roomNumber: string,
  floor: string,
  capacity: string,
  price: string,
  status: string,
}

export default function Kamar() {
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false
  })
  const { showAlert } = useAlert()
  const { getAllRooms, createRoom, updateRoomById, deleteRoomById } = useRoomService()
  const { getSelectionFacilities } = useFacilityService()
  const [roomsData, setRoomsData] = useState<[]>([])
  const [optionsFacility, setOptionsFacility] = useState([])
  const [pagination, setPagination] = useState<PaginationPops>({
    currentPage: 1,
    limitPerPage: 10,
    totalPage: 1
  })
  const [showModal, setShowModal] = useState({
    type: "",
    add: false,
    update: false,
    delete: false
  })
  const [roomId, setRoomId] = useState<number>(0)
  const [form, setForm] = useState<FormInterface>({
    roomNumber: null,
    status: "",
    price: null,
    capacity: null,
    floor: null,
    description: "",
    facilityIds: []
  }) 
  const [formErrors, setFormErrors] = useState<FormErrors>({
    roomNumber: "",
    floor: "",
    capacity: "",
    price: "",
    status: ""
  })

  const fetchFacilities = async() => {
    try {
      const response = await getSelectionFacilities()
      const options = response?.data?.data.map((data: ResponseFacility)=>{
        return{
          value: data.id.toString(),
          text: data.name,
          selected: true
        }
      })
      setOptionsFacility(options)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRooms = async() => {
    try {
      const response = await getAllRooms(pagination.currentPage, pagination.limitPerPage)
      setRoomsData(response?.data.data)
      setPagination({
        currentPage: response?.data.meta.page,
        limitPerPage: response?.data.meta.limit,
        totalPage: response?.data.meta.totalPages,
      })
    } catch (error) {
      console.error(error)
    } 
  }

  useEffect(()=>{
    const fetchFirstLoad = async() =>{
      try {
        setLoading({ ...loading, fetch: true })
        await fetchRooms()
        await fetchFacilities()
      } catch (error) {
        console.error("Error first load: ", error)
      } finally{
        setLoading({...loading, fetch: false })
      }
    }

    fetchFirstLoad()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(()=>{
    fetchRooms()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limitPerPage])

  const handleOpenModal = (type: string, data: ResponseRoom | ResponseRoom) => {
    if(type==='update'){
      setRoomId(data.id)
      setForm({
        roomNumber: data.roomNumber,
        status: data.status,
        price: Number(data.price),
        capacity: data.capacity,
        floor: data.floor,
        description: data.description, 
        facilityIds:  data.facilities.map(data=>data.id)
      }) //clicked form
    }else if(type==='add'){
      setForm({
        roomNumber: null,
        status: "kosong",
        price: null,
        capacity: null,
        floor: null,
        description: "", 
        facilityIds: []
      }) //empty form
    }else if(type==='delete'){
      setForm({
        ...form,
        roomNumber: data.roomNumber
      })
      setRoomId(data.id)
    }
    setShowModal({ ...showModal, type: type, [type]: true})
  }

  const handleCloseModal = (type: string) => {
    setShowModal({ ...showModal, type: "", [type]: false})
    setFormErrors({
      roomNumber: "",
      floor: "",
      capacity: "",
      price: "",
      status: ""
    })
  }

  const handleSubmit = async() => {
    try {
      setLoading({ ...loading, submit: true})
      // Form validation
      const errors: FormErrors = {
        roomNumber: "",
        floor: "",
        capacity: "",
        price: "",
        status: "",
      };
      if (!form.roomNumber) errors.roomNumber = "Nomor kamar wajib diisi.";
      if (!form.floor) errors.floor = "Lantai wajib diisi.";
      if (!form.capacity) errors.capacity = "Kapasitas wajib diisi.";
      if (!form.price) errors.price = "Harga wajib diisi.";
      if (!form.status) errors.status = "Status wajib diisi.";

      // Check if any error message exists
      const hasErrors = Object.values(errors).some((msg) => msg !== "");

      if (hasErrors) {
        setFormErrors(errors);
        return;
      }

      // API process
      const response = showModal.type === "add" ? await createRoom(form) : await updateRoomById(Number(roomId), form)
      handleCloseModal(showModal.type)
      showAlert({
        variant: "success",
        title: "Sukses!",
        message: response?.data?.message,
      })
      fetchRooms()
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, submit: false})
    }
  }

  const optionsStatus = [
    { label: "Kosong", value: "kosong" },
    { label: "Terisi", value: "terisi" },
    { label: "Nonaktif", value: "nonaktif" },
  ]

  const handleDelete = async() => {
    try {
      setLoading({...loading, submit: true})
      const response = await deleteRoomById(roomId)
      handleCloseModal(showModal.type)
      showAlert({
        variant: "success",
        title: "Sukses!",
        message: response?.data?.message,
      })
      fetchRooms()
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({...loading, submit: false})
    }
  }
  
  const renderModal = (type: string) => {
    if(type==='add' || type==='update'){
      return(
        <Modal
            parentClass="md:px-40 px-10"
            isOpen={showModal.add || showModal.update}
            onClose={()=>handleCloseModal(type)}
            className="w-full 2xl:w-100"
          >
          <Card>
            <CardHeader>{ type==='add' ? "Tambah" : "Ubah"} Kamar</CardHeader>
            <CardBody>
                <div className="mb-4">
                  <Label required>Nomor Kamar</Label>
                  <Input
                    defaultValue={form.roomNumber?.toString()}
                    onChange={(e)=>{
                      setFormErrors({...formErrors, roomNumber: ""})
                      setForm({...form, roomNumber: Number(e.target.value)})
                    }}
                    error={formErrors.roomNumber !== ""}
                  />
                  { formErrors?.roomNumber && <Label className="text-red-500 font-light">{formErrors.roomNumber}</Label>}
                </div>
                <div className="mb-4">
                  <Label required>Letak (lantai)</Label>
                  <Input 
                    onChange={(e)=>{
                      setFormErrors({...formErrors, floor: ""})
                      setForm({...form, floor: Number(e.target.value)})
                    }}
                    defaultValue={form.floor?.toString()}
                    error={formErrors.floor !== ""}
                  />
                  { formErrors?.floor && <Label className="text-red-500 font-light">{formErrors.floor}</Label>}
                </div>
                <div className="mb-4">
                  <Label required>Kapasitas</Label>
                  <Input
                    defaultValue={form.capacity?.toString()}
                    onChange={(e)=>{
                      setFormErrors({...formErrors, capacity: ""})
                      setForm({ ...form, capacity: Number(e.target.value)})
                    }}
                    error={formErrors.capacity !== ""}
                  />
                  { formErrors?.capacity && <Label className="text-red-500 font-light">{formErrors.capacity}</Label>}
                </div>
                <div className="mb-4">
                  <Label required>Harga</Label>
                  <Input
                    defaultValue={form.price?.toString()}
                    onChange={(e)=>{
                      setFormErrors({...formErrors, price: ""})
                      setForm({ ...form, price: Number(e.target.value)})
                    }}
                    error={formErrors.price !== ""}
                  />
                  { formErrors?.price && <Label className="text-red-500 font-light">{formErrors.price}</Label>}
                </div>
                <div className="mb-4">
                  <Label>Deskripsi</Label>
                  <Input
                    defaultValue={form.description?.toString()}
                    onChange={(e)=>{
                      setForm({ ...form, description: e.target.value})
                    }}
                  />
                </div>
                <div className="mb-4">
                  <Label>Fasilitas</Label>
                  <MultiSelect
                    label=""
                    placeholder="Pilih fasilitas"
                    options={optionsFacility}
                    defaultSelected={form?.facilityIds?.map(String)}
                    onChange={(selectedString)=>{
                      setForm({ ...form, facilityIds: selectedString.map(Number)})
                    }}
                  />
                </div>
                { type==="update" && (
                  <div className="mb-4">
                    <Label>Status</Label>
                    <Select 
                      placeholder="Pilih status"
                      options={optionsStatus} 
                      onChange={(e)=>{
                        setFormErrors({...formErrors, status: ""})
                        setForm({...form, status: e})
                      }}
                      defaultValue={optionsStatus.find((opt)=>opt.value === form.status?.toString())?.value}
                    />
                    { formErrors?.status && <Label className="text-red-500 font-light">{formErrors.status}</Label>}
                  </div> )}
            </CardBody>
            <CardBody>
              <div className="flex justify-end gap-4">
                <Button type="button" onClick={()=>handleCloseModal(type)} className="border-1 py-2 px-5 bg-gray-400 text-white hover:bg-gray-600">Kembali</Button>
                <Button 
                  type="button" 
                  disabled={loading.submit} 
                  onClick={handleSubmit} 
                  className="border-1 py-2 px-5 bg-green-500 text-white hover:bg-green-700"
                >
                    { loading.submit && <Spinner/> }
                    {type==='add' ? "Tambah" : "Simpan"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </Modal>
      )
    } else if(type==='delete'){
      return(
        <Modal
          isOpen={showModal.delete}
          onClose={()=>handleCloseModal(type)}
         
        >
          <Card className="">
            <CardHeader>
              <div>
                Apakah yakin ingin menghapus Kamar No. {form.roomNumber}?
              </div>
            </CardHeader>
            <CardBody>
              <div  className="flex justify-end items-center gap-4">
                <Button type="button" onClick={()=>handleCloseModal(type)} className="border-1 py-2 px-5 bg-gray-400 text-white hover:bg-gray-600">Kembali</Button>
                <Button 
                  type="button" 
                  disabled={loading.submit} 
                  onClick={handleDelete} 
                  className="border-1 py-2 px-5 bg-green-500 text-white hover:bg-green-700"
                >
                    { loading.submit && <Spinner/> }
                    Hapus
                </Button>
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
      <Card >
        <CardHeader>
          <Button onClick={()=>handleOpenModal('add', form as ResponseRoom)} className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Kamar
          </Button>
        </CardHeader>
        {/* <CardBody className="min-h-[calc(100vh-200px)]"> */}
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-">
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[10px]"
                    
                  >
                    No
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[10px]"
                  >
                    Nomor Kamar
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[10px]"
                  >
                    Letak (Lantai)
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[10px]"
                  >
                    Kapasitas
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Harga
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Deskripsi
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Fasilitas
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Status
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
                { (roomsData.length !== 0 && !loading.fetch) && roomsData?.map((data: ResponseRoom, index: number)=>{
                  return(
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{(pagination.currentPage-1)*pagination.totalPage + index+1}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                          { data.roomNumber.toString().padStart(2, '0') }
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.floor}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.capacity}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        {Number(data.price)?.toLocaleString('id-ID',{
                          style: 'currency',
                          currency: 'IDR'
                        })}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        {data.description}
                      </TableCell>
                      <TableCell className="px-5 sm:px-6 text-center dark:text-white text-theme-sm py-4 ">
                        <div className="flex gap-4 items-center flex-wrap">
                          { data?.facilities?.map((data: ResponseFacility, index: number)=>{
                            return(
                              // <div key={index} className="flex bg-gray-200 rounded-[200px] px-2 py-0 gap-2">
                                <Badge color="light" key={index} startIcon={ <IconDisplay iconName={data.icon} className="text-gray-700 " />}>
                                  {data.name}
                                </Badge>
                              // </div>
                            )
                          })}

                        </div>

                      </TableCell>
                      <TableCell className="px-5 sm:px-6 text-center dark:text-white text-theme-sm ">
                        <Badge color={ data.status==='nonaktif' ? 'dark' : data.status==='terisi' ? 'success' : data.status==='kosong' ? 'info' : 'light'}>
                          {data.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="flex justify-center gap-4">
                          <Button className="bg-blue-500" onClick={()=>handleOpenModal('update', data)}><AppRegistrationIcon/></Button>
                          <Button className="bg-red-500" onClick={()=>handleOpenModal('delete', data)}><DeleteIcon/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            { loading.fetch && (
                <div className="py-10 text-center flex w-full text-gray-400">
                  <LoadingTable/>
                </div>
              )}
              { (roomsData.length === 0 && !loading.fetch) && (
                <div className="py-10 text-center flex justify-center text-gray-400 w-full">
                  Data kamar tidak ditemukan
                </div>
              )}
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPage}
            onPageChange={(e)=>{
              setPagination({...pagination, currentPage: e})
            }}
            showLimit
            onLimitChange={(e)=>{
              setPagination({ ...pagination, limitPerPage: e, currentPage: 1})
            }}
            limitPerPage={pagination.limitPerPage}
            options={[10, 25, 50]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
