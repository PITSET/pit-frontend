import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import { Button } from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { motion } from "framer-motion";

import Footer from "../../components/layout/Footer";

const programSectionId = (value) => {
  const name = String(value || "").toLowerCase().trim();
  if (name.includes("mechatronics")) return "mechatronics-engineering";
  if (name.includes("software")) return "software-engineering";
  if (name.includes("mechanical")) return "mechanical-engineering";
  return name.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};


import { usePrograms } from "../../hooks/usePrograms";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.15,
      staggerChildren: 0.1,
      delayChildren: 0.2 + i * 0.15
    }
  })
};

const textVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const titleLeftVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const titleRightVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Programs() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: programs = [], isLoading: loading, error } = usePrograms();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 overflow-x-hidden">

      {/* SECTION 1: PROGRAMS LIST */}
      <section className="px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="w-full">

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[56px] font-bold text-brand-primary mb-12 font-[Roboto_Condensed] leading-none"
          >
            Programs
          </motion.h1>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">

            {filteredPrograms.length === 0 ? (
              <p className="col-span-full text-gray-500 text-lg">
                No programs found.
              </p>
            ) : (
              filteredPrograms.map((program, index) => {
                const nameParts = (program?.program_name || "").trim().split(" ");
                const topName = nameParts[0] || "";
                const bottomName = nameParts.slice(1).join(" ");

                return (
                  <motion.div
                    custom={index % 4}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    whileHover={{ y: -8 }}
                    key={program.id}
                    className="bg-white rounded-[24px] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group border border-gray-100 h-full w-full max-w-[400px] mx-auto hover:-translate-y-2"
                    id={programSectionId(program?.program_name)}
                  >

                    {/* Program Image */}
                    <div className="h-[240px] w-full overflow-hidden shrink-0">
                      <img
                        src={resolveAssetUrl(program.image_url)}
                        alt={program.program_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col grow">

                      {/* Title */}
                      <div
                        className="mb-4 flex flex-col overflow-hidden"
                        style={{
                          fontFamily: "Roboto Condensed",
                          fontWeight: "700",
                          fontSize: "32px",
                          lineHeight: "1.1",
                        }}
                      >
                        {topName && (
                          <motion.h3
                            variants={titleLeftVariant}
                            className="text-brand-primary block"
                          >
                            {topName}
                          </motion.h3>
                        )}
                        {bottomName && (
                          <motion.h3
                            variants={titleRightVariant}
                            className="text-brand-primary block"
                          >
                            {bottomName}
                          </motion.h3>
                        )}
                      </div>

                      {/* Description */}
                      <motion.p variants={textVariants} className="text-gray-600 text-[16px] leading-relaxed font-[Roboto] line-clamp-4">
                        {program.description}
                      </motion.p>

                      <motion.div variants={textVariants} className="mt-auto flex justify-end pt-6">
                        <Button
                          variant="link"
                          className=" text-brand-text-secondary hover:text-brand-primary font-bold hover:gap-2 transition-all p-0 flex items-center gap-1"
                          onClick={() => {
                            setIsNavigating(true);
                            navigate(`/programs/${program.id}`);
                          }}
                        >
                          Read More <span className="text-xl"></span>
                        </Button>
                      </motion.div>

                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: FOOTER */}
      <section className="mt-20">
        <Footer />
      </section>

    </div>
  );
}
