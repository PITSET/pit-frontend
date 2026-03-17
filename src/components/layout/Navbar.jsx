import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo.svg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopProgramOpen, setIsDesktopProgramOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [activeMobileProgram, setActiveMobileProgram] = useState(null);

  const programs = [
    "Mechatronics Engineering",
    "Software Engineering",
    "Mechanical Engineering",
  ];

  const toggleMobileProgram = (program) => {
    setActiveMobileProgram(activeMobileProgram === program ? null : program);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsProgramOpen(false);
    setActiveMobileProgram(null);
  };

  return (
    <div className="w-full bg-white shadow-md sticky top-0 z-50">
      {/* ================= NAVBAR ================= */}
      <header className="flex justify-between items-center h-[90px] px-8 lg:px-24 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="logo" className="h-16" />
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex items-center gap-16 font-medium text-gray-700 text-[17px] relative">
          <li>
            <Link
              to="/about"
              className="hover:text-brand-primary transition cursor-pointer"
            >
              About
            </Link>
          </li>

          {/* ================= PROGRAMS ================= */}
          <li
            className="relative"
            onMouseEnter={() => setIsDesktopProgramOpen(true)}
            onMouseLeave={() => setIsDesktopProgramOpen(false)}
          >
            <span className="hover:text-brand-primary transition flex items-center gap-1 cursor-pointer">
              Programs
              <span className="text-xs">▼</span>
            </span>

            {/* 🔴 Red Underline */}
            <div
              className={`absolute left-0 -bottom-2 h-[2px] bg-brand-primary transition-all duration-300 ${isDesktopProgramOpen ? "w-full" : "w-0"
                }`}
            />

            {/* ================= DROPDOWN ================= */}
            <div
              className={`absolute top-full mt-8 right-[-140px]
              w-[1000px] max-w-[90vw]
              transition-all duration-300 ${isDesktopProgramOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-3"
                }`}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
                <div className="p-10 grid grid-cols-3 gap-14">
                  {programs.map((program) => (
                    <div key={program}>
                      <h3 className="text-brand-primary font-semibold text-lg mb-5">
                        {program}
                      </h3>

                      <ul className="space-y-6">
                        {/* Program Info */}
                        <li className="group">
                          <Link
                            to={`/programs?program=${encodeURIComponent(program)}`}
                            className="text-gray-800 font-medium group-hover:text-brand-primary transition"
                          >
                            Program Info
                          </Link>
                          <div className="text-sm text-gray-400">
                            Overview & students projects
                          </div>
                        </li>

                        {/* Projects */}
                        <li className="group">
                          <Link
                            to={`/projects?program=${encodeURIComponent(program)}`}
                            className="text-gray-800 font-medium group-hover:text-brand-primary transition"
                          >
                            Projects
                          </Link>
                          <div className="text-sm text-gray-400">
                            List of all projects
                          </div>
                        </li>

                        {/* Instructors */}
                        <li className="group">
                          <Link
                            to={`/instructors?program=${encodeURIComponent(program)}`}
                            className="text-gray-800 font-medium group-hover:text-red-600 transition"
                          >
                            Instructors
                          </Link>
                          <div className="text-sm text-gray-400">
                            List of all instructors
                          </div>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>

          <li>
            <Link
              to="/projects"
              className="hover:text-brand-primary transition cursor-pointer"
            >
              Projects
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className="hover:text-brand-primary transition cursor-pointer"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* ================= MOBILE BUTTON ================= */}
        <div
          className="block lg:hidden text-3xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`lg:hidden bg-white shadow-md px-6 overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-[800px] py-6" : "max-h-0"
          }`}
      >
        <div className="space-y-6 font-medium">

          <Link
            to="/about"
            onClick={closeMobileMenu}
            className="block hover:text-red-600 cursor-pointer transition"
          >

          

            About
          </Link>

          <div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsProgramOpen(!isProgramOpen)}
            >
              <span className="hover:text-brand-primary transition">Programs</span>
              <span>{isProgramOpen ? "−" : "+"}</span>
            </div>

            {isProgramOpen && (
              <div className="mt-4 space-y-4 pl-4">
                {programs.map((program) => (
                  <div key={program}>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleMobileProgram(program)}
                    >
                      <span>{program}</span>
                      <span>{activeMobileProgram === program ? "−" : "+"}</span>
                    </div>

                    {activeMobileProgram === program && (
                      <div className="mt-3 pl-4 space-y-4">
                        <Link
                          to={`/programs?program=${encodeURIComponent(program)}`}
                          onClick={closeMobileMenu}
                          className="block"
                        >
                          <div className="font-medium">Program Info</div>
                          <div className="text-sm text-gray-400">
                            Overview & students projects
                          </div>
                        </Link>


                        <Link
                          to={`/projects?program=${encodeURIComponent(program)}`}
                          onClick={closeMobileMenu}
                          className="block"
                        >

                      
 
                          <div className="font-medium">Projects</div>
                          <div className="text-sm text-gray-400">
                            List of all projects
                          </div>
                        </Link>

                        <Link
                          to={`/instructors?program=${encodeURIComponent(program)}`}
                          onClick={closeMobileMenu}
                          className="block"
                        >
                          <div className="font-medium">Instructors</div>
                          <div className="text-sm text-gray-400">
                            List of all instructors
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>


          
          


          <Link to="/projects" className="hover:text-brand-primary cursor-pointer transition">
            Projects
          </Link>
          <Link to="/contact" className="hover:text-brand-primary cursor-pointer transition">

            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
