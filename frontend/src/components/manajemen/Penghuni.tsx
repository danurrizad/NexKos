/* eslint-disable react-hooks/exhaustive-deps */
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
import useOccupantService from "@/services/OccupantService";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import useRoomService from "@/services/RoomService";
import Select from "../form/Select";
import Spinner from "../ui/spinner/Spinner";
import { useAlert } from "@/context/AlertContext";
import LoadingTable from "../tables/LoadingTable";
import Pagination from "../tables/Pagination";
import DatePicker from "../form/date-picker";
import Switch from "../form/switch/Switch";
import { useDebounce } from "@/hooks/useDebounce";

interface Loading{
  fetch: boolean,
  submit: boolean,
  emailCheck: boolean
}
interface ResponseOccupant{
  id: number,
  nik: number,
  name: string,
  gender: string,
  phone: string,
  isPrimary: boolean,
  startDate: string,
  endDate: string,
  room: {
    id: number,
    roomNumber: string
  }
  user:{
    email: string,
  }
}

interface ResponseRooms{
  id: number,
  roomNumber: string
}

interface OptionsRoom{
  label: string,
  value: string
}

interface FormBody{
  nik: number | null,
  name: string,
  gender: string,
  phone: string,
  isPrimary: boolean,
  startDate: string,
  endDate?: string | null,
  roomId: number,
  emailPayer?: string
}
type FormUpdateBody = Partial<FormBody> 
interface FormErrors{
  nik: string,
  name: string,
  gender: string,
  phone: string,
  roomId: string,
  startDate: string,
  emailPayer: string
}

interface ErrorResponse{
  response: {
    data: {
      message: string
    }
  }
}

export default function Penghuni() {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState<Loading>({
    fetch: false,
    submit: false,
    emailCheck: false
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPage: 1,
    limit: 10 
  })
  const [showModal, setShowModal] = useState({
    type: "",
    add: false,
    update: false,
    delete: false
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({
    nik: "",
    name: "",
    gender: "",
    phone: "",
    roomId: "",
    startDate: "",
    emailPayer: ""
  })
  const [originalForm, setOriginalForm] = useState<FormBody>({
    nik: null,
    name: "",
    gender: "",
    phone: "",
    isPrimary: false,
    startDate: "",
    roomId: 0,
    emailPayer: ""
  });
  const [form, setForm] = useState<FormBody>({
    nik: null,
    name: "",
    gender: "",
    phone: "",
    isPrimary: false,
    startDate: "",
    roomId: 0,
    emailPayer: ""
  })
  const [optionsRoom, setOptionsRoom] = useState<OptionsRoom[]>([])
  const optionsGender = [{
    label: "Laki-laki",
    value: "laki-laki"
  },{
    label: "Perempuan",
    value: "perempuan"
  }]
  const debouncedEmail = useDebounce(form.emailPayer, 500);
  const [isChangingEmail, setIsChangingEmail] = useState<boolean>(false)
  const [occupantsData, setOccupantsData] = useState<ResponseOccupant[] | []>([])
  const [occupantId, setOccupantId] = useState<number | null>(null)
  const { getAllOccupants, createOccupant, updateOccupantById, deleteOccupantById, checkOccupantEmail } = useOccupantService()
  const { getSelectionRooms } = useRoomService()

  const fetchOccupants = async() => {
    try {
      const response = await getAllOccupants(pagination.currentPage, pagination.limit)
      setOccupantsData(response?.data?.data)
      setPagination({
        currentPage: response?.data?.meta?.page || 0,
        limit: response?.data?.meta?.limit,
        totalPage: response?.data?.meta?.totalPages || 0,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchOptionsRoom = async() => {
    try {
      const response = await getSelectionRooms()
      const options = response?.data.data.map((data: ResponseRooms)=>{
        return{
          label: data.roomNumber.toString(),
          value: data.id.toString()
        }
      })
      setOptionsRoom(options)
    } catch (error) {
      console.error(error)
    }
  }

  const verificateEmail = async() => {
    try {
      setLoading({ ...loading, emailCheck: true})
      setFormErrors({...formErrors, emailPayer: ""})
      await checkOccupantEmail(form.emailPayer)
    } catch (errorResponse: unknown) {
      const error = errorResponse as ErrorResponse
      if(error?.response?.data?.message === 'email must be an email'){
        setFormErrors({ ...formErrors, emailPayer: "Masukkan email yang valid"})
      }else{
        setFormErrors({ ...formErrors, emailPayer: error?.response?.data?.message})
      }
    } finally{
      setLoading({ ...loading, emailCheck: false})
    }
  }

  useEffect(()=>{
    fetchOptionsRoom()
  }, [])

  useEffect(()=>{
    const fetchFirstLoad = async() => {
      setLoading({ ...loading, fetch: true})
      await fetchOccupants()
      setLoading({ ...loading, fetch: false})
    }

    fetchFirstLoad()
  }, [pagination.currentPage, pagination.limit])

  useEffect(()=>{
    if(form.isPrimary === false){
      setForm({ ...form, emailPayer: ""})
      setFormErrors({ ...formErrors, emailPayer: ""})
    }
  }, [form.isPrimary])

  useEffect(()=>{
    if(form.emailPayer !== undefined && form.emailPayer !== "" && isChangingEmail){
      verificateEmail()
    }
  }, [debouncedEmail])

  // get the only changed field
  const getChangedFields = <K extends keyof FormBody>(
    original: FormBody, 
    current: FormUpdateBody
  ): FormUpdateBody => {
      const changed: FormUpdateBody = {};

      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          const typedKey = key as K;
          if (current[typedKey] !== original[typedKey]) {
            changed[typedKey] = current[typedKey];
          }
        }
      }

      return changed;
  };

  const handleOpenModal = (type: string, data: ResponseOccupant) => {
    setOccupantId(data.id)
    if(type==='add'){
      setForm({
        nik: null,
        name: "",
        gender: "",
        phone: "",
        isPrimary: false,
        roomId: 0,
        startDate: "",
        emailPayer: ""
      })
    }else if(type==='update'){
      const initialForm = {
        nik: Number(data.nik),
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        isPrimary: data.isPrimary,
        startDate: data.startDate.split("T")[0],
        endDate: null,
        roomId: data.room.id,
        emailPayer: data.user?.email
      }
      setForm(initialForm)
      setOriginalForm(initialForm)
    }else if(type==='delete'){
      setForm({
        ...form,
        name: data.name
      })
    }
    setShowModal({ ...showModal, type: type, [type]: true})
  }

  const handleCloseModal = (type: string) => {
    setIsChangingEmail(false)
    setShowModal({ ...showModal, [type]: false, type: ""})
    setFormErrors({ 
      ...formErrors, 
      nik: "",
      name: "",
      gender: "",
      phone: "",
      roomId: "",
      startDate: ""
    })
  }

  const handleSubmit = async() => {
    try {
      setLoading({ ...loading, submit: true})
      // Form validation
      const errors: FormErrors = {
        nik: "",
        name: "",
        gender: "",
        phone: "",
        roomId: "",
        startDate: "",
        emailPayer: form.emailPayer === "" ? "" : formErrors.emailPayer
      };
      if (!form.nik) errors.nik = "NIK wajib diisi.";
      if (!form.name) errors.name = "Nama wajib diisi.";
      if (!form.gender) errors.gender = "Gender wajib dipilih.";
      if (!form.phone) errors.phone = "No HP wajib diisi.";
      if (!form.roomId) errors.roomId = "No Kamar wajib dipilih.";
      if (!form.startDate) errors.startDate = "Tanggal Masuk wajib dipilih.";
      if (!form.emailPayer && form.isPrimary) errors.emailPayer = "Email Pembayar wajib diisi.";

      // Check if any error message exists
      const hasErrors = Object.values(errors).some((msg) => msg !== "");

      if (hasErrors) {
        setFormErrors(errors);
        return;
      }

      
      const updatedFields = getChangedFields(originalForm, form)
      const response = showModal.type === 'add' ? await createOccupant(form) : await updateOccupantById(occupantId, updatedFields)
      handleCloseModal(showModal.type)
      showAlert({
        variant: "success",
        title: "Sukses!",
        message: response?.data?.message,
      })
      fetchOccupants()
      
    } catch (error) {
      console.error(error)
    } finally {
      setLoading({ ...loading, submit: false})
    }
  }

  const handleDelete = async() => {
    try {
      setLoading({ ...loading, submit: true})
      const response = await deleteOccupantById(occupantId)
      showAlert({
        variant: "success",
        title: "Sukses",
        message: response?.data.message
      })
      setShowModal({ ...showModal, type: "", delete: false})
      fetchOccupants()
    } catch (error) {
      console.error(error)
    } finally { 
      setLoading({ ...loading, submit: false})
    }
  }

  const renderModal = (type: string) => {
    if(type==='add' || type==='update'){
      return(
        <Modal
        parentClass="md:px-40 px-10 "
        isOpen={showModal.add || showModal.update}
          onClose={()=>handleCloseModal(type)}
          className="w-full 2xl:w-200"
        >
          <Card>
            <CardHeader>{type==="add" ? "Tambah" : "Ubah"} Penghuni</CardHeader>
            <CardBody>
               <div className="mb-4">
                <Label required>Nama</Label>
                <Input
                  defaultValue={form?.name}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, name: ""})
                    setForm({ ...form, name: e.target.value})
                  }}
                  error={formErrors.name !== ""}
                />
                { formErrors?.name && <Label className="text-red-500 font-light">{formErrors.name}</Label>}
              </div>
              <div className="mb-4">
                <Label required>No Kamar</Label>
                <Select
                  placeholder="Pilih kamar"
                  options={optionsRoom}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, roomId: ""})
                    setForm({ ...form, roomId: Number(e)})
                  }}
                  defaultValue={optionsRoom?.find((opt)=>opt.value === form.roomId.toString())?.value}
                  error={formErrors.roomId !== ""}
                />
                { formErrors?.roomId && <Label className="text-red-500 font-light">{formErrors.roomId}</Label>}
              </div>
              <div className="mb-4">
                <Label>Sebagai Pembayar</Label>
                <div className="flex justify-start items-center gap-20 flex-grow">
                  <Switch
                    label="Ya"
                    onChange={(e)=>{
                      setForm({ ...form, isPrimary: e})
                    }}
                    defaultChecked={form.isPrimary}
                  />
                  <div className={`flex gap-4 items-center grow  ${form.isPrimary ? "relative" : "hidden"}`}>
                    <Label className="shrink-0">Email Pembayar</Label>
                    <div className="w-full">
                      <Input
                        placeholder="Masukkan email akun penghuni"
                        value={form?.emailPayer}
                        type="email"
                        onChange={(e)=>{
                          setIsChangingEmail(true)
                          setFormErrors({...formErrors, emailPayer: ""})
                          setForm({ ...form, emailPayer: e.target.value})
                        }}
                        error={formErrors.emailPayer !== ""}
                        />
                        { loading.emailCheck && (<div className="flex items-center gap-2 text-gray-400"><Spinner/>Verifikasi email...</div>)}
                      { formErrors?.emailPayer && <Label className="text-red-500 font-light">{formErrors.emailPayer}</Label> }
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <Label required>NIK</Label>
                <Input
                  defaultValue={form?.nik?.toString()}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, nik: ""})
                    setForm({ ...form, nik: Number(e.target.value)})
                  }}
                  error={formErrors.nik !== ""}
                />
                { formErrors?.nik && <Label className="text-red-500 font-light">{formErrors.nik}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Gender</Label>
                <Select
                  placeholder="Pilih gender"
                  options={optionsGender}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, gender: ""})
                    setForm({ ...form, gender: e})
                  }}
                  defaultValue={optionsGender?.find((opt)=>opt.value===form?.gender)?.value}
                  error={formErrors.gender !== ""}
                />
                { formErrors?.gender && <Label className="text-red-500 font-light">{formErrors.gender}</Label>}
              </div>
              <div className="mb-4">
                <Label required>No HP</Label>
                <Input
                  defaultValue={form?.phone}
                  type="number"
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, phone: ""})
                    setForm({ ...form, phone: e.target.value})
                  }}
                  error={formErrors.phone !== ""}
                />
                { formErrors?.phone && <Label className="text-red-500 font-light">{formErrors.phone}</Label>}
              </div>
              <div className="mb-4">
                <Label required htmlFor="tanggalMasuk">Tanggal Masuk</Label>
                <DatePicker
                  id="tanggalMasuk"
                  mode="single"
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, startDate: ""})
                    setForm({ ...form, startDate: e ? e[0].toLocaleDateString('en-CA') : "" })
                  }}
                  defaultDate={form.startDate}
                  error={formErrors.startDate !== ""}
                />
                { formErrors?.startDate && <Label className="text-red-500 font-light">{formErrors.startDate}</Label>}
              </div>
              <div className="mb-4">
                <Label htmlFor="tanggalKeluar">Tanggal Keluar</Label>
                <DatePicker
                  id="tanggalKeluar"
                  mode="single"
                  onChange={(e)=>{
                    setForm({ ...form, endDate: e ? e[0].toLocaleDateString('en-CA') : "" })
                  }}
                  defaultDate={form.endDate ? form.endDate : ""}
                />
              </div>
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
    }
    else if(type==='delete'){
      return(
        <Modal
          isOpen={showModal.delete}
          onClose={()=>handleCloseModal(type)}
        >
          <Card>
            <CardHeader>Apakah yakin ingin menghapus Penghuni dengan nama <span className="font-bold">{form.name}</span>?</CardHeader>
            <CardBody>
              <div className="flex justify-end gap-4">
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
      <Card>
        <CardHeader>
          <Button onClick={()=>handleOpenModal('add', form as unknown as ResponseOccupant)} className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Penghuni
          </Button>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[20px]"
                  >
                    No
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nama Penghuni
                  </TableCell>
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
                    Gender
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    NIK
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Kontak
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email Pembayar
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Tanggal Masuk
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Tanggal Keluar
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
                { (occupantsData.length !== 0 && !loading.fetch) && occupantsData?.map((data, index)=>{
                  return(
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{(pagination.currentPage-1)*10 + index+1}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.name}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                          { data.room.roomNumber.toString().padStart(2, '0') }
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.gender.charAt(0).toUpperCase()+data.gender.slice(1)}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.nik}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.phone}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.user?.email || ""}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.startDate.split("T")[0]}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.endDate?.split("T")[0]}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="flex justify-center gap-4">
                          <Button onClick={()=>handleOpenModal('update', data)} className="bg-blue-500"><AppRegistrationIcon/></Button>
                          <Button onClick={()=>handleOpenModal('delete', data)} className="bg-red-500"><DeleteIcon/></Button>
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
            { (occupantsData.length === 0 && !loading.fetch) && (
              <div className="py-10 text-center flex justify-center text-gray-400 w-full">
                Data penghuni tidak ditemukan
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
              setPagination({ ...pagination, limit: e, currentPage: 1})
            }}
            limitPerPage={pagination.limit}
            options={[10, 25, 50]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
