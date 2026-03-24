import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToHash from "../routing/ScrollToHash";

export default function PublicLayout() {
  const location = useLocation();
  // All public pages will now handle their own scroll-snapping and footers
  const isPublicPage = !location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ScrollToHash />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isPublicPage && <Footer />}
    </div>
  );
}
