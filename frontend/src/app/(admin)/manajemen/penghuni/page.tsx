import type { Metadata } from "next";
import React from "react";

import Penghuni from "../../../../components/manajemen/Penghuni";

export const metadata: Metadata = {
  title:
    "NexKos | Manajemen Penghuni",
  description: "Kos Management App",
};

export default function ManajemenPenghuni() {
  return (
    <div className="">
      <Penghuni/>
    </div>
  );
}
