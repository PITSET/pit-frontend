import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo/logo.svg";
import { usePrograms } from "../../hooks/usePrograms";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopProgramOpen, setIsDesktopProgramOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [activeMobileProgram, setActiveMobileProgram] = useState(null);
  
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms();
  const location = useLocation();

  // Close all menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDesktopProgramOpen(false);
    setIsProgramOpen(false);
    setActiveMobileProgram(null);
  }, [location.pathname, location.search]);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsDesktopProgramOpen(false);
    setIsProgramOpen(false);
    setActiveMobileProgram(null);
  };

  const toggleMobileProgram = (program) => {
    setActiveMobileProgram(activeMobileProgram === program ? null : program);
  };

  return (
    <nav className="w-full bg-white shadow-md sticky top-0 z-50">
      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center h-[90px] px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto relative">
        {/* Logo */}
        <Link to="/" onClick={closeAllMenus} className="flex items-center shrink-0">
          <img src={logo} alt="logo" className="h-12 md:h-16" />
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex items-center gap-8 xl:gap-16 font-medium text-gray-700 text-[17px]">
          <li>
            <Link
              to="/about"
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors"
            >
              About
            </Link>
          </li>

          {/* ================= PROGRAMS DROPDOWN ================= */}
          <li
            className="relative h-[90px] flex items-center"
            onMouseEnter={() => setIsDesktopProgramOpen(true)}
            onMouseLeave={() => setIsDesktopProgramOpen(false)}
          >
            <button className="hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer outline-none">
              Programs
              <span className={`text-[10px] transition-transform duration-300 ${isDesktopProgramOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Red Underline Animation */}
            <div
              className={`absolute left-0 bottom-[30px] h-[2px] bg-red-600 transition-all duration-300 ${isDesktopProgramOpen ? "w-full" : "w-0"}`}
            />

            {/* DROPDOWN CONTENT */}
            <div
              className={`absolute top-[90px] right-0 lg:right-[-100px] xl:right-[-150px]
              w-max min-w-[800px] max-w-[95vw]
              transition-all duration-300 ease-out z-60 ${isDesktopProgramOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
            >
              <div className="bg-white rounded-b-2xl shadow-2xl border-t border-gray-50 overflow-hidden">
                <div className="p-8 grid grid-cols-3 gap-8">
                  {programs.map((program) => (
                    <div key={program.id} className="space-y-4">
                      <h3 className="text-red-600 font-bold text-base tracking-wide uppercase border-b border-gray-100 pb-2">
                        {program.program_name}
                      </h3>

                      <ul className="space-y-4">
                        {[
                          { label: "Program Info", sub: "Overview & projects", path: `/programs/${program.id}` },
                          { label: "Projects", sub: "List of all projects", path: `/projects?program=${encodeURIComponent(program.program_name)}` },
                          { label: "Instructors", sub: "Meet our faculty", path: `/instructors?program=${encodeURIComponent(program.program_name)}` }
                        ].map((link) => (
                          <li key={link.label} className="group">
                            <Link
                              to={link.path}
                              onClick={closeAllMenus}
                              className="block"
                            >
                              <div className="text-gray-800 font-semibold group-hover:text-red-600 transition-colors">
                                {link.label}
                              </div>
                              <div className="text-xs text-gray-400 font-normal">
                                {link.sub}
                              </div>
                            </Link>
                          </li>
                        ))}
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
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors"
            >
              Projects
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* ================= MOBILE TOGGLE ================= */}
        <button
          className="lg:hidden p-2 text-2xl text-gray-700 hover:text-red-600 transition-colors z-50 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* ================= MOBILE MENU DRAWER ================= */}
      <div
        className={`lg:hidden fixed inset-0 top-[90px] z-40 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeAllMenus}
        />

        {/* Menu Content */}
        <div
          className={`absolute inset-x-0 top-0 bg-white shadow-xl px-6 py-8 overflow-y-auto max-h-[calc(100vh-90px)] transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="flex flex-col gap-6 font-semibold text-[18px]">
            <Link 
              to="/about" 
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors pb-2 border-b border-gray-50"
            >
              About
            </Link>

            {/* Mobile Programs Accordion */}
            <div className="flex flex-col">
              <button
                className="flex justify-between items-center w-full hover:text-red-600 transition-colors pb-2"
                onClick={() => setIsProgramOpen(!isProgramOpen)}
              >
                <span>Programs</span>
                <span className={`text-xl transition-transform duration-300 ${isProgramOpen ? "rotate-45" : ""}`}>+</span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isProgramOpen ? "max-h-[1000px] mt-4" : "max-h-0"}`}>
                <div className="flex flex-col gap-6 pl-4 border-l-2 border-red-50">
                  {programs.map((program) => (
                    <div key={program.id} className="flex flex-col gap-3">
                      <button
                        className="flex justify-between items-center text-sm uppercase tracking-wider text-gray-500 font-bold"
                        onClick={() => toggleMobileProgram(program.program_name)}
                      >
                        {program.program_name}
                        <span className="text-xs">{activeMobileProgram === program.program_name ? "−" : "+"}</span>
                      </button>

                      <div className={`flex flex-col gap-4 pl-4 overflow-hidden transition-all duration-300 ${activeMobileProgram === program.program_name ? "max-h-[200px] mt-2" : "max-h-0"}`}>
                        {[
                          { label: "Program Info", path: `/programs/${program.id}` },
                          { label: "Projects", path: `/projects?program=${encodeURIComponent(program.program_name)}` },
                          { label: "Instructors", path: `/instructors?program=${encodeURIComponent(program.program_name)}` }
                        ].map((link) => (
                          <Link
                            key={link.label}
                            to={link.path}
                            onClick={closeAllMenus}
                            className="text-gray-700 hover:text-red-600 text-base"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link 
              to="/projects" 
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors py-2 border-y border-gray-50"
            >
              Projects
            </Link>

            <Link 
              to="/contact" 
              onClick={closeAllMenus}
              className="hover:text-red-600 transition-colors py-2 border-b border-gray-50"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
