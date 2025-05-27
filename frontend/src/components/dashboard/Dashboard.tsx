'use client'
import React, { useState } from "react"
import LoadingTable from "../tables/LoadingTable"

const Metrics = React.lazy(()=>import('@/components/dashboard/Metrics'))
const MonthlyDeadline = React.lazy(()=>import('@/components/dashboard/MonthlyDeadline'))
const MonthlySummary = React.lazy(()=>import('@/components/dashboard/MonthlySummary'))

interface Loadings{
    metrics: boolean,
    monthlyDeadline: boolean,
    monthlySummary: boolean
}

export default function Dashboard() {
    const [loading, setLoading] = useState<Loadings>({
        metrics: false,
        monthlyDeadline: false,
        monthlySummary: false
    })

  return(
    <div>
        { loading.metrics || loading.monthlyDeadline || loading.monthlySummary && (
            <div className="col-span-12 h-[calc(100vh-150px)] flex justify-center items-center">
                <LoadingTable/>
            </div>
        )}
        
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-12">
                <Metrics loading={loading} setLoading={setLoading}/>
            </div>
    
            <div className="col-span-12 xl:col-span-8">
                <MonthlyDeadline loading={loading} setLoading={setLoading}/>
            </div>
    
            <div className="col-span-12 xl:col-span-4">
                <MonthlySummary loading={loading} setLoading={setLoading}/>
            </div>
        </div>
        
    </div>
  )
}

