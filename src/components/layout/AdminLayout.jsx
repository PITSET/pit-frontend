import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";

import Sidebar from "./Sidebar";
import { logout, restoreSession } from "../../utils/auth";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Periodic session check - auto logout when session expires
  useEffect(() => {
    const checkSessionExpiry = async () => {
      const expiry = localStorage.getItem("sessionExpiry");
      
      if (expiry && Date.now() > parseInt(expiry)) {
        // Try to restore session using refresh token
        const session = await restoreSession();
        
        if (!session) {
          // If restore failed, logout
          logout(true);
        }
        // If restore succeeded, session has been updated
      }
    };

    // Check immediately on mount
    checkSessionExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);

    return () => clearInterval(interval);
  }, []);

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

        <div className="min-h-screen bg-[#F5F6FA]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
