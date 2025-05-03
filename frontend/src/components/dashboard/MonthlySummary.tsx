"use client";

export default function MonthlySummary() {

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ringkasan
        </h3>
        <div className="mt-2 flex flex-col gap-6">
          <div className="">
            <h3 className="text-theme-sm ">Tagihan Dibuat</h3>
            <h4 className='text-theme-sm text-gray-400 font-light'>Jumlah tagihan yang seharusnya diinput</h4>
            <h1 className="text-[2rem]">18/25</h1>
          </div>
          <div className="">
            <h3 className="text-theme-sm ">Sudah Dibayar</h3>
            <h4 className='text-theme-sm text-gray-400 font-light'>Jumlah pemasukan yang telah dibayarkan oleh penghuni</h4>
            <h1 className="text-[2rem]">Rp 18,000,000</h1>
          </div>
          <div className="">
            <h3 className="text-theme-sm ">Belum Dibayar</h3>
            <h4 className='text-theme-sm text-gray-400 font-light'>Jumlah yang harus dibayarkan oleh penghuni</h4>
            <h1 className="text-[2rem]">Rp 7,000,000</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
