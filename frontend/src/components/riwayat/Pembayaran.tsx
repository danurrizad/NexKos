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
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Spinner from "../ui/spinner/Spinner";
import { useAlert } from "@/context/AlertContext";
import LoadingTable from "../tables/LoadingTable";
import Pagination from "../tables/Pagination";
import usePaymentService from "@/services/PaymentService";
import { AppRegistrationIcon, CurrencyExchangeIcon, DeleteIcon, DevicesIcon, OpenNewIcon, PreviewIcon } from "@/icons";
import Image from "next/image";
import Select from "../form/Select";
import Input from "../form/input/InputField";
import useBillService from "@/services/BillService";
import InputImg from "../form/input/InputImg";
import Badge from "../ui/badge/Badge";

interface Loading{
  fetch: boolean,
  fetchOpt: boolean,
  submit: boolean
}
interface ResponseProps{
  id: number,
  bill: FormBills,
  paymentDate: string,
  amountPaid: string,
  paymentMethod: string,
  note: string,
  paymentProof: string,
  status: string,
  transactionReference: string
}

interface FormBody{
  billId: number,
  paymentDate: string,
  amountPaid: string,
  paymentMethod: string,
  note: string,
  paymentProof: File | null,
  transactionReference: string
}
type FormUpdateBody = Partial<FormBody> 

interface FormErrors{
  billId: string,
  amountPaid: string,
  paymentMethod: string,
  paymentProof: string,
  transactionReference: string
}

interface FormBills{
  id: number,
  billId: number,
  billNumber: string,
  billingPeriod?: string,
  dueDate: string,
  note: string,
  totalAmount: string,
  status: string,
  occupant?: {
    name: string
  },
  room?: {
    roomNumber: string
  }
}

// interface ErrorResponse{
//   response: {
//     data: {
//       message: string
//     }
//   }
// }

interface Options{
  value: string,
  label: string
}

interface ResponseSelectionBill{
  billNumber: string,
  id: number
}

export default function Penghuni() {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState<Loading>({
    fetch: false,
    fetchOpt: false,
    submit: false,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPage: 1,
    limit: 10 
  })
  const [query, setQuery] = useState({
    billNumber: ""
  })
  const [showModal, setShowModal] = useState({
    type: "",
    add: false,
    update: false,
    delete: false,
    preview: false,
    bills: false
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({
    billId: "",
    amountPaid: "",
    paymentMethod: "",
    paymentProof: "",
    transactionReference: ""
  })
  const [originalForm, setOriginalForm] = useState<FormBody>({
    billId: 0,
    paymentDate: "",
    amountPaid: "",
    paymentMethod: "",
    note: "",
    paymentProof: null,
    transactionReference: ""
  });
  const [form, setForm] = useState<FormBody>({
    billId: 0,
    paymentDate: "",
    amountPaid: "",
    paymentMethod: "",
    note: "",
    paymentProof: null,
    transactionReference: ""
  })
  const [formBills, setFormBills] = useState<FormBills>({
    id: 0,
    billId: 0,
    billNumber: "",
    billingPeriod: "",
    dueDate: "",
    note: "",
    totalAmount: "",
    status: ""                        
  })
  const [previewImage, setPreviewImage] = useState<string>("")
  const optionsPaymentMethods = [
    { value: 'tunai', label: 'Tunai'},
    { value: 'transfer', label: 'Transfer'},
    { value: 'qris', label: 'QRIS'},
    { value: 'ovo', label: 'OVO'},
    { value: 'dana', label: 'Dana'}
  ]
  const [optionsBill, setOptionsBill] = useState<Options[]>([])

  const { getBillsSelection } = useBillService()
  const { getAllPayments, createPayment, updatePaymentById, deletePaymentById } = usePaymentService()
  const [paymentsData, setPaymentsData] = useState<ResponseProps[] | []>([])
  const [paymentId, setPaymentId] = useState<number | null>(null)

  const fetchPayments = async() => {
    try {
      const response = await getAllPayments(pagination.currentPage, pagination.limit)
      setPaymentsData(response?.data?.data)
      setPagination({
        currentPage: response?.data?.meta?.page || 0,
        limit: response?.data?.meta?.limit,
        totalPage: response?.data?.meta?.totalPages || 0,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchOptionsBills = async () => {
    try {
      const response = await getBillsSelection(query.billNumber)
      const options = response?.data?.data?.map((data: ResponseSelectionBill)=>{
        return{
          label: data.billNumber,
          value: (data.id).toString()
        }
      })
      setOptionsBill(options)
    } catch (error) {
      console.error(error)
    }
  }


  useEffect(()=>{
    const fetchFirstLoad = async() => {
      setLoading({ ...loading, fetch: true})
      await fetchPayments()
      setLoading({ ...loading, fetch: false})
    }

    fetchFirstLoad()
  }, [pagination.currentPage, pagination.limit])

  useEffect(()=>{
    const fetchFirstLoad = async() => {
      setLoading({ ...loading, fetchOpt: true})
      fetchOptionsBills()
      setLoading({ ...loading, fetchOpt: false})
    }

    
      fetchFirstLoad()
    
  }, [query.billNumber])


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

  // Open Modal and set initial form values
  const handleOpenModal = (type: string, data: ResponseProps) => {
    setPaymentId(data.id)
    if(type==='add'){
      setForm({
        ...form,
        paymentDate: new Date().toLocaleDateString('en-CA')
      })
    }else if(type==='update'){
      const initialForm = {
        ...form,
        billId: data.bill.id,
        paymentDate: data.paymentDate,
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
        note: data.note,
        transactionReference: data.transactionReference
      }
      setPreviewImage(data.paymentProof)
      setForm(initialForm)
      setOriginalForm(initialForm)
    }else if(type==='delete'){
      setFormBills({
        ...formBills,
       billNumber: data.bill.billNumber
      })
    }else if(type==='preview'){
      setPreviewImage(data.paymentProof)
    }else if(type==='bills'){
      setFormBills({
        ...formBills,
        id: data.bill.id,
        billId: data.bill.id,
        billNumber: data.bill.billNumber,
        billingPeriod: data.bill.billingPeriod,
        dueDate: data.bill.dueDate,
        note: data.bill.note,
        totalAmount: data.bill.totalAmount,
        status: data.bill.status
      })
    }
    setShowModal({ ...showModal, type: type, [type]: true})
  }

  // Close Modal and delete all initial value in forms
  const handleCloseModal = (type: string) => {
    setShowModal({ ...showModal, [type]: false, type: ""})
    setPreviewImage("")
    setFormErrors({ 
      billId: "",
      amountPaid: "",
      paymentMethod: "",
      paymentProof: "",
      transactionReference: ""
    })
    setForm({
      billId: 0,
      paymentDate: "",
      amountPaid: "",
      paymentMethod: "",
      note: "",
      paymentProof: null,
      transactionReference: ""
    })
  }

  // Form validation
  const checkIsFormValid = () => {
      const errors: FormErrors = {
        billId: "",
        amountPaid: "",
        paymentMethod: "",
        paymentProof: "",
        transactionReference: ""
      };
      if (!form.billId) errors.billId = "Nomor pembayaran wajib diisi.";
      if (!form.amountPaid) errors.amountPaid = "Jumlah pembayaran wajib diisi.";
      if (!form.paymentMethod) errors.paymentMethod = "Metode pembayaran wajib dipilih.";
      if (!form.paymentProof && !previewImage) errors.paymentProof = "Bukti pembayaran wajib diisi.";
      if (!form.transactionReference) errors.transactionReference = "Nomor referensi transaksi pembayaran wajib diisi.";

      // Check if any error message exists
      const hasErrors = Object.values(errors).some((msg) => msg !== "");
      if (hasErrors) {
        setFormErrors(errors);
        return false;
      }else{
        return true
      }
  }

  const handleSubmit = async() => {
    try {
      setLoading({ ...loading, submit: true})
      if(!checkIsFormValid()){
        return
      }

      const formData = new FormData();

      formData.append("billId", String(form.billId));
      formData.append("paymentDate", form.paymentDate);
      formData.append("amountPaid", form.amountPaid);
      formData.append("paymentMethod", form.paymentMethod);
      formData.append("note", form.note);
      formData.append("transactionReference", form.transactionReference);

      if (form.paymentProof) {
        formData.append("paymentProof", form.paymentProof); 
      }else{
        formData.append("paymentProof", ""); 
      }

      
      const updatedFields = getChangedFields(originalForm, form)
      console.log("updatedFields: ", updatedFields)
      const response = showModal.type === 'add' ? await createPayment(formData) : await updatePaymentById(paymentId, updatedFields)
      handleCloseModal(showModal.type)
      showAlert({
        variant: "success",
        title: "Sukses!",
        message: response?.data?.message,
      })
      fetchPayments()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading({ ...loading, submit: false})
    }
  }

  const handleDelete = async() => {
    try {
      setLoading({ ...loading, submit: true})
      const response = await deletePaymentById(paymentId)
      showAlert({
        variant: "success",
        title: "Sukses",
        message: response?.data.message
      })
      setShowModal({ ...showModal, type: "", delete: false})
      fetchPayments()
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
          className="w-full lg:w-100"
        >
          <Card>
            <CardHeader>{type==="add" ? "Tambah" : "Ubah"} Pembayaran</CardHeader>
            <CardBody>
               <div className="mb-4">
                <Label required={type==='add'}>Nomor Tagihan</Label>
                <Select
                  isDisable={type==='update'}
                  options={optionsBill}
                  placeholder="Pilih nomor tagihan"
                  showSearch={true}
                  placeholderInput="Cari nomor tagihan..."
                  defaultValue={optionsBill?.find(opt=>opt.value === form.billId.toString())?.value}
                  onChange={(val) => {
                    setFormErrors({ ...formErrors, billId: ""})
                    setForm({ ...form, billId: Number(val)})
                  }}
                  isLoading={loading.fetchOpt}
                  onSearchChange={(q)=>{
                    setQuery({ ...query, billNumber: q})
                  }}
                  error={formErrors.billId !== ""}
                />
                { formErrors?.billId && <Label className="text-red-500 font-light">{formErrors.billId}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Jumlah yang Dibayarkan</Label>
                <Input
                  value={form.amountPaid}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, amountPaid: ""})
                    setForm({ ...form, amountPaid: e.target.value})
                  }}
                  error={formErrors.amountPaid !== ""}
                />
                { formErrors?.amountPaid && <Label className="text-red-500 font-light">{formErrors.amountPaid}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Metode Pembayaran</Label>
                <Select
                  options={optionsPaymentMethods}
                  defaultValue={optionsPaymentMethods.find(opt=>opt.value === form.paymentMethod)?.value}
                  onChange={(val)=>{
                    setFormErrors({ ...formErrors, paymentMethod: ""})
                    setForm({ ...form, paymentMethod: val})
                  }}
                  error={formErrors.paymentMethod !== ""}
                />
                { formErrors?.paymentMethod && <Label className="text-red-500 font-light">{formErrors.paymentMethod}</Label>}
              </div>
              <div className="mb-4">
                <Label>Catatan</Label>
                <Input
                  value={form.note}
                  onChange={(e)=>setForm({ ...form, note: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <Label required>Bukti Pembayaran</Label>
                <InputImg
                  type="file"
                  onChange={(e)=>{
                      setFormErrors({ ...formErrors, paymentProof: ""})
                      setForm({ ...form, paymentProof: e?.target?.files?.[0] || null})
                  }}
                  initialPreviewUrl={previewImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${previewImage}` : undefined}
                  error={formErrors.paymentProof !== ""}
                />
                { formErrors?.paymentProof && <Label className="text-red-500 font-light">{formErrors.paymentProof}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Nomor Referensi</Label>
                <Input
                  type="text"
                  placeholder="Nomor referensi yang ada di bukti pembayaran"
                  value={form.transactionReference}
                  onChange={(e)=>{
                    setFormErrors({ ...formErrors, transactionReference: ""})
                    setForm({ ...form, transactionReference: e.target.value})
                  }}
                  error={formErrors.transactionReference !== ""}
                />
                { formErrors?.transactionReference && <Label className="text-red-500 font-light">{formErrors.transactionReference}</Label>}
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
            <CardHeader>Apakah yakin ingin menghapus Pembayaran ini?</CardHeader>
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
    } else if(type==='bills'){
      return(
        <Modal
          isOpen={showModal.bills}
          onClose={()=>handleCloseModal(type)}
          parentClass="md:px-40 px-10 "
          className="w-full lg:w-100"
        >
          <Card>
            <CardHeader>Detail Tagihan</CardHeader>
            <CardBody>
              <div className="mb-4">
                <Label>Nomor Tagihan</Label>
                <p className="bg-gray-100 px-2 rounded-md py-1 w-fit">{formBills.billNumber}</p>
              </div>
              <div className="mb-4">
                <Label>Periode</Label>
                <p>{formBills.billingPeriod}</p>
              </div>
              <div className="mb-4">
                <Label>Tenggat Waktu</Label>
                <p>{formBills.dueDate}</p>
              </div>
              <div className="mb-4">
                <Label>Total</Label>
                <p>{Number(formBills.totalAmount).toLocaleString('id-ID', {
                  style: "currency",
                  currency: "IDR"
                })}</p>
              </div>
              <div className="mb-4">
                <Label>Catatan</Label>
                <p>{formBills.note || "-"}</p>
              </div>
              <div className="mb-4">
                <Label>Status</Label>
                <Badge color={formBills.status === 'lunas' ? 'success' : formBills.status === 'dibayar sebagian' ? 'warning' : 'error'}>
                  {formBills.status.toUpperCase()}
                </Badge>
              </div>
            </CardBody>
          </Card>
        </Modal>
      )
    } else if(type==='preview'){
        return(
            <Modal
                isOpen={showModal.preview}
                onClose={()=>handleCloseModal(type)}
            >
                <Card>
                    <CardHeader>Bukti Pembayaran</CardHeader>
                    <CardBody>
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${previewImage}`}
                          alt="Payment Proof"
                          width={500}
                          height={300}
                          // placeholder="blur"
                          // blurDataURL="/placeholder.jpg" // fallback image shown while loading
                          loading="lazy"
                        />
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
        color={
          paymentMethod==='gateway' ? "info" : 
          paymentMethod==='transfer' ? "success" : 
          paymentMethod==='tunai' ? 'warning' : 
          paymentMethod==='dana' ? "info" : 
          paymentMethod==='qris' ? "light" : 
          paymentMethod==='ovo' ? "success" : 
          "light"} 
        startIcon={
          paymentMethod==='manual' ? <CurrencyExchangeIcon/> : 
          paymentMethod==='transfer' ? <CurrencyExchangeIcon/> : 
          paymentMethod==='tunai' ? <CurrencyExchangeIcon/> : 
          // paymentMethod==='tunai' ? <FileIcon/> : 
          paymentMethod==='gateway' ? <DevicesIcon/> : 
          paymentMethod==='dana' ? <CurrencyExchangeIcon/> : 
          paymentMethod==='qris' ? <CurrencyExchangeIcon/> : 
          paymentMethod==='ovo' ? <CurrencyExchangeIcon/> : 
          ""
        } 
      >
        {paymentMethod.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="">
      { renderModal(showModal.type) }
      <Card>
        <CardHeader>
          <Button onClick={()=>handleOpenModal('add', form as unknown as ResponseProps)} className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Pembayaran
          </Button>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[10px]"
                        >
                            No
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Penghuni
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Nomor Kamar
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[220px]"
                        >
                            Nomor Tagihan
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Tanggal Pembayaran
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Jumlah yang Dibayar
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Metode Pembayaran
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Catatan
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 "
                        >
                            Bukti Pembayaran
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 "
                        >
                            Nomor Referensi
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 "
                        >
                            Action
                        </TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
                { (paymentsData.length !== 0 && !loading.fetch) && paymentsData?.map((data: ResponseProps, index: number)=>{
                  return(
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{(pagination.currentPage-1)*pagination.totalPage + index+1}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.bill?.occupant?.name}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                          { data?.bill?.room?.roomNumber.toString().padStart(2, '0') }
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <Button onClick={()=>handleOpenModal('bills', data)} className="font-normal flex items-center gap-1 justify-between bg-gray-100 px-2 rounded-md">
                          {data?.bill?.billNumber}
                          <OpenNewIcon/>
                        </Button>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.paymentDate}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        {Number(data?.amountPaid).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        })}
                      </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                          {renderPaymentMethodBody(data?.paymentMethod)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.note}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">
                            <Button className="bg-gray-400 hover:bg-gray-500 text-white" onClick={()=>handleOpenModal('preview', data)}><PreviewIcon/></Button>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.transactionReference}</TableCell>
                      {/* <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                        <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                          { data.room.roomNumber.toString().padStart(2, '0') }
                        </div>
                      </TableCell> */}

                      <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">
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
            { (paymentsData.length === 0 && !loading.fetch) && (
              <div className="py-10 text-center flex justify-center text-gray-400 w-full">
                Data riwayat pembayaran tidak ditemukan
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
