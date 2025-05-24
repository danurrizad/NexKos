'use client'
import React, { useEffect, useState } from "react";
import{
  Card,
  CardBody,
  CardHeader
} from '@/components/card'
import{
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableBody
} from '@/components/ui/table'
import Button from "@/components/ui/button/Button";
import { CheckIcon, ScheduleIcon, ErrorCircleIcon, FileIcon, CurrencyExchangeIcon, DevicesIcon, AppRegistrationIcon, DeleteIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import useBillService from "@/services/BillService";
import LoadingTable from "../tables/LoadingTable";
import { Modal } from "../ui/modal";
import Spinner from "../ui/spinner/Spinner";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DatePicker from "../form/date-picker";
import useOccupantService from "@/services/OccupantService";
import Select from "../form/Select";
import { useAlert } from "@/context/AlertContext";

interface ResponseBills{
  id: number,
  billNumber: string,
  billingPeriod: string,
  dueDate: string,
  note: string,
  occupant: {
    id: number,
    name: string
  },
  room: {
    roomNumber: number
  },
  status: string,
  totalAmount: string,
  paymentMethod: string
}
interface FormBody{
  id?:number,
  billingPeriod: string,
  dueDate: string,
  note?: string,
  occupantId: number,
  occupant?: {
    id: number
  }
}

type FormUpdateBody = Partial<FormBody>

interface FormErrors{
  billingPeriod: string,
  dueDate: string,
  occupantRoom: string
}

interface SelectionOccupantRoom{
  name: string,
  id: number,
  room: {
    roomNumber: string,
    id: number
  },
  startDate: string
}

interface OptionsOccupant{
  label: string,
  value: string,
}

export default function Tagihan() {
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
    fetchOptions: false
  })
  const { showAlert } = useAlert()
  const [billsData, setBillsData] = useState([])
  const [billId, setBillId] = useState<number>(0)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPage: 0,
    limit: 10
  })
  const { getAllBills, createBill, updateBillById, deleteBillById } = useBillService()
  const { getSelectionsOccupants} = useOccupantService()
  const [optionsOccupant, setOptionsOccupant] = useState<OptionsOccupant[]>([])
  const [showModal, setShowModal] = useState({
    type: "",
    add: false,
    update: false,
    delete: false
  })
  const [form, setForm] = useState<FormBody>({
    billingPeriod: "",
    dueDate: "",
    note: "",
    occupantId: 0,
  })
  const [originalForm, setOriginalForm] = useState<FormBody>({
    billingPeriod: "",
    dueDate: "",
    note: "",
    occupantId: 0,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({
    billingPeriod: "",
    dueDate: "",
    occupantRoom: ""
  })

  const fetchBills = async() => {
    try {
      const response = await getAllBills(pagination.currentPage, pagination.limit)
      console.log("response bills: ", response)
      setBillsData(response?.data?.data)
      setPagination({
        currentPage: response?.data?.meta?.page,
        totalPage: response?.data?.meta?.totalPages,
        limit: response?.data?.meta?.limit,
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=>{
    const firstFetch = async() => {
      setLoading({ ...loading, fetch: true})
      await fetchBills()
      setLoading({ ...loading, fetch: false})
    }

    firstFetch()
  }, [pagination.currentPage, pagination.limit])

  const fetchSelectionOccupants = async() => {
    try {
      setLoading({ ...loading, fetchOptions: true})
      const response = await getSelectionsOccupants()
      const options = response?.data.data.map((data: SelectionOccupantRoom)=>{
        return{
          label: `${data.room.roomNumber.toString().padStart(2, '0')} - ${data.name}`,
          value: `OPT-${data.id}|${data.startDate}`
        }
      })
      setOptionsOccupant(options)
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, fetchOptions: false})
    }
  }

  useEffect(()=>{
    fetchSelectionOccupants()
  }, [])

  const handleChangeSelectOccupantRoom = (e: string) => {
    const occupant = e.split("-")[1].split("|")[0]

    const startDate = e.split("|")[1]
    const onlyDate = startDate.split("-")[2]
    const dueDateThisMonth = new Date(new Date().setDate(Number(onlyDate))).toLocaleDateString("en-CA")
    
    const billingPeriod = new Date().toISOString().slice(0, 7)

    setFormErrors({...formErrors, occupantRoom: ""})
    setForm({
      ...form, 
      occupantId: Number(occupant), 
      dueDate: dueDateThisMonth,
      billingPeriod: billingPeriod
    })
  }

  const handleChangeBillingPeriod = (e: Date[]) => {
    const billingPeriod = e[0].toLocaleDateString('en-CA').slice(0, 7)
    const billingMonth = e[0].getMonth()
    const changeDueMonth = new Date(new Date(form.dueDate).setMonth(billingMonth)).toLocaleDateString('en-CA')
    setForm({ 
      ...form, 
      billingPeriod: billingPeriod, 
      dueDate: changeDueMonth
    })
  }

  const handleOpenModal = (type: string, data: ResponseBills | FormBody) => {
    if(type==='update'){
      setBillId(Number(data.id))
      const dataFields = {
        billingPeriod: data?.billingPeriod,
        dueDate: data?.dueDate,
        note: data?.note,
        occupantId: data?.occupant?.id || 0
      }
      setForm(dataFields)
      setOriginalForm(dataFields)
    }else if(type==='delete'){
      setBillId(Number(data.id))
    }
    setShowModal({ ...showModal, [type]: true, type: type})
  }

  const handleCloseModal = (type: string) => {
    setShowModal({ ...showModal, [type]: false, type: type})
    setForm({
      ...form,
      billingPeriod: "",
      dueDate: "",
      occupantId: 0,
      note: ""
    })
  }

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

  const handleSubmit = async() => {
    try {
      setLoading({ ...loading, submit: true})
      console.log("body form: ", form)
       // Form validation
      const errors: FormErrors = {
        occupantRoom: "",
        billingPeriod: "",
        dueDate: "",
      };
      if (!form.occupantId) errors.occupantRoom = "Kamar dan Penghuni wajib diisi.";
      if (!form.billingPeriod) errors.billingPeriod = "Periode tagihan wajib diisi.";
      if (!form.dueDate) errors.dueDate = "Jatuh tempo wajib dipilih.";

      // Check if any error message exists
      const hasErrors = Object.values(errors).some((msg) => msg !== "");

      if (hasErrors) {
        setFormErrors(errors);
        return;
      }

      const updatedFields = getChangedFields(originalForm, form)
      const response = showModal.type==='add' ? await createBill(form) : await updateBillById(billId, updatedFields)
      handleCloseModal(showModal.type)
      showAlert({
        variant: "success",
        title: "Sukses!",
        message: response?.data?.message,
      })
      fetchBills()
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, submit: false})
    }
  }

  const handleDelete = async() => {
    try {
      setLoading({ ...loading, submit: true})
      const response = await deleteBillById(billId)
      showAlert({
        variant: "success",
        title: "Sukses",
        message: response?.data.message
      })
      setShowModal({ ...showModal, type: "", delete: false})
      fetchBills()
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, submit: false})
    }
  }

  const renderModal = (type: string) => {
    if(type==='add' || type==='update'){
      return(
        <Modal
          isOpen={showModal.add || showModal.update}
          onClose={()=>handleCloseModal(type)}
        >
          <Card>
            <CardHeader>{type==='add' ? 'Tambah' : 'Ubah'} Tagihan</CardHeader>
            <CardBody>
              <div className="mb-4">
                <Label>Kamar dan Penghuni <span className="text-red-500">*</span></Label>
                <Select
                  options={optionsOccupant}
                  onChange={handleChangeSelectOccupantRoom}
                  error={formErrors.occupantRoom !== ""}
                  placeholder="Pilih kamar dan penghuni"
                  isLoading={loading.fetchOptions}
                  defaultValue={optionsOccupant?.find(opt=>opt.value.includes(`OPT-${form?.occupantId}|`))?.value || ""}
                />
                { formErrors?.occupantRoom && <Label className="text-red-500 font-light">{formErrors.occupantRoom}</Label>}
              </div>
              <div>
                <div className="mb-4">
                  <Label>Periode Tagihan <span className="text-red-500">*</span></Label>
                  <DatePicker
                    id="periodeTagihan"
                    dateFormat="Y-m"
                    mode="month"
                    placeholder="Pilih kamar dan penghuni terlebih dahulu"
                    error={formErrors.billingPeriod !== ""}
                    defaultDate={form.billingPeriod}
                    onChange={handleChangeBillingPeriod}
                    disabled={form.occupantId===0 || !form.occupantId}
                  />
                  { formErrors?.billingPeriod && <Label className="text-red-500 font-light">{formErrors.billingPeriod}</Label>}
                </div>
                <div className="mb-4">
                  <Label>Jatuh Tempo<span className="text-red-500">*</span></Label>
                  <DatePicker
                    id="jatuhTempo"
                    error={formErrors.dueDate !== ""}
                    defaultDate={form.dueDate}
                    placeholder="Pilih kamar dan penghuni terlebih dahulu"
                    onChange={(e)=>setForm({ ...form, dueDate: e[0].toLocaleDateString('en-CA')})}
                    disabled={form.occupantId===0 || !form.occupantId}
                  />
                  { formErrors?.dueDate && <Label className="text-red-500 font-light">{formErrors.dueDate}</Label>}
                </div>
              </div>
              <div className="mb-4">
                <Label>Deskripsi</Label>
                <Input
                  defaultValue={form.note}
                  onChange={(e)=>setForm({ ...form, note: e.target.value})}
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
    }else if(type==='delete'){
      return(
        <Modal
          isOpen={showModal.delete}
          onClose={()=>handleCloseModal('delete')}
        >
          <Card>
            <CardHeader>Apakah yakin ingin menghapus Tagihan ini?</CardHeader>
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

  const renderPaymentMethodBody = (paymentMethod: string) => {
    if(!paymentMethod) return
    return(
      <Badge 
        color={paymentMethod==='gateway' ? "info" : paymentMethod==='transfer' ? "success" : paymentMethod==='manual' ? 'warning' : "light"} 
        startIcon={paymentMethod==='manual' ? <FileIcon/> : paymentMethod==='transfer' ? <CurrencyExchangeIcon/> : paymentMethod==='gateway' ? <DevicesIcon/> : ""} 
      >
        {paymentMethod}
      </Badge>
    )
  }

  const renderBillPeriodBody = (data: string) => {
    const date = new Date(data)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    })
  }

  const renderBodyStatus = (data: string) => {
    return(
      <div className="flex justify-center">
        { data === 'lunas' ? <CheckIcon className="text-white bg-green-500 rounded-full"/> : 
          data === 'pending' ? <ScheduleIcon className="text-white bg-gray-500 rounded-full"/> :
          data === 'belum dibayar' ? <ErrorCircleIcon className="text-white bg-red-500 rounded-full"/> : ""
        }
      </div>
    )
  }

  return (
    <div className="">
      {renderModal(showModal.type)}
      <Card className="overflow-x-auto">
        <CardHeader>
          <Button className="bg-white border-gray-400 border-1 border-solid" onClick={()=>handleOpenModal('add', form)}>
            + Tambah Tagihan
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
                  No
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
                  Penghuni
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Periode
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                >
                  Jatuh Tempo
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nominal
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Metode Pembayaran
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tanggal Pembayaran
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Nomor Tagihan
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
              { (billsData.length > 0 && !loading.fetch) && billsData.map((data: ResponseBills, index: number)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{index+1}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                        { data?.room?.roomNumber?.toString().padStart(2, '0') }
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.occupant?.name}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm ">{renderBillPeriodBody(data?.billingPeriod)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.dueDate}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      {Number(data?.totalAmount)?.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: "IDR"
                      })}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm flex justify-between items-center">{renderPaymentMethodBody(data.paymentMethod)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{""}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.billNumber}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">{renderBodyStatus(data.status)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">
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
          { (billsData.length === 0 && !loading.fetch) && (
            <div className="py-10 text-center flex justify-center text-gray-400 w-full">
              Data tagihan tidak ditemukan
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
