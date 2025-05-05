import React from "react";
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
import { dataKamar } from '@/services/TableDummy'
import { AppRegistrationIcon, DeleteIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";

export default function ManajemenKamar() {
  return (
    <div className="">
      <Card>
        <CardHeader>
          <Button className="bg-white border-gray-400 border-1 border-solid ">
            + Tambah Kamar
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
                  Nomor Kamar
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Letak (Lantai)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Kapasitas
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Harga
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
              { dataKamar.map((data, index)=>{
                return(
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.roomNumber}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.floorUnit}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">{data.capacity}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm flex justify-center items-center h-full">
                      <Badge color={ data.status==='nonaktif' ? 'dark' : data.status==='terisi' ? 'success' : data.status==='kosong' ? 'info' : 'light'}>
                        {data.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="px-5 py-4 sm:px-6 flex justify-center dark:text-white text-theme-sm">
                      <div 
                        className={`
                          text-center w-fit px-4
                          rounded-sm ${data.status==="nonaktif" ? "bg-gray-300" : data.status==="terisi" ? "bg-green-300" : data.status==="kosong" ? "bg-blue-300" : ""}`}
                        >
                        {data.status.toUpperCase()}
                      </div>
                    </TableCell> */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      {data.price.toLocaleString('id-ID',{
                        style: 'currency',
                        currency: 'IDR'
                      })}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start dark:text-white text-theme-sm">
                      <div className="flex justify-center gap-4">
                        <Button className="bg-blue-500"><AppRegistrationIcon/></Button>
                        <Button className="bg-red-500"><DeleteIcon/></Button>
                      </div>
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
