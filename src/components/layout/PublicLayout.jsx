import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
<<<<<<< HEAD
import Breadcrumbs from "../ui/Breadcrumbs";
=======
import ScrollToHash from "../routing/ScrollToHash";
>>>>>>> footer-update

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToHash />
      <Navbar />
      <main className="flex-grow">
        <Breadcrumbs />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
