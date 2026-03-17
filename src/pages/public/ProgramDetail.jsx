import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import { Button } from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { Link } from "react-router-dom";

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
        const res = await api.get(`/programs/${id}`);

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
    return <Loader label="Loading Program Details..." />;
  }

  if (error) {
    return (
      <div className="text-center py-20 text-brand-primary font-[Roboto]">
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
      <div className="max-w-[1280px] mx-auto px-6 pt-8">
      </div>
      {/* HERO SECTION */}
      <div className="relative w-full min-h-screen overflow-hidden">

        {/* Background Image */}
        <img
          src={resolveAssetUrl(program.image_url)}
          alt={program.program_name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0b2545]/90 via-[#0b2545]/70 to-transparent"></div>

        {/* Content */}
        <div className="relative max-w-[1280px] mx-auto min-h-screen flex items-center justify-center lg:justify-start px-6">

          <div className="max-w-[520px] text-white text-center lg:text-left mx-auto lg:mx-0">

            <h1 className="text-[32px] md:text-[40px] lg:text-[48px] leading-tight font-bold font-[Roboto_Condensed] mb-6">
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
        <div className="absolute inset-0 bg-linear-to-b from-gray-200 via-gray-100 to-gray-200"></div>

        {/* Content */}
        <div className="relative max-w-[900px] mx-auto text-center px-6">

          <h2 className="text-brand-primary-dark mb-8 font-[Roboto_Condensed] font-bold text-[64px]">
            Program Overview
          </h2>

          <p className="text-gray-700 leading-relaxed font-[Roboto] text-[24px]">
            {program.overview}
          </p>

        </div>

      </section>

      {/* PROJECTS SECTION */}
      <section className="max-w-[1280px] mx-auto px-6 pb-24 mt-16">
        <div className="flex justify-between items-end mb-12 border-b-2 border-gray-100 pb-6">
          <h2 className="text-[48px] md:text-[64px] font-bold text-red-600 font-[Roboto_Condensed] uppercase tracking-tight leading-none">
            Projects
          </h2>

          <Link 
            to="/projects" 
            className="text-red-600 font-bold uppercase text-sm tracking-[0.2em] flex items-center group transition-colors hover:text-red-700 pb-2"
          >
            VIEW MORE <span className="ml-2 group-hover:translate-x-1 transition-transform">›</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-[Roboto] text-xl">
              No projects available in this program.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-[32px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden h-[260px]">
                  <img
                    src={resolveAssetUrl(project.image)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="p-8 flex flex-col grow">
                  <h3 className="font-bold text-[26px] mb-4 font-[Roboto_Condensed] text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 text-[17px] leading-relaxed mb-8 font-[Roboto] line-clamp-3 grow">
                    {project.description}
                  </p>

                  <div className="flex justify-start">
                    <Button variant="link" asChild className="p-0 h-auto text-red-600 font-bold">
                      <Link to={`/projects/${project.id}`}>
                        Read More
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
