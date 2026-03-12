import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/programs");

        console.log("API Response:", res.data); // Debug

        // handle different backend response structures
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setPrograms(data);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 font-[Roboto] text-lg">
        Loading programs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-[Roboto]">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-3 font-[Roboto] text-[16px]">
          <Link to="/" className="text-gray-800 hover:text-red-600 transition">
            Home
          </Link>

          <span className="text-red-600 text-xl font-bold">›</span>

          <Link to="/programs" className="text-red-600 hover:underline">
            Programs
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-[50px] font-bold text-red-600 mb-10 font-[Roboto_Condensed]">
          Programs
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-8 justify-items-center">
          {programs.length === 0 ? (
            <p className="col-span-3 text-gray-500">No programs found.</p>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden"
                style={{ width: "400px", height: "510px" }}
              >
                {/* Image */}
                <img
                  src={program.image_url}
                  alt={program.title}
                  className="object-cover"
                  style={{ width: "400px", height: "260px" }}
                />

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "Roboto Condensed",
                      fontWeight: "700",
                      fontSize: "30px",
                    }}
                  >
                    {program.program_name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-[16px] leading-relaxed font-[Roboto]">
                    {program.description}
                  </p>

                  {/* Button */}
                  <div className="mt-auto flex justify-end pt-4">
                    <button
                      className="bg-[#E73F0F] hover:bg-[#cf360b] text-white text-sm rounded-md transition"
                      style={{ width: "108px", height: "38px" }}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}