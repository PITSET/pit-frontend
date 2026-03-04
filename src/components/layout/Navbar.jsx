import React, { useState } from "react";
import logo from "../../assets/logo.svg";

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
    setActiveMobileProgram(
      activeMobileProgram === program ? null : program
    );
  };

  return (
    <div className="w-full bg-white shadow-md relative z-50">
      
      {/* ================= NAVBAR ================= */}
      <header className="flex justify-between items-center h-[90px] px-8 lg:px-24 relative">
        
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src={logo} alt="logo" className="h-16" />
        </a>

        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex items-center gap-16 font-medium text-gray-700 text-[17px] relative">

          <li className="hover:text-red-600 transition cursor-pointer">
            About
          </li>

          {/* ================= PROGRAMS ================= */}
          <li
            className="relative"
            onMouseEnter={() => setIsDesktopProgramOpen(true)}
            onMouseLeave={() => setIsDesktopProgramOpen(false)}
          >
            <span className="hover:text-red-600 transition flex items-center gap-1 cursor-pointer">
              Programs
              <span className="text-xs">▼</span>
            </span>

            {/* 🔴 Red Underline */}
            <div
              className={`absolute left-0 -bottom-2 h-[2px] bg-red-600 transition-all duration-300 ${
                isDesktopProgramOpen ? "w-full" : "w-0"
              }`}
            />

            {/* ================= DROPDOWN ================= */}
            <div
              className={`absolute top-full mt-8 right-[-140px]
              w-[1000px] max-w-[90vw]
              transition-all duration-300 ${
                isDesktopProgramOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-3"
              }`}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
                <div className="p-10 grid grid-cols-3 gap-14">

                  {programs.map((program) => (
                    <div key={program}>
                      <h3 className="text-red-600 font-semibold text-lg mb-5">
                        {program}
                      </h3>

                      <ul className="space-y-6">

                        {/* Program Info */}
                        <li className="group cursor-pointer">
                          <div className="text-gray-800 font-medium group-hover:text-red-600 transition">
                            Program Info
                          </div>
                          <div className="text-sm text-gray-400">
                            Overview & students projects
                          </div>
                        </li>

                        {/* Projects */}
                        <li className="group cursor-pointer">
                          <div className="text-gray-800 font-medium group-hover:text-red-600 transition">
                            Projects
                          </div>
                          <div className="text-sm text-gray-400">
                            List of all projects
                          </div>
                        </li>

                        {/* Instructors */}
                        <li className="group cursor-pointer">
                          <div className="text-gray-800 font-medium group-hover:text-red-600 transition">
                            Instructors
                          </div>
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

          <li className="hover:text-red-600 transition cursor-pointer">
            Contact
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
        className={`lg:hidden bg-white shadow-md px-6 overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-[800px] py-6" : "max-h-0"
        }`}
      >
        <div className="space-y-6 font-medium">

          <div className="hover:text-red-600 cursor-pointer transition">
            About
          </div>

          <div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsProgramOpen(!isProgramOpen)}
            >
              <span className="hover:text-red-600 transition">
                Programs
              </span>
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
                      <span>
                        {activeMobileProgram === program ? "−" : "+"}
                      </span>
                    </div>

                    {activeMobileProgram === program && (
                      <div className="mt-3 pl-4 space-y-4">

                        <div>
                          <div className="font-medium">Program Info</div>
                          <div className="text-sm text-gray-400">
                            Overview & students projects
                          </div>
                        </div>

                        <div>
                          <div className="font-medium">Projects</div>
                          <div className="text-sm text-gray-400">
                            List of all projects
                          </div>
                        </div>

                        <div>
                          <div className="font-medium">Instructors</div>
                          <div className="text-sm text-gray-400">
                            List of all instructors
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hover:text-red-600 cursor-pointer transition">
            Contact
          </div>

        </div>
      </div>

    </div>
  );
}