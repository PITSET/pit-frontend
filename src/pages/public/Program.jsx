import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl"; 
import { Button } from "../../components/ui/Button"; 
import Loader from "../../components/ui/Loader"; 

import Breadcrumbs from "../../components/ui/Breadcrumbs"; 

const programSectionId = (value) => {
  const name = String(value || "").toLowerCase().trim();
  if (name.includes("mechatronics")) return "mechatronics-engineering";
  if (name.includes("software")) return "software-engineering";
  if (name.includes("mechanical")) return "mechanical-engineering";
  return name.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};


export default function Programs() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get("/programs");

        console.log("API Response:", res.data);

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

  useEffect(() => {
    const id = (location.hash || "").replace(/^#/, "");
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  if (loading) {
    return <Loader label="Loading Programs..." />;
  }

  if (isNavigating) {
    return <Loader label="Opening Program Details..." />;
  }

  if (error) {
    return (
      <div className="text-center py-20 text-brand-primary font-[Roboto]">
        {error}
      </div>
    );
  }

  const filterProgram = (searchParams.get("program") || "").trim();
  const filteredPrograms = filterProgram
    ? programs.filter(
      (p) =>
        (p?.program_name || "").toLowerCase() ===
        filterProgram.toLowerCase(),
    )
    : programs;

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-[1280px] mx-auto px-6">


        <h1 className="text-[50px] font-bold text-brand-primary mb-10 font-[Roboto_Condensed]">
          Programs
        </h1>

        {/* Programs Grid */}
        <div className="grid grid-cols-3 gap-8 justify-items-center">

          {filteredPrograms.length === 0 ? (
            <p className="col-span-3 text-gray-500">
              No programs found.
            </p>
          ) : (
            filteredPrograms.map((program) => (
              <div
                key={program.id}

                className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden group"

                id={programSectionId(program?.program_name)}
              

                style={{ width: "400px", height: "510px" }}
              >

                {/* Program Image */}
                <img
                  src={resolveAssetUrl(program.image_url)}
                  alt={program.program_name}
                  className="object-cover"
                  style={{ width: "400px", height: "260px" }}
                />

                {/* Content */}
                <div className="p-6 flex flex-col grow">

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

                  <div className="mt-auto flex justify-end pt-4">
                    <Button
                      variant="link"
                      onClick={() => {
                        setIsNavigating(true);
                        navigate(`/programs/${program.id}`);
                      }}
                    >
                      Read More
                    </Button>
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
