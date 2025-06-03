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
import { CurrencyExchangeIcon, DevicesIcon, PreviewIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import useBillService from "@/services/BillService";
import LoadingTable from "../tables/LoadingTable";
import { Modal } from "../ui/modal";
import Spinner from "../ui/spinner/Spinner";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { useAlert } from "@/context/AlertContext";
import InputImg from "../form/input/InputImg";
import usePaymentService from "@/services/PaymentService";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface ResponseBills{
  id: number,
  billNumber: string,
  billingPeriod: string,
  dueDate: string,
  note: string,
  occupant: {
    id: number,
    name: string,
    nik: string,
    gender: string,
    phone: string
  },
  room: {
    roomNumber: number
  },
  status: string,
  totalAmount: string,
  paymentMethod: string
}

interface ResponsePayment{
    id?: number,
    amountPaid: string,
    gatewayName: string,
    note: string,
    paymentDate: string,
    paymentMethod: string,
    paymentProof: string,
    status: string,
    transactionReference: string
}

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

interface FormPaymentErrors{
  amountPaid: string,
  paymentMethod: string,
  paymentProof: string,
  transactionReference: string
}


export default function DetailTagihan() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false,
    fetchOptions: true
  })
  const { showAlert } = useAlert()
  const [billData, setBillData] = useState<ResponseBills>()
  const [paymentsData, setPaymentsData] = useState<ResponsePayment[]>([])
 
  const { getBillById } = useBillService()
  const { createPayment } = usePaymentService()

  const [showModal, setShowModal] = useState({
    type: "",
    bill: false,
    preview: false
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
  
  const [formPaymentErrors, setFormPaymentErrors] = useState<FormPaymentErrors>({
    amountPaid: "",
    paymentMethod: "",
    paymentProof: "",
    transactionReference: ""
  })
  const optionsPaymentMethods = [
    { value: 'tunai', label: 'Tunai'},
    { value: 'transfer', label: 'Transfer'},
    { value: 'qris', label: 'QRIS'},
    { value: 'ovo', label: 'OVO'},
    { value: 'dana', label: 'Dana'}
  ]
  const [previewImage, setPreviewImage] = useState<string>("")

  const fetchBillById = async() => {
    try {
      const response = await getBillById(Number(id))
      console.log('response bill by id: ', response?.data.data)
      setBillData(response?.data?.data)
      setPaymentsData(response?.data?.data?.payments)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=>{
    const firstFetch = async() => {
      setLoading({ ...loading, fetch: true})
      await fetchBillById()
      setLoading({ ...loading, fetch: false})
    }

    firstFetch()
  }, [])



  const handleOpenModal = (type: string, data: Partial<ResponsePayment>) => {
   if(type==='bill'){
      const idBill: number = data?.id || 0
      setFormPayment({
        ...formPayment,
        paymentDate: new Date().toLocaleDateString('en-CA'),
        billId: idBill
      })
    }
    else if(type==='preview'){
      setPreviewImage(data?.paymentProof || "")
    }
    setShowModal({ ...showModal, [type]: true, type: type})
  }

  const handleCloseModal = (type: string) => {
    setShowModal({ ...showModal, [type]: false, type: type})
    setFormPayment({
      ...formPayment,
        amountPaid: "",
        paymentMethod: "",
        gatewayName: "",
        note: "",
        paymentProof: null,
        transactionReference: ""
    })
  }
  


  const handleSubmitPayment = async() => {
    try {
      setLoading({ ...loading, submit: true})
      console.log("form payment: ", formPayment)
      const errors: FormPaymentErrors = {
        amountPaid: "",
        paymentMethod: "",
        paymentProof: "",
        transactionReference: "",
      };
      if (!formPayment.amountPaid) errors.amountPaid = "Jumlah pembayaran wajib diisi.";
      if (!formPayment.paymentMethod) errors.paymentMethod = "Metode pembayaran wajib dipilih.";
      if (!formPayment.paymentProof) errors.paymentProof = "Bukti pembayaran wajib diisi.";
      if (!formPayment.transactionReference) errors.transactionReference = "Nomor referensi pembayaran wajib diisi.";

      // Check if any error message exists
      const hasErrors = Object.values(errors).some((msg) => msg !== "");

      if (hasErrors) {
        setFormPaymentErrors(errors);
        return;
      }
       const formData = new FormData();

      formData.append("billId", String(formPayment.billId));
      formData.append("paymentDate", formPayment.paymentDate);
      formData.append("amountPaid", formPayment.amountPaid);
      formData.append("paymentMethod", formPayment.paymentMethod);
      formData.append("note", formPayment.note);
      formData.append("transactionReference", formPayment.transactionReference);

      if (formPayment.paymentProof) {
        formData.append("paymentProof", formPayment.paymentProof); // ⬅️ File goes here
      }else{
        formData.append("paymentProof", ""); // ⬅️ File goes here
      }

      const response = await createPayment(formData)
      showAlert({
        variant: "success",
        title: "Sukses",
        message: response?.data.message
      })
      handleCloseModal('bill')
      fetchBillById()
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, submit: false})
    }
  }

  const renderModal = (type: string) => {
    if(type==='bill'){
      return(
        <Modal
          parentClass="md:px-40 px-10 "
          isOpen={showModal.bill}
          onClose={()=>handleCloseModal(type)}
          className="w-full lg:w-100"
        >
          <Card>
            <CardHeader>Bayar Tagihan</CardHeader>
            <CardBody>
               <div className="mb-4">
                <Label>Nomor Tagihan</Label>
                <Input
                  disabled
                  defaultValue={billData?.billNumber}
                />
              </div>
              <div className="mb-4">
                <Label required>Jumlah yang Dibayarkan</Label>
                <Input
                  value={formPayment.amountPaid}
                  onChange={(e)=>{
                    setFormPaymentErrors({ ...formPaymentErrors, amountPaid: ""})
                    setFormPayment({ ...formPayment, amountPaid: e.target.value})
                  }}
                  error={formPaymentErrors.amountPaid !== ""}
                />
                { formPaymentErrors?.amountPaid && <Label className="text-red-500 font-light">{formPaymentErrors.amountPaid}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Metode Pembayaran</Label>
                <Select
                  options={optionsPaymentMethods}
                  defaultValue={optionsPaymentMethods.find(opt=>opt.value === formPayment.paymentMethod)?.value}
                  onChange={(val)=>{
                    setFormPaymentErrors({ ...formPaymentErrors, paymentMethod: ""})
                    setFormPayment({ ...formPayment, paymentMethod: val})
                  }}
                  error={formPaymentErrors.paymentMethod !== ""}
                />
                { formPaymentErrors?.paymentMethod && <Label className="text-red-500 font-light">{formPaymentErrors.paymentMethod}</Label>}
              </div>
              <div className="mb-4">
                <Label>Catatan</Label>
                <Input
                  value={formPayment.note}
                  onChange={(e)=>setFormPayment({ ...formPayment, note: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <Label required>Bukti Pembayaran</Label>
                <InputImg
                  type="file"
                  onChange={(e)=>{
                      setFormPaymentErrors({ ...formPaymentErrors, paymentProof: ""})
                      setFormPayment({ ...formPayment, paymentProof: e?.target?.files?.[0] || null})
                  }}
                  error={formPaymentErrors.paymentProof !== ""}
                />
                { formPaymentErrors?.paymentProof && <Label className="text-red-500 font-light">{formPaymentErrors.paymentProof}</Label>}
              </div>
              <div className="mb-4">
                <Label required>Nomor Referensi</Label>
                <Input
                  type="text"
                  placeholder="Nomor referensi yang ada di bukti pembayaran"
                  value={formPayment.transactionReference}
                  onChange={(e)=>{
                    setFormPaymentErrors({ ...formPaymentErrors, transactionReference: ""})
                    setFormPayment({ ...formPayment, transactionReference: e.target.value})
                  }}
                  error={formPaymentErrors.transactionReference !== ""}
                />
                { formPaymentErrors?.transactionReference && <Label className="text-red-500 font-light">{formPaymentErrors.transactionReference}</Label>}
              </div>
            </CardBody>
             <CardBody>
              <div className="flex justify-end gap-4">
                <Button type="button" onClick={()=>handleCloseModal(type)} className="border-1 py-2 px-5 bg-gray-400 text-white hover:bg-gray-600">Kembali</Button>
                <Button 
                  type="button" 
                  disabled={loading.submit} 
                  onClick={handleSubmitPayment} 
                  className="border-1 py-2 px-5 bg-green-500 text-white hover:bg-green-700"
                >
                    { loading.submit && <Spinner/> }
                    Bayar Tagihan
                </Button>
              </div>
            </CardBody>
          </Card>
        </Modal>
      )
    }
    else if(type==='preview'){
      return(
        <Modal
          isOpen={showModal.preview}
          onClose={()=>handleCloseModal(type)}
          parentClass="md:px-40 px-10 "
          className="w-full lg:w-100"
        >
            <Card>
                <CardHeader>Bukti Pembayaran</CardHeader>
                <CardBody>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${previewImage}`}
                      alt="Payment Proof"
                      width={500}
                      height={300}
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

  const renderBillPeriodBody = (data: string) => {
    const date = new Date(data)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    })
  }

  const renderBodyStatus = (status: string) => {
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
        <CardHeader className="font-bold">Detail Tagihan</CardHeader>
        { (billData && !loading.fetch) && (
            <div>
                <CardBody>
                    <div className="grid lg:grid-cols-5 sm:grid-cols-3 grid-cols-2">
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nomor Tagihan</Label>
                            <p>{billData?.billNumber || "-"}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Periode Tagihan</Label>
                            <p>{renderBillPeriodBody(billData?.billingPeriod) || "-"}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tenggat Waktu</Label>
                            <p>{billData?.dueDate || "-"}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total</Label>
                            <p>{Number(billData?.totalAmount).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR'
                            }) || "-"}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</Label>
                            <p>{renderBodyStatus(billData?.status) || "-"}</p>
                        </div>
                    </div>
                </CardBody>
                <CardHeader className="font-bold">Detail Penghuni</CardHeader>
                <CardBody>
                    <div className="grid lg:grid-cols-5 sm:grid-cols-3 grid-cols-2">
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nomor Kamar</Label>
                            <p>{billData?.room?.roomNumber}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama</Label>
                            <p>{billData?.occupant?.name}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">NIK</Label>
                            <p>{billData?.occupant?.nik}</p>
                        </div>
                        <div className="mb-4">
                            <Label className="font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Gender</Label>
                            <p>{billData?.occupant?.gender}</p>
                        </div>
                        <div className="mb-4">
                            <Label colorClass="text-pink-100 dark:text-gray-400" className="font-medium  text-start text-theme-xs ">Kontak</Label>
                            <p>{billData?.occupant?.phone}</p>
                        </div>
                    </div>
                </CardBody>
                <CardHeader className="font-bold">Riwayat Pembayaran</CardHeader>
                <CardBody>
                  <div className="overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400"
                                >
                                No
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400"
                                >
                                Tanggal Pembayaran
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-center text-theme-xs dark:text-gray-400"
                                >
                                Jumlah yang dibayar
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400"
                                >
                                Metode Pembayaran
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400"
                                >
                                Catatan
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400 "
                                >
                                Bukti Pembayaran
                                </TableCell>
                                <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-800 text-start text-theme-xs dark:text-gray-400"
                                >
                                Nomor Referensi
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsData.map((data: ResponsePayment, index: number)=>{
                                return(
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{index+1}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.paymentDate}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                                            {Number(data?.amountPaid).toLocaleString('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            })}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{renderPaymentMethodBody(data.paymentMethod)}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.note}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                                          <Button onClick={()=>handleOpenModal('preview', data as ResponsePayment)} className="bg-gray-500 hover:bg-gray-600 text-white">
                                            <PreviewIcon/>
                                          </Button>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.transactionReference}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                  </div>
                </CardBody>
            </div>              
        )}
        <CardBody>
          <div className="overflow-x-auto">
            { loading.fetch && (
              <div className="py-10 text-center flex w-full text-gray-400">
                <LoadingTable/>
              </div>
            )}
            { (!billData && !loading.fetch) && (
              <div className="py-10 text-center flex justify-center text-gray-400 w-full">
                Data tagihan tidak ditemukan
              </div>
            )}
          </div>
          { (billData && !loading.fetch) && (
            <div className="flex items-center justify-end gap-2">
              <Button onClick={()=>router.back()} className="bg-gray-500 hover:bg-gray-600 text-white w-[200px] py-2">
                Kembali
              </Button>
              <Button disabled={billData?.status==='lunas'} onClick={()=>handleOpenModal('bill', billData)} className="bg-success-500 hover:bg-success-600 text-white w-[200px] py-2">
                Tambah Pembayaran
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  }


