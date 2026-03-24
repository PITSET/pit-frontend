import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToHash from "../routing/ScrollToHash";

export default function PublicLayout() {
  const location = useLocation();
  const hideFooter = ["/", "/about"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ScrollToHash />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
