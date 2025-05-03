"use client";
import React from "react";
import { PersonIcon, BedIcon, DoorFrontIcon, DoorOpenIcon } from "@/icons";

export const Metrics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <PersonIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Penghuni
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h1 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            30
          </h1>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BedIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Kamar
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            25
          </h3>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
      
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <DoorFrontIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Kamar Terisi
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            20
          </h3>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
     
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <DoorOpenIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Kamar Kosong
          </span>
        </div>

        <div className="flex items-end justify-end ">
          <h3 className="mt-2 font-bold text-gray-800 text-[3rem] dark:text-white/90">
            5
          </h3>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      
    </div>
  );
};
