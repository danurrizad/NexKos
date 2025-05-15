"use client";

import { useSidebar } from "@/context/SidebarContext";

import React, { Suspense } from "react";

const AppHeader = React.lazy(() => import("@/layout/AppHeader"))
const AppSidebar = React.lazy(() => import("@/layout/AppSidebar"))
const Backdrop = React.lazy(() => import("@/layout/Backdrop"))
import Loading from "@/components/loading/Loading";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <Suspense 
        fallback={<Loading/>}
      >
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </Suspense>
      
    </div>
  );
}
