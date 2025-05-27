"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow
} from '../ui/table'
import  Button from '../ui/button/Button'

import { OutgoingMailIcon } from '@/icons'
import Badge from '../ui/badge/Badge';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import useDashboardService from '@/services/DashboardService';

interface Loadings {
  metrics: boolean,
  monthlyDeadline: boolean,
  monthlySummary: boolean
}

interface MonthlyDeadlineProps {
  loading: Loadings,
  setLoading: Dispatch<SetStateAction<Loadings>>
}

interface ResponseProps{
  room: {
    roomNumber: string
  },
  occupant: {
    name: string
  },
  dueDate: string,
  status: string
}

export default function MonthlyDeadline({ loading, setLoading } : MonthlyDeadlineProps) {  
  const { getBillRecent } = useDashboardService()
  const [monthlyDeadlineData, setMonthlyDeadlineData] = useState<ResponseProps[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPage: 0,
    limit: 10
  })

  const fetchMonthlyDeadline = async() => {
    try {
      setLoading({ ...loading, monthlyDeadline: true})
      const response = await getBillRecent(pagination.currentPage, pagination.limit)
      console.log("response deadlines bill", response)
      setMonthlyDeadlineData(response?.data?.data)
      setPagination({
        currentPage: response?.data?.meta?.page,
        totalPage: response?.data?.meta?.totalPages,
        limit: response?.data?.meta?.limit,
      })
    } catch (error) {
      console.error(error)
    } finally{
      setLoading({ ...loading, monthlyDeadline: false})
    }
  }

  useEffect(()=>{
    fetchMonthlyDeadline()
  }, [])

  if(loading.monthlyDeadline){
    return
  }

  

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Jatuh Tempo Pembayaran
        </h3>
        <div className='overflow-x-auto'>
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
                  Waktu Tenggat
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status Pembayaran
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Kirim Pengingat
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
              { monthlyDeadlineData?.map((data: ResponseProps, index: number)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{index+1}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <div className="rounded-sm border bg-gray-100 size-[30px] flex items-center justify-center ">
                        { data?.room?.roomNumber.toString().padStart(2, '0') }
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.occupant.name}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data?.dueDate}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <Badge color={data.status==='lunas' ? 'success' : 'error'}>
                        {data?.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-5 py-4 sm:px-6 text-center text-theme-sm">
                      <Button disabled={data.status === 'lunas'} size='sm' className={`bg-white ${data.status !== 'lunas' && 'hover:bg-primary1'} shadow-md group`}>
                        <OutgoingMailIcon className={`text-primary1 ${data.status !== "lunas" && "group-hover:text-white"}`}/>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
