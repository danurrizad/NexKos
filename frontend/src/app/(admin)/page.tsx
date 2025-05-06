import type { Metadata } from "next";
import React from "react";

// edited
import { Metrics } from "@/components/dashboard/Metrics";
import MonthlyDeadline from "@/components/dashboard/MonthlyDeadline";
import MonthlySummary from "@/components/dashboard/MonthlySummary";

export const metadata: Metadata = {
  title:
    "NexKos | Dashbord",
  description: "Kos Management App",
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <Metrics />
      </div>

      <div className="col-span-12 xl:col-span-8">
        <MonthlyDeadline />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <MonthlySummary />
      </div>
    </div>
  );
}
