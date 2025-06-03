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
import { Dispatch, SetStateAction } from 'react';
import Pagination from '../tables/Pagination';
import LoadingTable from '../tables/LoadingTable';

interface Paginations {
  currentPage: number,
  limitPerPage: number,
  totalPage: number
}

interface ResponseMonthlyDeadline{
  room: {
    roomNumber: string
  },
  occupant: {
    name: string,
    phone: string,
  },
  dueDate: string,
  status: string,
  totalAmount: string
}

interface MonthlyDeadlineProps {
  monthlyDeadlineData: ResponseMonthlyDeadline[],
  pagination: Paginations,
  setPagination: Dispatch<SetStateAction<Paginations>>,
  loading: boolean
}

export default function MonthlyDeadline({ monthlyDeadlineData, pagination, setPagination, loading } : MonthlyDeadlineProps) {  
  
  const handleSendReminder = (localPhone: string, occupantName: string, dueDate: string, amount: number) => {
    const internationalPhone = '62' + localPhone.replace(/^0/, '');
    const message = `Halo ${occupantName}, ini adalah pengingat untuk pembayaran kos Anda. Mohon melakukan pembayaran sebesar Rp${amount.toLocaleString('id-ID')} sebelum hari ${new Date(dueDate).toLocaleDateString('id-ID', { dateStyle: 'full'})}. Terima kasih.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

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
              { (monthlyDeadlineData.length > 0 && !loading) && monthlyDeadlineData?.map((data: ResponseMonthlyDeadline, index: number)=>{
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
                      <Badge color={data.status==='lunas' ? 'success' : data.status === 'dibayar sebagian' ? 'warning' : 'error'}>
                        {data?.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-5 py-4 sm:px-6 text-center text-theme-sm">
                      <Button onClick={()=>handleSendReminder(data.occupant.phone, data.occupant.name, data.dueDate, Number(data.totalAmount))} disabled={data.status === 'lunas'} size='sm' className={`bg-white ${data.status !== 'lunas' && 'hover:bg-primary1'} shadow-md group`}>
                        <OutgoingMailIcon className={`text-primary1 ${data.status !== "lunas" && "group-hover:text-white"}`}/>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
          { loading && (
            <div className="py-10 text-center flex w-full text-gray-400">
              <LoadingTable/>
            </div>
          )}
          { (monthlyDeadlineData.length === 0 && !loading) && (
            <div className="py-10 text-center flex justify-center text-gray-400 w-full">
              Data jatuh tempo pembayaran tidak ditemukan
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
              setPagination({ ...pagination, limitPerPage: e, currentPage: 1})
            }}
            limitPerPage={pagination.limitPerPage}
            options={[10, 25, 50]}
          />
      </div>
    </div>
  );
}
