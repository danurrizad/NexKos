"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow
} from '../ui/table'
import  Button from '../ui/button/Button'

import { data } from '../../services/TableDummy'
import { OutgoingMailIcon } from '@/icons'
import Badge from '../ui/badge/Badge';

export default function MonthlyDeadline() {  
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };
  
  const sortedData = [...data].sort((a, b) => {
    // Prioritize "belum bayar" over "lunas"
    if (a.status !== b.status) {
      return a.status === "belum bayar" ? -1 : 1;
    }
  
    // If status is the same, sort by deadline
    return parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime();
  });

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
              { sortedData.map((data, index)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{index+1}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.roomNumber}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.deadline}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm flex justify-center items-center h-full">
                      <Badge color={data.status==='lunas' ? 'success' : 'error'}>
                        {data.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <div className={`${data.status === 'lunas' ? "bg-green-200" : "bg-red-200"} rounded-sm text-center`}>
                        <span className={`font-bold ${data.status === 'lunas' ? "text-green-800" : "text-red-800"}`}>
                          {data.status.toUpperCase()}
                        </span>
                      </div>
                    </TableCell> */}
                    <TableCell className="px-5 py-4 sm:px-6 text-center text-theme-sm">
                      <Button disabled={data.status === 'lunas'} size='sm' className={`bg-white ${data.status !== 'lunas' && 'hover:bg-blue-500'} shadow-md group`}>
                        <OutgoingMailIcon className={`text-[#0077FF] ${data.status !== "lunas" && "group-hover:text-white"}`}/>
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
