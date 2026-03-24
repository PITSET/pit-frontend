import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl"; 
import { Button } from "../../components/ui/Button"; 
import Loader from "../../components/ui/Loader"; 

import Breadcrumbs from "../../components/ui/Breadcrumbs"; 
import Footer from "../../components/layout/Footer";

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
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-100">
      
      {/* SECTION 1: PROGRAMS LIST */}
      <section className="min-h-screen snap-start pt-12 pb-20 px-8">
        <div className="w-full">
          <div className="pb-8">
            <Breadcrumbs />
          </div>

          <h1 className="text-[56px] font-bold text-brand-primary mb-12 font-[Roboto_Condensed] leading-none">
            Programs
          </h1>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">

            {filteredPrograms.length === 0 ? (
              <p className="col-span-full text-gray-500 text-lg">
                No programs found.
              </p>
            ) : (
              filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100"
                  id={programSectionId(program?.program_name)}
                  style={{ width: "100%", maxWidth: "400px", height: "540px" }}
                >

                  {/* Program Image */}
                  <div className="h-[280px] overflow-hidden shrink-0">
                    <img
                      src={resolveAssetUrl(program.image_url)}
                      alt={program.program_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col grow">

                    {/* Title */}
                    <h3
                      className="text-brand-primary mb-4"
                      style={{
                        fontFamily: "Roboto Condensed",
                        fontWeight: "700",
                        fontSize: "32px",
                        lineHeight: "1.1",
                      }}
                    >
                      {program.program_name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-[16px] leading-relaxed font-[Roboto] line-clamp-4">
                      {program.description}
                    </p>

                    <div className="mt-auto flex justify-end pt-6">
                      <Button
                        variant="link"
                        className="text-brand-primary font-bold hover:gap-2 transition-all p-0 flex items-center gap-1"
                        onClick={() => {
                          setIsNavigating(true);
                          navigate(`/programs/${program.id}`);
                        }}
                      >
                        Read More <span className="text-xl">→</span>
                      </Button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: FOOTER */}
      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>

    </div>
  );
}
