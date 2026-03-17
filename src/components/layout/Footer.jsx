import React from "react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import logo from "../../assets/logo/logo.svg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footerBg font-roboto mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          {/* Logo */}
          <div>
            <a href="/">
              <img src={logo} alt="logo" className="h-10 cursor-pointer" />
            </a>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[240px]">
              Shaping future technologists through excellence in education.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">About</h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li>
                <a href="/about" className="hover:text-black transition cursor-pointer">About</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-black transition cursor-pointer">Contact Us</a>
              </li>
              <li>
                <a href="/history" className="hover:text-black transition cursor-pointer">History</a>
              </li>
              <li>
                <a href="/vision" className="hover:text-black transition cursor-pointer">Vision</a>
              </li>
              <li>
                <a href="/mission" className="hover:text-black transition cursor-pointer">Mission</a>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">Programs</h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li>
                <a href="/program" className="hover:text-black transition cursor-pointer">Program</a>
              </li>
              <li>
                <a href="/program/mechanical-engineering" className="hover:text-black transition cursor-pointer">ME Program</a>
              </li>
              <li>
                <a href="/program/mechatronics-engineering" className="hover:text-black transition cursor-pointer">JME Program</a>
              </li>
              <li>
                <a href="/program/software-engineering" className="hover:text-black transition cursor-pointer">SE Program</a>
              </li>
              <li>
                <a href="/instructor" className="hover:text-black transition cursor-pointer">Instructor</a>
              </li>
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">Projects</h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li>
                <a href="/projects" className="hover:text-black transition cursor-pointer">Project</a>
              </li>
              <li>
                <a href="/projects/software-engineering" className="hover:text-black transition cursor-pointer">SE Projects</a>
              </li>
              <li>
                <a href="/projects/mechatronics-engineering" className="hover:text-black transition cursor-pointer">JME Projects</a>
              </li>
              <li>
                <a href="/projects/mechanical-engineering" className="hover:text-black transition cursor-pointer">ME Projects</a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">
              Follow us
            </h3>

            <ul className="space-y-3 text-sm uppercase tracking-wide">
              <li>
                <a href="https://www.facebook.com/share/1CZeL9A9Fs/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition cursor-pointer">
                  <FaFacebookF className="text-blue-600" />
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@PrometheusInstituteofTechnolog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition cursor-pointer">
                  <FaYoutube className="text-brand-primary" />
                  Youtube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mt-12"></div>

        {/* Bottom */}
        <div className="text-center text-xs text-gray-600 mt-5 tracking-wide">
          © {year} Prometheus Institute of Technology | All Rights Reserved |
          Terms and Conditions | Privacy Policy
        </div>
      </div>
    </footer>
  );
}
