import type { Metadata } from "next";
import React from "react";

import DetailTagihan from "@/components/manajemen/DetailTagihan";


export const metadata: Metadata = {
  title:
    "NexKos | Detail Tagihan",
  description: "Kos Management App",
};

export default function Page() {
  return <DetailTagihan/>
}
