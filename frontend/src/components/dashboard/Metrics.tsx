"use client";
import React from "react";
import { PersonIcon, BedIcon, DoorFrontIcon, DoorOpenIcon } from "@/icons";

interface ResponseSummary{
  totalOccupants: number,
  totalRooms: number,
  totalRoomsAvailable: number,
  totalRoomsOccupied: number
}

export default function Metrics({ summaryData }: {summaryData: ResponseSummary | null}){
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary1 rounded-xl dark:bg-gray-800">
            <PersonIcon className="text-white size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Penghuni
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h1 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            {summaryData?.totalOccupants || 0}
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary1 rounded-xl dark:bg-gray-800">
            <BedIcon className="text-white size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Kamar
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            {summaryData?.totalRooms || 0}
          </h3>
        </div>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary1 rounded-xl dark:bg-gray-800">
            <DoorFrontIcon className="text-white size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Kamar Terisi
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            {summaryData?.totalRoomsOccupied || 0}
          </h3>
        </div>
      </div>
     
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary1 rounded-xl dark:bg-gray-800">
            <DoorOpenIcon className="text-white size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Kamar Kosong
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            {summaryData?.totalRoomsAvailable || 0}
          </h3> 
        </div>
      </div>      
    </div>
  );
};
