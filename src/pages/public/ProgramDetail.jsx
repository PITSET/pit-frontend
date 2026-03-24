import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";
import { Helmet } from "react-helmet-async";
import { HiUsers } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

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
    <div className="bg-gray-100 pb-10">
      <div className="max-w-[1280px] mx-auto px-6 py-4">
        <Breadcrumbs />
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
      <section className="bg-white py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-100 pb-6">
            <h2 className="text-[32px] md:text-[48px] font-bold text-red-600 font-[Roboto_Condensed] uppercase tracking-tight leading-none">
              Projects
            </h2>
            <Link
              to="/projects"
              className="text-red-600 font-bold uppercase text-sm tracking-[0.2em] flex items-center group transition-colors hover:text-red-700 pb-2"
            >
              ALL PROJECTS <span className="ml-2 group-hover:translate-x-1 transition-transform">›</span>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-[Roboto] text-xl">
                No projects available in this program.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group/card bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[8px_8px_20px_rgba(0,0,0,0.04)] flex flex-col h-full hover:shadow-[12px_12px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1"
                  >
                    {/* Card Image */}
                    <Link
                      to={`/projects/${project.id}`}
                      className="block h-[240px] w-full overflow-hidden bg-gray-100 relative group/image"
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      {project.date && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] font-bold text-red-600 uppercase tracking-wider shadow-sm">
                          {project.date}
                        </div>
                      )}
                    </Link>

                    {/* Card Content */}
                    <div className="p-8 flex flex-col grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover/card:text-brand-primary transition-colors">
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
                        <Button variant="link" asChild className="p-0 h-auto text-brand-text-secondary font-bold">
                          <Link to={`/projects/${project.id}`}>
                            Read More
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </section>
    </div>
  );
}
