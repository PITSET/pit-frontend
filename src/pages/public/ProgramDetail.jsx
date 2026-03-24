import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";
import { Helmet } from "react-helmet-async";
import { HiUsers } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Footer from "../../components/layout/Footer";

import axios from "axios";

export default function ProgramDetail() {
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        // 1. Fetch the program details
        const progRes = await api.get(`/programs/${id}`);
        const programData = progRes.data?.data;

        if (!programData) {
          setProgram(null);
          setLoading(false);
          return;
        }

        setProgram(programData);

        // 2. Fetch all projects to filter them correctly (some might not be directly in the program response)
        const projRes = await api.get("/projects");
        const allProjects = Array.isArray(projRes.data) ? projRes.data : projRes.data?.data || projRes.data?.projects || [];

        const targetProgramName = (programData.program_name || "").toLowerCase().trim();

        // 3. Filter projects matching this program (Logic from ProjectsCollection)
        const matchedProjects = allProjects
          .filter((item) => item?.is_active !== false)
          .filter((project) => {
            const programList = Array.isArray(project.programs) ? project.programs : [];
            const matchesArray = programList.some((p) => {
              const name = (typeof p === "object" ? p.program_name || p.name : p) || "";
              return name.toLowerCase().trim() === targetProgramName;
            });

            const matchesSingle = (project.program || "").toLowerCase().trim() === targetProgramName;

            return matchesArray || matchesSingle;
          })
          .slice(0, 3) // Show only 3 projects
          .map((item) => {
            let imgVal = item?.image || item?.image_url || item?.cover || item?.cover_url;
            if (!imgVal && item?.images) {
              const imagesArr = Array.isArray(item.images)
                ? item.images
                : typeof item.images === "string" && item.images.startsWith("[")
                  ? JSON.parse(item.images)
                  : [item.images];
              imgVal = imagesArr[0];
            }

            return {
              ...item,
              id: item.id || item._id,
              title: item.name || item.title || "",
              description: item.overview || item.desc || item.description || item.content || "",
              image: resolveAssetUrl(imgVal || ""),
            };
          });

        setProjects(matchedProjects);
      } catch (err) {
        console.error("Failed to fetch program details:", err);
        setError("Failed to load program.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
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
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-100">

      {/* SECTION 1: HERO SECTION */}
      <section className="relative h-screen snap-start overflow-hidden flex flex-col">

        {/* Breadcrumb Overlay */}
        <div className="absolute top-12 left-0 w-full px-8 z-30">
          <Breadcrumbs />
        </div>

        {/* Background Image */}
        <img
          src={resolveAssetUrl(program.image_url)}
          alt={program.program_name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0b2545]/90 via-[#0b2545]/70 to-transparent"></div>

        {/* Content */}
        <div className="relative flex-grow flex items-center px-8">
          <div className="max-w-2xl text-white">
            <h1 className="text-[48px] md:text-[64px] lg:text-[72px] leading-none font-bold font-[Roboto_Condensed] mb-8">
              {program.program_name}
            </h1>
            <p className="text-[18px] md:text-[20px] leading-relaxed font-[Roboto] text-gray-200 max-w-xl">
              {program.description}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROGRAM OVERVIEW */}
      <section className="relative h-screen snap-start flex items-center bg-gray-50 px-8">
        <div className="w-full flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/3">
            <h2 className="text-brand-primary font-[Roboto_Condensed] font-bold text-[56px] md:text-[72px] leading-none uppercase">
              Program<br />Overview
            </h2>
          </div>
          <div className="w-full md:w-2/3 border-l-4 border-brand-primary pl-10">
            <p className="text-gray-700 leading-relaxed font-[Roboto] text-[20px] md:text-[24px]">
              {program.overview}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS SECTION */}
      <section className="snap-start min-h-screen py-20 bg-white flex flex-col justify-center">
        <div className="w-full px-8">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-100 pb-6">
            <h2 className="text-[32px] md:text-[48px] font-bold text-brand-primary font-[Roboto_Condensed] uppercase leading-none">
              Projects
            </h2>
            <Link
              to="/projects"
              className="text-brand-primary font-bold uppercase text-sm tracking-widest flex items-center group transition-colors pb-2"
            >
              ALL PROJECTS <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-500 font-[Roboto] text-xl">
                No projects available in this program.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <Link to={`/projects/${project.id}`} className="block h-[260px] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-8 flex flex-col grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-[15px] leading-relaxed mb-8 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <HiUsers className="text-lg" />
                        <span className="text-[14px] font-bold">{project.students?.length || 0}</span>
                      </div>
                      <Link to={`/projects/${project.id}`} className="text-brand-primary font-bold text-sm tracking-wider hover:underline">
                        READ MORE →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: FOOTER */}
      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>
    </div>
  );
}
