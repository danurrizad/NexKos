import { Metadata } from "next";
import React from "react";

const Fasilitas = React.lazy(()=>import("@/components/pengaturan/Fasilitas"))

export const metadata: Metadata = {
    title:
      "NexKos | Pengaturan Fasilitas",
    description: "Kos Management App",
  };

export default function PengaturanFasilitas(){
    return(
        <div>
            <Fasilitas/>
        </div>
    )
}