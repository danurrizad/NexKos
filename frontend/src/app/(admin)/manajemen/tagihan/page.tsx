import type { Metadata } from "next";
import React from "react";

import Tagihan from "../../../../components/manajemen/Tagihan";

export const metadata: Metadata = {
  title:
    "NexKos | Manajemen Tagihan",
  description: "Kos Management App",
};

export default function ManajemenTagihan() {
  return (
    <div className="">
      <Tagihan/>
    </div>
  );
}
