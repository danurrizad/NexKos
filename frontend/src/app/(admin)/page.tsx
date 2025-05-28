import type { Metadata } from "next";
import React from "react";

const Dashboard = React.lazy(()=>import("@/components/dashboard/Dashboard"))

export const metadata: Metadata = {
  title:
    "NexKos | Dashboard",
  description: "Kos Management App",
};

export default function Page() {
  return <Dashboard/>;
}
