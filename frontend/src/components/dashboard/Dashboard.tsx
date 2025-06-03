'use client'
import React, { useEffect, useState } from "react"
import LoadingTable from "../tables/LoadingTable"
import useDashboardService from "@/services/DashboardService"

const Metrics = React.lazy(()=>import('@/components/dashboard/Metrics'))
const MonthlyDeadline = React.lazy(()=>import('@/components/dashboard/MonthlyDeadline'))
const MonthlySummary = React.lazy(()=>import('@/components/dashboard/MonthlySummary'))

interface Loadings{
    metrics: boolean,
    monthlyDeadline: boolean,
    monthlySummary: boolean,
    pagination: boolean
}

interface ResponseSummary{
  totalOccupants: number,
  totalRooms: number,
  totalRoomsAvailable: number,
  totalRoomsOccupied: number
}

interface ResponseMonthlyDeadline{
    room: {
        roomNumber: string
    },
    occupant: {
        name: string,
        phone: string,
    },
    dueDate: string,
    status: string,
    totalAmount: string
}

interface ResponseMonthlySummary{
  totalBillsCreated: number,
  totalPayers: number,
  totalPayments: number,
  totalUnpaidBills: number
}

export default function Dashboard() {
    const [firstFetch, setFirstFetch] = useState<boolean>(true)
    const [loading, setLoading] = useState<Loadings>({
        metrics: true,
        monthlyDeadline: true,
        monthlySummary: true,
        pagination: false
    })

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPage: 0,
        limitPerPage: 10
    })

    const [query] = useState({
        period: new Date().toLocaleDateString('en-CA').slice(0, 7)
    })

    const { getTotalSummary, getBillRecent, getBillPaymentSummary } = useDashboardService()
    const [summaryData, setSummaryData] = useState<ResponseSummary | null>(null)
    const [monthlyDeadlineData, setMonthlyDeadlineData] = useState<ResponseMonthlyDeadline[]>([])
    const [monthlySummaryData, setMonthlySummaryData] = useState<ResponseMonthlySummary>({
        totalBillsCreated: 0,
        totalPayers: 0,
        totalPayments: 0,
        totalUnpaidBills: 0
    })

    const fetchAll = async() => {
        try {
            const responseSummary = await getTotalSummary()
            setSummaryData(responseSummary?.data?.data)

            const responseBill = await getBillRecent(pagination.currentPage, pagination.limitPerPage)
            setMonthlyDeadlineData(responseBill?.data?.data)
            setPagination({
                currentPage: responseBill?.data?.meta?.page,
                totalPage: responseBill?.data?.meta?.totalPages,
                limitPerPage: responseBill?.data?.meta?.limit,
            })

            const responsePayment = await getBillPaymentSummary(query.period)
            setMonthlySummaryData(responsePayment?.data?.data)

        } catch (error) {
            console.error(error)
        } finally{
            setLoading({
                ...loading,
                metrics: false,
                monthlyDeadline: false,
                monthlySummary: false
            })
            setFirstFetch(false)
        }
    }

    const fetchMonthlyDeadline = async() => {
        try {
            setLoading({ ...loading, pagination: true})
            const responseBill = await getBillRecent(pagination.currentPage, pagination.limitPerPage)
            setMonthlyDeadlineData(responseBill?.data?.data)
            setPagination({
                currentPage: responseBill?.data?.meta?.page,
                totalPage: responseBill?.data?.meta?.totalPages,
                limitPerPage: responseBill?.data?.meta?.limit,
            })
        } catch (error) {
            console.error(error)
        } finally{
            setLoading({ ...loading, pagination: false})
        }
    }

    // first fetch
    useEffect(()=>{
        fetchAll()
    }, [])

    // fetch on pagination change
    useEffect(()=>{
        if(!firstFetch){
            fetchMonthlyDeadline()
        }
    }, [pagination.currentPage, pagination.limitPerPage])


  return(
    <div>
        { (loading.metrics || loading.monthlyDeadline || loading.monthlySummary) && (
                <div className="col-span-12 h-[calc(100vh-150px)] flex justify-center items-center">
                <LoadingTable/>
            </div>
        )}

        { (!loading.metrics && !loading.monthlyDeadline && !loading.monthlySummary) && (
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <Metrics summaryData={summaryData}/>
                </div>
        
                <div className="col-span-12 xl:col-span-8">
                    <MonthlyDeadline monthlyDeadlineData={monthlyDeadlineData} pagination={pagination} setPagination={setPagination} loading={loading.pagination}/>
                </div>
        
                <div className="col-span-12 xl:col-span-4">
                    <MonthlySummary monthlySummaryData={monthlySummaryData} query={query}/>
                </div>
            </div>
        )}
        
        
    </div>
  )
}

