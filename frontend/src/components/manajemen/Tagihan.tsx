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
import { CheckIcon, ScheduleIcon, ErrorCircleIcon, AppRegistrationIcon, DeleteIcon, ReceiptShortIcon } from "@/icons";
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
import Pagination from "../tables/Pagination";
import { useRouter } from "next/navigation";
import { useWindowSize } from "@/hooks/useWindowSize";
import Badge from "../ui/badge/Badge";
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
  paymentMethod: string,
  totalPaid: string
}
interface FormBody{
  id?:number,
  billNumber?: string,
  billingPeriod: string,
  dueDate: string,
  note?: string,
  occupantId: number,
  occupant?: {
    id: number
  }
}

type FormUpdateBody = Partial<FormBody>

interface FormPaymentBody{
  billId: number | null,
  paymentDate: string,
  amountPaid: string,
  paymentMethod: string,
  gatewayName: string,
  note: string,
  paymentProof: File | null,
  transactionReference: string
}

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
  const { width } = useWindowSize()
  const isMobile = width !== undefined && width < 768;
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
    fetchOptions: false
  })
  const router = useRouter()
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
    delete: false,
    detail: false
  })
  const [formPayment, setFormPayment] = useState<FormPaymentBody>({
    billId: null,
    paymentDate: "",
    amountPaid: "",
    paymentMethod: "",
    gatewayName: "",
    note: "",
    paymentProof: null,
    transactionReference: ""
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
      console.log('response bills: ', response)
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
    }else if(type==='detail'){
      setForm({
        ...form,
        billNumber: data.billNumber
      })
      const idBill: number = data?.id || 0
      setFormPayment({
        ...formPayment,
        paymentDate: new Date().toLocaleDateString('en-CA'),
        billId: idBill
      })
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
      const response = showModal.type==='add' ? await createBill(form) : showModal.type==='update' ? await updateBillById(billId, updatedFields) : null
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
                <Label required={type==='add'}>Kamar dan Penghuni</Label>
                <Select
                  options={optionsOccupant}
                  onChange={handleChangeSelectOccupantRoom}
                  error={formErrors.occupantRoom !== ""}
                  placeholder="Pilih kamar dan penghuni"
                  isLoading={loading.fetchOptions}
                  isDisable={showModal.update}
                  defaultValue={optionsOccupant?.find(opt=>opt.value.includes(`OPT-${form?.occupantId}|`))?.value || ""}
                  
                />
                { formErrors?.occupantRoom && <Label className="text-red-500 font-light">{formErrors.occupantRoom}</Label>}
              </div>
              <div>
                <div className="mb-4">
                  <Label required={type==='add'}>Periode Tagihan</Label>
                  <DatePicker
                    id="periodeTagihan"
                    dateFormat="Y-m"
                    mode="month"
                    placeholder="Pilih kamar dan penghuni terlebih dahulu"
                    error={formErrors.billingPeriod !== ""}
                    defaultDate={form.billingPeriod}
                    onChange={handleChangeBillingPeriod}
                    disabled={form.occupantId===0 || !form.occupantId || showModal.update}
                  />
                  { formErrors?.billingPeriod && <Label className="text-red-500 font-light">{formErrors.billingPeriod}</Label>}
                </div>
                <div className="mb-4">
                  <Label required>Jatuh Tempo</Label>
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
          data === 'dibayar sebagian' ? <ScheduleIcon className="text-white bg-gray-500 rounded-full"/> :
          data === 'belum dibayar' ? <ErrorCircleIcon className="text-white bg-red-500 rounded-full"/> : ""
        }
      </div>
    )
  }

  const renderLongStatus = (status: string) => {
    return(
      <Badge color={status === 'lunas' ? 'success' : status === 'dibayar sebagian' ? 'warning' : 'error'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="">
      {renderModal(showModal.type)}
      <Card>
        <CardHeader>
          <Button className="bg-white border-gray-400 border-1 border-solid" onClick={()=>handleOpenModal('add', form)}>
            + Tambah Tagihan
          </Button>
        </CardHeader>
        <CardBody>
          { isMobile ? (
            <>
             {(billsData.length > 0 && !loading.fetch) && billsData.map((data: ResponseBills, index: number)=>{
              return(
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-center font-bold">
                    {data?.billNumber}
                    <div className="flex items-center gap-2">
                        <Button onClick={()=>handleOpenModal('update', data)} className="bg-blue-500 hover:bg-blue-600"><AppRegistrationIcon/></Button>
                        <Button onClick={()=>handleOpenModal('delete', data)} className="bg-red-500 hover:bg-red-600"><DeleteIcon/></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Nomor Kamar</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">{data?.room?.roomNumber}</Label>
                  </div>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Penghuni</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">{data?.occupant?.name}</Label>
                  </div>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Periode</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">{renderBillPeriodBody(data?.billingPeriod)}</Label>
                  </div>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Jatuh Tempo</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">{data?.dueDate}</Label>
                  </div>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Nominal</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">
                      {Number(data?.totalAmount).toLocaleString('id-ID',{
                        style: 'currency',
                        currency: 'IDR'
                      })}
                    </Label>
                  </div>
                  <div className="grid grid-cols-12">
                    <Label className="col-span-5">Status</Label>
                    <Label className="col-span-1">:</Label>
                    <Label className="col-span-6">{renderLongStatus(data?.status)}</Label>
                  </div>
                </CardBody>
                <CardBody className="p-0! overflow-hidden">
                  <Button onClick={()=>router.push(`/manajemen/tagihan/${data.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full h-full py-2 rounded-0!">
                    <ReceiptShortIcon/>
                    Detail Tagihan
                  </Button>
                </CardBody>
              </Card>
              )
             }
             )} 
            </>
          ) : (
            <div className="overflow-x-auto">
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
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Nomor Tagihan
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
                      className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Yang Telah Terbayar
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
                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.billNumber}</TableCell>

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
                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                          {Number(data?.totalPaid)?.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          })}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">{renderBodyStatus(data.status)}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">
                          <div className="flex justify-center gap-4">
                              <Button onClick={()=>router.push(`/manajemen/tagihan/${data.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white"><ReceiptShortIcon/></Button>
                              <Button onClick={()=>handleOpenModal('update', data)} className="bg-blue-500 hover:bg-blue-600"><AppRegistrationIcon/></Button>
                              <Button onClick={()=>handleOpenModal('delete', data)} className="bg-red-500 hover:bg-red-600"><DeleteIcon/></Button>
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
            </div>
          )}
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
