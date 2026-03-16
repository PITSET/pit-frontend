import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumbs from "../ui/Breadcrumbs";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Breadcrumbs />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
