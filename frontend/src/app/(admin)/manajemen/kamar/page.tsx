import LoadingImport from "@/components/loading/LoadingImport";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "NexKos | Manajemen Kamar",
  description: "Kos Management App",
};

const Kamar = dynamic(() => import("@/components/manajemen/Kamar"), {
  loading: () => <LoadingImport/>,
});

export default function Page() {
  return <Kamar />
}
