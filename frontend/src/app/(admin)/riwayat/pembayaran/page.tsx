import LoadingImport from "@/components/loading/LoadingImport";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "NexKos | Riwayat Pembayaran",
    description: "Kos Management App",
  };

const Pembayaran = dynamic(() => import("@/components/riwayat/Pembayaran"), {
  loading: () => <LoadingImport/>,
});

export default function Page(){
    return <Pembayaran/>
}