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
      <section className="min-h-screen snap-start pt-12 pb-20 px-4 sm:px-8 flex flex-col">
        <div className="max-w-[1248px] mx-auto w-full grow flex flex-col">
          <div className="w-full mb-8">
            <Breadcrumbs />
          </div>

          <div className="grow flex flex-col justify-center">
            <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-bold text-brand-primary mb-8 sm:mb-12 font-[Roboto_Condensed] leading-none uppercase text-center sm:text-left">
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
            <div className="lg:col-span-4 text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-primary mb-6 sm:mb-10 leading-tight font-[Roboto_Condensed]">
                {project.name || project.title || "Unnamed Project"}
              </h2>

              <div className="space-y-4 text-sm font-sans">
                {project.leader && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100 whitespace-nowrap">Leader :</span>
                    <span className="text-gray-400">{project.leader}</span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <span className="font-bold text-gray-100 whitespace-nowrap">Program :</span>
                  <span className="text-gray-400">{programNames.join(", ") || "General Engineering"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100 whitespace-nowrap">Duration :</span>
                  <span className="text-gray-400">{project.duration || "4 Weeks"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100 whitespace-nowrap">Released :</span>
                  <span className="text-gray-400">
                    {formatProjectDate(project.created_at || project.date)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-100 whitespace-nowrap">Team Size :</span>
                  <span className="text-gray-400">{studentCount} Students</span>
                </div>
              </div>

              {/* Source Code */}
              <div className="mt-10 sm:mt-16">
                <p className="text-xs sm:text-sm font-bold tracking-widest text-white uppercase mb-4 font-[Roboto_Condensed]">Project Source Code</p>
                <div className="flex items-center gap-2">
                  <div className="grow bg-white rounded-md overflow-hidden h-10 flex items-center px-4">
                    <span className="text-gray-400 text-[10px] sm:text-xs truncate">
                      {project.github_url || "https://github.com/source-link"}
                    </span>
                  </div>
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`bg-[#FF4D00] text-white w-10 h-10 flex items-center justify-center rounded-md shrink-0 transition-transform active:scale-95 ${!project.github_url ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'hover:brightness-110'}`}
                    onClick={(e) => !project.github_url && e.preventDefault()}
                  >
                    <BsArrowUpRightSquare className="text-lg" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* SECTION 2: CONTENT AREAS */}
      <section className="py-12 sm:py-24 px-4 sm:px-8 bg-white overflow-visible">
        <div className="max-w-[1248px] mx-auto w-full space-y-16 sm:space-y-24">
          
          {/* Overview Section */}
          <div className="w-full">
            <h2 className="text-[28px] sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 font-[Roboto_Condensed]">
              Overview
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-5xl whitespace-pre-wrap wrap-break-word">
              {project.overview || project.desc || project.description || "No overview available for this project."}
            </p>
          </div>

          {/* Dual Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Objectives Card */}
            <div className="rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-full bg-white">
              <div className="bg-[#1A1A1A] p-5 sm:p-6 flex items-center gap-4">
                <div className="bg-brand-primary p-2 rounded-lg shrink-0">
                  <BsCheckCircleFill className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-[Roboto_Condensed]">Objectives</h3>
              </div>
              <div className="p-6 sm:p-10 grow">
                <ul className="space-y-4 sm:space-y-5">
                  {(objectivesArray.length > 0 ? objectivesArray : ["No objectives defined."]).map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-2.5"></span>
                      <span className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tasks & Activities Card */}
            <div className="rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-full bg-white">
              <div className="bg-[#1A1A1A] p-5 sm:p-6 flex items-center gap-4">
                <div className="bg-[#FF4D00] p-2 rounded-lg shrink-0">
                  <BsListCheck className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-[Roboto_Condensed]">Tasks & Activities</h3>
              </div>
              <div className="p-6 sm:p-10 grow">
                <ul className="space-y-4 sm:space-y-5">
                  {(tasksArray.length > 0 ? tasksArray : ["No tasks defined."]).map((task, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-2.5"></span>
                      <span className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="w-full">
            <h2 className="text-[28px] sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 font-[Roboto_Condensed]">
              Results & Conclusion
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-5xl whitespace-pre-wrap wrap-break-word">
              {project.result || "Results and conclusions are not yet documented for this project."}
            </p>
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
