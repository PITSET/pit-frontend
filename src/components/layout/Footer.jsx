import React from "react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import logo from "../../assets/logo.svg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footerBg font-roboto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">

          {/* Logo */}
          <div>
            <img src={logo} alt="logo" className="h-10" />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-[240px]">
              Shaping future technologists through excellence in education.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">
              About
            </h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li className="hover:text-black transition cursor-pointer">About</li>
              <li className="hover:text-black transition cursor-pointer">Contact Us</li>
              <li className="hover:text-black transition cursor-pointer">History</li>
              <li className="hover:text-black transition cursor-pointer">Vision</li>
              <li className="hover:text-black transition cursor-pointer">Mission</li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">
              Programs
            </h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li className="hover:text-black transition cursor-pointer">ME Program</li>
              <li className="hover:text-black transition cursor-pointer">JME Program</li>
              <li className="hover:text-black transition cursor-pointer">SE Program</li>
              <li className="hover:text-black transition cursor-pointer">Instructor</li>
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">
              Projects
            </h3>
            <ul className="space-y-2 text-sm uppercase tracking-wide text-gray-700">
              <li className="hover:text-black transition cursor-pointer">SE Projects</li>
              <li className="hover:text-black transition cursor-pointer">JME Projects</li>
              <li className="hover:text-black transition cursor-pointer">ME Projects</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-4">
              Follow us
            </h3>

            <ul className="space-y-3 text-sm uppercase tracking-wide">
              <li className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition cursor-pointer">
                <FaFacebookF className="text-blue-600" />
                Facebook
              </li>

              <li className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition cursor-pointer">
                <FaYoutube className="text-red-600" />
                Youtube
              </li>

              <li className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition cursor-pointer">
                <FaInstagram className="text-pink-600" />
                Instagram
              </li>

              <li className="flex items-center gap-3 text-gray-700 hover:text-black transition cursor-pointer">
                <FaXTwitter />
                Twitter
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mt-12"></div>

        {/* Bottom */}
        <div className="text-center text-xs text-gray-600 mt-5 tracking-wide">
          © {year} Prometheus Institute of Technology | 
          All Rights Reserved | Terms and Conditions | Privacy Policy
        </div>
      </div>
    </footer>
  );
}