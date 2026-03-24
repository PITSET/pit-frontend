import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";
import { Helmet } from "react-helmet-async";
import Footer from "../../components/layout/Footer";

export default function ProgramDetail() {
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/programs/${id}`);
        const programData = res.data?.data;

        if (programData) {
          setProgram(programData);
          setProjects(programData.projects || []);
        }
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
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{program.program_name} | Program Detail</title>
        <meta name="description" content={program.description} />
      </Helmet>

      {/* HERO SECTION */}
      <div className="relative w-full min-h-screen overflow-hidden">
        

        {/* Background Image */}
        <img
          src={resolveAssetUrl(program.image_url)}
          alt={program.program_name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2545]/90 via-[#0b2545]/70 to-transparent"></div>

        {/* Content */}
        <div className="relative max-w-[1248px] mx-auto min-h-screen flex items-center px-6">
          <div className="max-w-[520px] text-white">
            <h1 className="text-[48px] md:text-[64px] leading-tight font-bold font-[Roboto_Condensed] mb-6 uppercase">
              {program.program_name}
            </h1>
            <p className="text-[18px] leading-[30px] font-[Roboto] text-gray-200">
              {program.description}
            </p>
          </div>
        </div>
      </div>

      {/* PROGRAM OVERVIEW */}
      <section className="relative w-full min-h-[600px] flex items-center overflow-hidden py-24 bg-gray-50">
        <div className="max-w-[900px] mx-auto text-center px-6">
          <h2 className="text-red-700 mb-8 font-[Roboto_Condensed] font-bold text-[56px] md:text-[64px] uppercase">
            Program Overview
          </h2>
          <p className="text-gray-700 leading-relaxed font-[Roboto] text-[20px] md:text-[24px] whitespace-pre-wrap wrap-break-word">
            {program.overview || program.description}
          </p>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="max-w-[1248px] mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
          <h2 className="text-[36px] md:text-[48px] font-bold text-red-600 font-[Roboto_Condensed] uppercase leading-none">
            Projects
          </h2>
          <Link to="/projects" className="text-red-600 font-bold hover:underline tracking-widest text-sm">
            VIEW MORE →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-[Roboto] text-xl">
              No projects available for this program.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
              >
                <div className="h-[220px] overflow-hidden">
                  <img
                    src={resolveAssetUrl(project.image || project.image_url || project.cover_url)}
                    alt={project.name || project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-8 flex flex-col grow">
                  <h3 className="font-bold text-[24px] mb-4 font-[Roboto_Condensed] line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                    {project.name || project.title}
                  </h3>
                  <p className="text-gray-600 text-[16px] mb-8 font-[Roboto] line-clamp-3 leading-relaxed">
                    {project.overview || project.description || project.desc}
                  </p>
                  <Link 
                    to={`/projects/${project.id}`}
                    className="mt-auto bg-[#E73F0F] hover:bg-[#cf360b] text-white px-8 py-3 rounded-xl transition text-center font-bold tracking-wide shadow-lg shadow-orange-200 active:scale-95"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}