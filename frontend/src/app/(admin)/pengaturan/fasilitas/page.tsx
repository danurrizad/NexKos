import LoadingImport from "@/components/loading/LoadingImport";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "NexKos | Pengaturan Fasilitas",
    description: "Kos Management App",
  };

const Fasilitas = dynamic(() => import("@/components/pengaturan/Fasilitas"), {
  loading: () => <LoadingImport/>,
});

export default function Page(){
    return <Fasilitas/>
}