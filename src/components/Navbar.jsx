import React, { useState } from "react";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-md w-full relative z-50">
      <header className="flex justify-between items-center py-4 px-8 md:px-20 bg-white">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10" />
        </a>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-10 font-semibold relative">
          
          <li className="hover:text-red-500 cursor-pointer">About</li>

          {/* Programs Dropdown */}
          <li className="relative group cursor-pointer">
            <span className="hover:text-red-500 flex items-center gap-1 py-2">
              Programs ▾
            </span>

            {/* Hover bridge (fix flicker gap) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-[900px] h-6"></div>

            {/* Mega Dropdown */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[900px]
              bg-white shadow-2xl rounded-md p-10
              grid grid-cols-3 gap-10
              opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-300 z-50"
            >
              {/* Column 1 */}
              <div>
                <h3 className="text-red-600 font-bold text-lg mb-4">
                  Mechatronics Engineering
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="hover:text-red-500 cursor-pointer">Program Info</li>
                  <li className="hover:text-red-500 cursor-pointer">Projects</li>
                  <li className="hover:text-red-500 cursor-pointer">Instructors</li>
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <h3 className="text-red-600 font-bold text-lg mb-4">
                  Software Engineering
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="hover:text-red-500 cursor-pointer">Program Info</li>
                  <li className="hover:text-red-500 cursor-pointer">Projects</li>
                  <li className="hover:text-red-500 cursor-pointer">Instructors</li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h3 className="text-red-600 font-bold text-lg mb-4">
                  Mechanical Engineering
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="hover:text-red-500 cursor-pointer">Program Info</li>
                  <li className="hover:text-red-500 cursor-pointer">Projects</li>
                  <li className="hover:text-red-500 cursor-pointer">Instructors</li>
                </ul>
              </div>
            </div>
          </li>

          <li className="hover:text-red-500 cursor-pointer">Contact</li>
        </ul>

        {/* Mobile Icon */}
        <div
          className="block lg:hidden text-4xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white flex flex-col items-center gap-6 py-6 font-semibold text-lg shadow-lg lg:hidden">
            <div className="hover:text-red-500 cursor-pointer">About</div>
            <div className="hover:text-red-500 cursor-pointer">Programs</div>
            <div className="hover:text-red-500 cursor-pointer">Contact</div>
          </div>
        )}
      </header>
    </div>
  );
}