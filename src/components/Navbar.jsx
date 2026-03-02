import React, { useState } from "react";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="bg-white shadow-md w-full">
      <header className="flex justify-between items-center text-black py-4 px-8 md:px-32 bg-white drop-shadow-md">
        <a href="/">
          <img src={logo} alt="logo" className="hover:cursor-pointer" />
        </a>
        <ul className="hidden lg:flex items-center gap-12 font-semibold text-base">
          <li className="p-3 hover:text-red-500 cursor-pointer transition-all">
            About
          </li>
          <li className="p-3 hover:text-red-500 cursor-pointer transition-all">
            Programs
          </li>
          <li className="p-3 hover:text-red-500 cursor-pointer transition-all">
            Contact
          </li>
        </ul>
        <i
          className="block lg:hidden text-5xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="bx bx-menu"></i>
        </i>
        <div
          className={`absolute lg:hidden top-32 left-0 w-full bg-white flex flex-col items-center gap-6 font-semibold text-lg transform transition-transform ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          style={{ transition: "transform 0.3s ease, opacity 0.3s ease" }}
        >
          <li className="list-none w-full text-center p-4 hover:text-red-500 transition-all cursor-pointer">
            About
          </li>
          <li className="list-none w-full text-center p-4 hover:text-red-500 transition-all cursor-pointer">
            Programs
          </li>
          <li className="list-none w-full text-center p-4 hover:text-red-500 transition-all cursor-pointer">
            Contact
          </li>
        </div>
      </header>
    </div>
  );
}
