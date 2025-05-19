'use client'

import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader } from "../card"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table"
import useFacilityService from "@/services/FacilityService"
import LoadingTable from "../tables/LoadingTable"
import { AppRegistrationIcon, DeleteIcon } from "@/icons"
import Button from "../ui/button/Button"
import Pagination from "../tables/Pagination"
import LimitPerPage from "../tables/LimitPerPage"
import { Modal } from "../ui/modal"
import Spinner from "../ui/spinner/Spinner"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import SelectIcon from "../form/SelectIcon"
import { useAlert } from "@/context/AlertContext"
import IconDisplay from "../ui/icon/IconDisplay"

interface ResponseFacility{
    id: number,
    name: string,
    description: string,
    icon: string
}

interface FormInterface{
    name: string,
    description: string,
    icon: string
}

interface FormErrors{
    name: string,
    icon: string
}

export default function Fasilitas(){
    const { showAlert } = useAlert()
    const [loading, setLoading] = useState({
        fetch: false,
        submit: false
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limitPerPage: 10,
        totalPage: 0
    })
    const [showModal, setShowModal] = useState({
        type: "",
        add: false,
        update: false,
        delete: false
    })
    const { getAllFacilities, createFacility, updateFacilityById, deleteFacilityById } = useFacilityService()
    const [facilitiesData, setFacilitiesData] = useState([])
    const [facilityId, setFacilityId] = useState<number>()
    const [form, setForm] = useState<FormInterface>({
        name: "",
        description: "",
        icon: ""
    })
    const [formErrors, setFormErrors] = useState<FormErrors>({
        name: "",
        icon: ""
    })

    const fetchFacilities = async() => {
        try {
            const response = await getAllFacilities(pagination.currentPage, pagination.limitPerPage)
            setFacilitiesData(response?.data.data)
            setPagination({
                currentPage: response?.data.meta.page,
                limitPerPage: response?.data.meta.limit,
                totalPage: response?.data.meta.totalPages,
            })
            console.log('response faci: ', response)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        const fetchFirstLoad = async() => {
            try {
                setLoading({...loading, fetch: true})
                await fetchFacilities()
            } catch (error) {
                console.error(error)
            } finally{
                setLoading({ ...loading, fetch: false})
            }
        }

        fetchFirstLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    const handleOpenModal = (type: string, data: ResponseFacility) => {
        if(type==="add"){
            setForm({
                name: "",
                description: "",
                icon: ""
            })
        }else if(type==="update"){
            setFacilityId(data.id)
            setForm({
                ...form,
                name: data.name,
                description: data.description,
                icon: data.icon
            })
        }else if(type==="delete"){
            setFacilityId(data.id)
        }
        setShowModal({ ...showModal, type: type, [type]: true})
    }

    const handleSubmit = async() => {
        try {
            setLoading({ ...loading, submit: true})
            const errors: FormErrors = {
                name: "",
                icon: "",
            };
            if (!form.name) errors.name = "Nama fasilitas wajib diisi.";
            if (!form.icon) errors.icon = "Icon wajib dipilih.";
    
            // Check if any error message exists
            const hasErrors = Object.values(errors).some((msg) => msg !== "");

            if (hasErrors) {
            setFormErrors(errors);
            return;
            }
            const response = showModal.type==="add" ? await createFacility(form) : await updateFacilityById(Number(facilityId), form)
            console.log('response submit: ', response)
            handleCloseModal(showModal.type)
            showAlert({
                variant: "success",
                title: "Sukses!",
                message: response?.data?.message,
            })
            fetchFacilities()
        } catch (error) {
            console.error(error)
        } finally{
            setLoading({ ...loading, submit: false})
        }
    }

    const handleDelete = async() => {
        try {
          setLoading({...loading, submit: true})
          const response = await deleteFacilityById(Number(facilityId))
          handleCloseModal(showModal.type)
          showAlert({
            variant: "success",
            title: "Sukses!",
            message: response?.data?.message,
          })
          fetchFacilities()
        } catch (error) {
          console.error(error)
        } finally{
          setLoading({...loading, submit: false})
        }
      }

    const handleCloseModal = (type: string) => {
        setFormErrors({
            name: "",
            icon: "",
        })
        setShowModal({ ...showModal, type: type, [type]: false})
    }

    const renderModal = (type: string) => {
        if(type==='add' || type==='update'){
          return(
            <Modal
              parentClass="px-10"
              isOpen={showModal.add || showModal.update}
              onClose={()=>handleCloseModal(type)}
            >
              <Card>
                <CardHeader>
                  { type==='add' ? "Tambah" : "Ubah"} Fasilitas
                </CardHeader>
                <CardBody>
                  <form>
                    <div className="mb-4">
                      <Label>Nama <span className="text-red-500">*</span></Label>
                      <Input
                        defaultValue={form?.name}
                        onChange={(e)=>{
                          setFormErrors({...formErrors, name: ""})
                          setForm({...form, name: e.target.value})
                        }}
                      />
                      { formErrors?.name && <Label className="text-red-500 font-light">{formErrors.name}</Label>}
                    </div>
                    <div className="mb-4">
                      <Label>Deskripsi</Label>
                      <Input 
                        onChange={(e)=>{
                          setForm({...form, description: e.target.value})
                        }}
                        defaultValue={form.description}
                      />
                    </div>
                    <div className="mb-4">
                        <Label>Icon<span className="text-red-500">*</span></Label>
                        <SelectIcon
                            defaultValue={form.icon}
                            onSelection={(iconName)=>setForm({ ...form, icon: iconName})}
                            id={form.icon}
                            name={form.icon}
                        />
                        { formErrors?.icon && <Label className="text-red-500 font-light">{formErrors.icon}</Label>}
                    </div>
                  </form>
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
              parentClass="px-10"
            >
              <Card className="">
                <CardHeader>
                  <div>
                    Apakah yakin ingin menghapus fasilitas {form.name}?
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
    
    return(
        <div>
            { renderModal(showModal.type)}
            <Card>
                <CardHeader>
                    <Button className="border border-gray-400" onClick={()=>handleOpenModal("add", form as ResponseFacility)}>+ Tambah fasilitas</Button>
                </CardHeader>
                <CardBody className="">
                    <div className="overflow-x-auto">
                      <Table className="">
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
                                  Nama
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
                                  Icon
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
                            { loading.fetch && (
                                <TableRow>
                                <TableCell colSpan={5} className="py-10">
                                    <LoadingTable/>
                                </TableCell>
                                </TableRow>
                            )}

                            { (facilitiesData.length === 0 && !loading.fetch) && (
                                <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    Data fasilitas tidak ditemukan
                                </TableCell>
                                </TableRow>
                            )}
                            { (facilitiesData.length !== 0 && !loading.fetch) && facilitiesData?.map((data: ResponseFacility, index: number)=>{
                                return(
                                <TableRow key={index}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{index+1}</TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.name}</TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.description}</TableCell>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                                        <IconDisplay iconName={data.icon}/>
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
                    </div>
                    <div className="flex justify-center gap-5">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPage}
                            onPageChange={(e)=>{
                                setPagination({...pagination, currentPage: e})
                            }}
                        />
                        <LimitPerPage
                            onChangeLimit={(e)=>{
                                setPagination({ ...pagination, limitPerPage: e, currentPage: 1})
                            }}
                            limit={pagination.limitPerPage}
                            options={[10, 25, 50]}
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}