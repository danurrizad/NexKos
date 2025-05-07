import type { Metadata } from "next";
import React from "react";

import Kamar from "../../../../components/manajemen/Kamar";
// const Kamar = React.lazy(()=>import("@/components/manajemen/Kamar"))

export const metadata: Metadata = {
  title:
    "NexKos | Manajemen Kamar",
  description: "Kos Management App",
};

export default function ManajemenKamar() {
  return (
    <div className="">
      <Kamar/>
    </div>
  );
}
