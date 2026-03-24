import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsArrowUpRightSquare, BsCheckCircleFill, BsListCheck } from "react-icons/bs";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Footer from "../../components/layout/Footer";

const formatProjectDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [programNames, setProgramNames] = useState([]);
  const [studentNames, setStudentNames] = useState([]);
  const [studentCount, setStudentCount] = useState(0);

  // Auto-slide: advance every 5 seconds when there are multiple images
  useEffect(() => {
    if (totalImages <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % totalImages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalImages]);

  // Scroll to top whenever navigating to a new project
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    let isActive = true;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const [projectRes, programsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get("/programs").catch(() => ({ data: [] })),
        ]);

        // Support either standard project array return with single object or object wrapper
        const data = Array.isArray(projectRes.data)
          ? projectRes.data[0]
          : projectRes.data?.data || projectRes.data?.project || projectRes.data;

        if (isActive && data) {
          setProject(data);

          // Resolve program names (handle IDs or Objects)
          const allPrograms = Array.isArray(programsRes.data)
            ? programsRes.data
            : programsRes.data?.data || programsRes.data?.programs || [];

          const projectPrograms = Array.isArray(data.programs) ? data.programs : [];
          const pNames = projectPrograms
            .map((pOrId) => {
              if (typeof pOrId === "object" && pOrId !== null) {
                return pOrId.program_name || pOrId.name;
              }
              const found = allPrograms.find((p) => String(p.id) === String(pOrId));
              return found?.program_name || found?.name || null;
            })
            .filter(Boolean);
          setProgramNames(pNames);

          // Resolve student names from project data (no separate fetch needed)
          const studentsData = Array.isArray(data.students) ? data.students : [];

          setStudentCount(studentsData.length);

          const sNames = studentsData
            .map(s => {
              if (typeof s === 'object' && s !== null) {
                return s.full_name || s.name;
              }
              return null;
            })
            .filter(Boolean);

          setStudentNames(sNames);
        }
      } catch (err) {
        console.error("Failed to fetch project detail:", err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return <Loader label="Loading project..." />;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-3xl font-bold font-sans text-gray-800">Project Not Found</h2>
        <p className="text-gray-500">The project you are looking for does not exist or was removed.</p>
      </div>
    );
  }

  // Handle various image formats
  let coverImage = "";
  let allImages = [];

  const mainImage = project.image || project.image_url || project.cover || project.cover_url;

  if (mainImage) {
    allImages.push(resolveAssetUrl(mainImage));
  }

  if (project.images) {
    let imagesArray = project.images;
    if (typeof imagesArray === "string" && imagesArray.startsWith("[")) {
      try {
        imagesArray = JSON.parse(imagesArray);
      } catch (e) {
        imagesArray = [imagesArray];
      }
    }

    if (Array.isArray(imagesArray)) {
      imagesArray.forEach(img => {
        const resolved = resolveAssetUrl(img);
        if (!allImages.includes(resolved)) {
          allImages.push(resolved);
        }
      });
    }
  }

  if (allImages.length === 0) {
    // Fallback gray image if literally no images exist
    coverImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3C/svg%3E";
    allImages = [coverImage];
  } else {
    coverImage = allImages[activeImageIndex];
  }

  // Keep totalImages in sync so the auto-slide interval can reference the count
  if (totalImages !== allImages.length) {
    setTotalImages(allImages.length);
  }

  // Helper arrays for mapping details safely
  const objectivesArray = Array.isArray(project.objectives) ? project.objectives : [];
  const tasksArray = Array.isArray(project.tasks) ? project.tasks : [];

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-white">
      
      {/* SECTION 1: HERO & STATS */}
      <section className="min-h-screen snap-start pt-12 pb-20 px-8 flex flex-col">
        <div className="w-full mb-8">
          <Breadcrumbs />
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <h1 className="text-[56px] md:text-[72px] font-bold text-brand-primary mb-12 font-[Roboto_Condensed] leading-none uppercase">
            Project Detail
          </h1>

          {/* HERO CARD SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-10 bg-[#1A1A1A] rounded-[40px] overflow-hidden shadow-2xl">

            {/* LEFT: Fixed Image Frame */}
            <div className="lg:col-span-6 relative h-[400px] lg:h-[600px] bg-black">
              <img
                src={coverImage}
                alt={project.name || "Project"}
                className="w-full h-full object-cover"
              />

              {/* Image pagination dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Stats Details */}
            <div className="lg:col-span-4 text-white p-12 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-10 leading-tight font-[Roboto_Condensed]">
                {project.name || project.title || "Unnamed Project"}
              </h2>

              <div className="space-y-6 text-sm tracking-widest uppercase font-bold text-gray-400">
                {project.leader && (
                  <div className="flex items-center gap-4">
                    <span className="w-32 shrink-0">Leader</span>
                    <span className="text-white normal-case font-medium text-lg">{project.leader}</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <span className="w-32 shrink-0">Program</span>
                  <div className="flex flex-wrap gap-2">
                    {programNames.map((name, i) => (
                      <span key={i} className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-lg text-[10px] tracking-widest border border-brand-primary/30">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-32 shrink-0">Released</span>
                  <span className="text-white normal-case font-medium text-lg">
                    {formatProjectDate(project.created_at || project.date)}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-32 shrink-0">Contributors</span>
                  <div className="flex flex-wrap gap-2">
                    {studentNames.map((name, i) => (
                      <span key={i} className="bg-white/10 text-white px-3 py-1 rounded-lg text-[10px] tracking-widest border border-white/10">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source Code */}
              <div className="mt-16 pt-10 border-t border-white/10">
                <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Repository</p>
                <div className="flex items-center bg-white/5 rounded-2xl p-2 pl-6 border border-white/10">
                  <span className="flex-grow text-gray-400 font-mono text-xs truncate mr-4">
                    {project.github_url || "Hidden or Private Repository"}
                  </span>
                  <a
                    href={project.github_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`bg-brand-primary text-white p-4 rounded-xl shadow-lg transition-transform active:scale-95 ${!project.github_url ? 'opacity-20 cursor-not-allowed' : 'hover:bg-brand-primary/90'}`}
                    onClick={(e) => !project.github_url && e.preventDefault()}
                  >
                    <BsArrowUpRightSquare className="text-xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OVERVIEW & DETAILS */}
      <section className="min-h-screen snap-start py-24 px-8 bg-gray-50 flex flex-col justify-center">
        <div className="w-full grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Overview */}
          <div>
            <h2 className="text-[12px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-gray-300"></span>
              Project Overview
            </h2>
            <p className="text-gray-800 text-xl md:text-2xl leading-relaxed font-medium">
              {project.overview || project.desc || project.description || "No overview available for this project."}
            </p>

            <div className="mt-16">
              <h2 className="text-[12px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-10 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-gray-300"></span>
                Results & Conclusion
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
                {project.result || "Results and conclusions are not yet documented for this project."}
              </p>
            </div>
          </div>

          {/* Lists */}
          <div className="space-y-10">
            {/* Objectives */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <BsCheckCircleFill className="text-brand-primary text-3xl" />
                <h3 className="text-2xl font-bold font-[Roboto_Condensed]">Objectives</h3>
              </div>
              <ul className="space-y-6">
                {(objectivesArray.length > 0 ? objectivesArray : ["To foster innovation and technical skills"]).map((obj, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    </span>
                    <span className="text-gray-600 font-medium leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <BsListCheck className="text-brand-primary text-3xl" />
                <h3 className="text-2xl font-bold font-[Roboto_Condensed]">Tasks & Activities</h3>
              </div>
              <ul className="space-y-6">
                {(tasksArray.length > 0 ? tasksArray : ["Research and requirements gathering", "Technical design and prototyping"]).map((task, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    </span>
                    <span className="text-gray-600 font-medium leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FOOTER */}
      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>

    </div>
  );
}
