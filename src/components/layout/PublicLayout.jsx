import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToHash from "../routing/ScrollToHash";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToHash />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
