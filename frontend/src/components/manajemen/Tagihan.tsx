import React from "react";
import{
  Card,
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
import { dataTagihan } from '@/services/TableDummy'
import { CheckIcon, ScheduleIcon, ErrorCircleIcon, OpenNewIcon, FileIcon, CurrencyExchangeIcon, DevicesIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";

export default function Tagihan() {
  const renderBodyStatus = (data: string) => {
    return(
      <div className="flex justify-center">
        { data === 'lunas' ? <CheckIcon className="text-white bg-green-500 rounded-full"/> : 
          data === 'pending' ? <ScheduleIcon className="text-white bg-gray-500 rounded-full"/> :
          data === 'belum bayar' ? <ErrorCircleIcon className="text-white bg-red-500 rounded-full"/> : ""
        }
      </div>
    )
  }

  return (
    <div className="">
      <Card className="overflow-x-auto">
        {/* <CardHeader>
          <Button className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Kamar
          </Button>
        </CardHeader> */}
        <CardBody>
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
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
                  Bulan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tahun
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
                  Tenggat Waktu
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Metode Pembayaran
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
              { dataTagihan.map((data, index)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.roomNumber}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.tenant}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.month}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.year}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      {data.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: "IDR"
                      })}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.deadline}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm flex justify-between items-center">
                      <Badge 
                        color={data.paymentMethod==='gateway' ? "info" : data.paymentMethod==='transfer' ? "success" : data.paymentMethod==='manual' ? 'warning' : "info"} 
                        startIcon={data.paymentMethod==='manual' ? <FileIcon/> : data.paymentMethod==='transfer' ? <CurrencyExchangeIcon/> : data.paymentMethod==='gateway' ? <DevicesIcon/> : ""} 
                      >
                        {data.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">{renderBodyStatus(data.status)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center dark:text-white text-theme-sm">
                      <Button size="xs" className="rounded-md bg-blue-500">
                        <OpenNewIcon className=" text-white"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
