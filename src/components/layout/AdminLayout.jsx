import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";

import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F65919]/40"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-800">Admin</span>
        </div>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
