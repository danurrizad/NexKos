// import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import Loading from "@/components/loading/Loading";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <Suspense fallback={<Loading/>}>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            {children}
            <div className="lg:w-1/2 w-full h-full bg-slate-100 dark:bg-white/5 lg:grid items-center hidden">
              <div className="relative items-center justify-center  flex z-1">
                {/* <!-- ===== Common Grid Shape Start ===== --> */}
                <div className="flex flex-col items-center max-w-xs">
                  <Link href="/" className="block mb-4">
                    {/* <h1 className="text-6xl text-white">
                      NexKos
                    </h1> */}
                    <Image
                        src="/images/logo/nexkos.png"
                        alt="Logo"
                        width={369}
                        height={286}
                      />
                  </Link>
                  <p className="text-center text-gray-400 dark:text-white/60">
                    Permudah proses manajemen kamar, penghuni, hingga tagihan kos milikmu
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div> */}
          </div>
        </Suspense>
      </ThemeProvider>
    </div>
  );
}
