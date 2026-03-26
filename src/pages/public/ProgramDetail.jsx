import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";
import { Helmet } from "react-helmet-async";
import Footer from "../../components/layout/Footer";
import { motion } from "framer-motion";
import { HiUsers } from "react-icons/hi";
import { Button } from "../../components/ui/Button";

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
        // Fetch program details and projects list in parallel to ensure we get linkage
        const [programRes, projectsRes] = await Promise.all([
          api.get(`/programs/${id}`),
          api.get("/projects").catch(() => ({ data: [] }))
        ]);

        const programData = programRes.data?.data || programRes.data;

        if (programData) {
          setProgram(programData);

          // Get projects from nested program data (if joined) OR from the full projects list
          const nestedProjects = programData.projects || programData.Project || [];

          if (nestedProjects.length > 0) {
            setProjects(nestedProjects);
            console.log("Projects found via nested API join:", nestedProjects.length);
          } else {
            // Fallback: Manually filter all projects that mention this program ID
            const allProjects = Array.isArray(projectsRes.data)
              ? projectsRes.data
              : projectsRes.data?.data || projectsRes.data?.projects || [];

            const linkedProjects = allProjects.filter(p => {
              const pProgs = Array.isArray(p.programs) ? p.programs : [];
              return pProgs.some(prog => {
                const progId = typeof prog === 'object' ? prog.id : prog;
                return String(progId) === String(id);
              });
            });

            setProjects(linkedProjects);
            console.log("Projects found via manual filter from /projects:", linkedProjects.length);
          }
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

  const nameParts = (program?.program_name || "").trim().split(" ");
  const topName = nameParts[0] || "";
  const bottomName = nameParts.slice(1).join(" ");

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
            <h1 className="flex flex-col overflow-hidden text-[48px] md:text-[64px] leading-tight font-bold font-[Roboto_Condensed] mb-6 uppercase">
              {topName && (
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {topName}
                </motion.span>
              )}
              {bottomName && (
                <motion.span
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="block"
                >
                  {bottomName}
                </motion.span>
              )}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="text-[18px] leading-[30px] font-[Roboto] text-gray-200"
            >
              {program.description}
            </motion.p>
          </div>
        </div>
      </div>

      {/* PROGRAM OVERVIEW */}
      <section className="relative w-full min-h-[600px] flex items-center overflow-hidden py-24 bg-gray-50">
        <div className="max-w-[900px] mx-auto text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="text-red-700 mb-8 font-[Roboto_Condensed] font-bold text-[56px] md:text-[64px] uppercase"
          >
            Program Overview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="text-gray-700 leading-relaxed font-[Roboto] text-[20px] md:text-[24px] whitespace-pre-wrap wrap-break-word"
          >
            {program.overview || program.description}
          </motion.p>
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
            {projects.map((project) => {
              // Robust image resolution similar to Home.jsx
              let imgVal = project?.image || project?.image_url || project?.cover || project?.cover_url;
              if (!imgVal && project?.images) {
                imgVal = Array.isArray(project.images) ? project.images[0] : project.images;
                if (typeof imgVal === "string" && imgVal.startsWith("[")) {
                  try {
                    const parsed = JSON.parse(imgVal);
                    imgVal = Array.isArray(parsed) ? parsed[0] : imgVal;
                  } catch (e) {
                    console.log("Failed to parse image string", e);
                  }
                }
              }

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[8px_8px_20_rgba(0,0,0,0.04)] flex flex-col h-full hover:shadow-[12px_12px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1"
                >
                  {/* Image */}
                  <Link to={`/projects/${project.id}`} className="block h-[240px] w-full overflow-hidden bg-gray-100 relative group">
                    <img
                      src={resolveAssetUrl(imgVal)}
                      alt={project.title || project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {(project.date || project.created_at) && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] font-bold text-brand-primary uppercase tracking-wider shadow-sm">
                        {project.date || project.created_at.split('T')[0]}
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-8 flex flex-col grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {project.title || project.name}
                    </h3>
                    <p className="text-gray-500 text-[15px] leading-relaxed mb-8 line-clamp-3">
                      {project.description || project.overview || project.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <HiUsers className="text-lg" />
                        <span className="text-[14px] font-bold">{project.students?.length || 0}</span>
                      </div>
                      <Button variant="link" asChild>
                        <Link to={`/projects/${project.id}`}>
                          Read More
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}