import LoadingImport from "@/components/loading/LoadingImport";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import React from "react";

const Penghuni = dynamic(()=>import('@/components/manajemen/Penghuni'), {
  loading: () => <LoadingImport/>
})

export const metadata: Metadata = {
  title:
    "NexKos | Manajemen Penghuni",
  description: "Kos Management App",
};

export default function Page() {
  return <Penghuni/>
}
