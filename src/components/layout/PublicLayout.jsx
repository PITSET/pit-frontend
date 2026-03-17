import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToHash from "../routing/ScrollToHash";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ScrollToHash />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
