import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProgramDetail() {
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/programs/${id}`
        );

        const programData = res.data?.data;

        setProgram(programData);
        setProjects(programData?.projects || []);
      } catch (err) {
        console.error("Failed to fetch program:", err);
        setError("Failed to load program.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg font-[Roboto]">
        Loading...
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

  if (!program) {
    return (
      <div className="text-center py-20 text-gray-500 font-[Roboto]">
        Program not found.
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
  {/* HERO SECTION */}
<div className="relative w-full min-h-screen overflow-hidden">

  {/* Background Image */}
  <img
    src={program.image_url}
    alt={program.program_name}
    className="absolute inset-0 w-full h-full object-cover object-center"
  />

  {/* Dark Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0b2545]/90 via-[#0b2545]/70 to-transparent"></div>

  {/* Content */}
  <div className="relative max-w-[1280px] mx-auto min-h-screen flex items-center px-6">

    <div className="max-w-[520px] text-white">

      <h1 className="text-[48px] leading-[56px] font-bold font-[Roboto_Condensed] mb-6">
        {program.program_name}
      </h1>

      <p className="text-[18px] leading-[30px] font-[Roboto] text-gray-200">
        {program.description}
      </p>

    </div>

  </div>

</div>

{/* PROGRAM OVERVIEW */}
<section className="relative w-full min-h-screen flex items-center overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 bg-gray-200"></div>

  {/* Optional soft gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200"></div>

  {/* Content */}
  <div className="relative max-w-[900px] mx-auto text-center px-6">

    <h2 className="text-red-700 mb-8 font-[Roboto_Condensed] font-bold text-[64px]">
      Program Overview
    </h2>

    <p className="text-gray-700 leading-relaxed font-[Roboto] text-[24px]">
      {program.overview}
    </p>

  </div>

</section>

      {/* PROJECTS SECTION */}
      <section className="max-w-[] mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[36px] font-bold text-red-600 font-[Roboto_Condensed]">
            Projects
          </h2>

          <button className="text-red-600 font-semibold hover:underline">
            VIEW MORE →
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500 font-[Roboto]">
            No projects available.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-[180px] w-full object-cover"
                />

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-[22px] mb-3 font-[Roboto_Condensed]">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 text-[16px] mb-6 font-[Roboto]">
                    {project.description}
                  </p>

                  <button className="mt-auto bg-[#E73F0F] hover:bg-[#cf360b] text-white w-[108px] h-[38px] rounded transition">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}