import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsArrowUpRightSquare, BsCheckCircleFill, BsListCheck } from "react-icons/bs";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import api from "../../lib/api";
import Loader from "../../components/ui/Loader";

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

          // Resolve program IDs -> names
          const allPrograms = Array.isArray(programsRes.data)
            ? programsRes.data
            : programsRes.data?.data || programsRes.data?.programs || [];

          const projectProgramIds = Array.isArray(data.programs) ? data.programs : [];
          const names = projectProgramIds
            .map((pid) => {
              const found = allPrograms.find((p) => p.id === pid || p.id === Number(pid));
              return found?.program_name || found?.name || null;
            })
            .filter(Boolean);

          setProgramNames(names);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">

        {/* PAGE TITLE */}
        <h1 className="text-4xl md:text-[44px] font-bold text-[#c92a2a] mb-10 tracking-tight">
          Project Detail
        </h1>

        {/* HERO CARD SPLIT */}
        <div className="flex flex-col lg:flex-row w-full bg-[#1A1A1A] rounded-[24px] overflow-hidden shadow-xl mb-16">

          {/* LEFT: Image Container */}
          <div className="relative w-full lg:w-[60%] h-[300px] sm:h-[400px] lg:h-[500px]">
            <img
              src={coverImage}
              alt={project.name || "Project"}
              className="w-full h-full object-cover"
            />

            {/* Image pagination dots over image */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-[8px] rounded-full transition-all ${idx === activeImageIndex ? 'w-8 bg-white' : 'w-2 bg-red-600/80 hover:bg-red-500'}`}
                    aria-label={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Fade right edge into exact dark gray */}
            <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#1A1A1A]" />
          </div>

          {/* RIGHT: Stats Details */}
          <div className="w-full lg:w-[40%] text-white p-8 lg:p-12 flex flex-col justify-center">

            <h2 className="text-3xl lg:text-[38px] font-bold text-[#FF6B52] mb-10 leading-snug">
              {project.name || project.title || "Unnamed Project"}
            </h2>

            <div className="space-y-5 text-sm md:text-[15px] font-medium tracking-wide">
              {project.leader && (
                <div className="flex">
                  <span className="w-28 text-white font-bold">Leader :</span>
                  <span className="text-gray-300">{project.leader}</span>
                </div>
              )}

              {programNames.length > 0 && (
                <div className="flex">
                  <span className="w-28 text-white font-bold">Program :</span>
                  <span className="text-gray-300">{programNames.join(", ")}</span>
                </div>
              )}

              {project.duration && (
                <div className="flex">
                  <span className="w-28 text-white font-bold">Duration :</span>
                  <span className="text-gray-300">{project.duration} Weeks</span>
                </div>
              )}

              <div className="flex">
                <span className="w-28 text-white font-bold">Created at :</span>
                <span className="text-gray-300">{formatProjectDate(project.created_at || project.date || project.updated_at)}</span>
              </div>

              {(project.team_size || (Array.isArray(project.students) && project.students.length > 0)) && (
                <div className="flex">
                  <span className="w-28 text-white font-bold">Team Size :</span>
                  <span className="text-gray-300">
                    {Array.isArray(project.students) && project.students.length > 0
                      ? project.students.length
                      : project.team_size}{" "}
                    Students
                  </span>
                </div>
              )}
            </div>

            {/* Source Code Section */}
            <div className="mt-14">
              <h3 className="text-white font-bold tracking-widest uppercase mb-4 text-[13px] md:text-sm">
                Project Source Code
              </h3>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={project.github_url || "No repository linked"}
                  className="bg-white text-gray-800 text-sm py-3 px-4 rounded-l border border-white focus:outline-none w-full truncate font-mono"
                />
                <a
                  href={project.github_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`bg-[#FF4500] hover:bg-[#E03E00] text-white p-3 rounded-r transition-colors flex items-center justify-center shrink-0 border border-[#FF4500] ${!project.github_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => !project.github_url && e.preventDefault()}
                >
                  <BsArrowUpRightSquare className="text-xl" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* OVERVIEW SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl lg:text-[28px] font-bold text-[#000000] mb-5 tracking-tight">
            Overview
          </h2>
          <p className="text-gray-800 text-[15px] md:text-[16px] leading-relaxed max-w-5xl">
            {project.overview || project.desc || project.description || "No overview available for this project."}
          </p>
        </div>

        {/* SPLIT LISTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-20 max-w-5xl">

          {/* Objectives Card */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-[#1A1A1A] py-5 px-8 flex items-center gap-4">
              <BsCheckCircleFill className="text-[#FF4500] text-2xl" />
              <h3 className="text-white text-2xl font-bold">Objectives</h3>
            </div>
            <div className="p-8 grow">
              {objectivesArray.length > 0 ? (
                <ul className="space-y-4">
                  {objectivesArray.map((obj, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full bg-black mt-2 shrink-0"></span>
                      <span className="text-gray-700 font-medium text-[15px]">{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No objectives listed.</p>
              )}
            </div>
          </div>

          {/* Tasks & Activities Card */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-[#1A1A1A] py-5 px-8 flex items-center gap-4">
              <BsListCheck className="text-[#FF4500] text-[28px]" />
              <h3 className="text-white text-2xl font-bold">Tasks & Activities</h3>
            </div>
            <div className="p-8 grow">
              {tasksArray.length > 0 ? (
                <ul className="space-y-4">
                  {tasksArray.map((task, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full bg-black mt-2 shrink-0"></span>
                      <span className="text-gray-700 font-medium text-[15px]">{task}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No tasks listed.</p>
              )}
            </div>
          </div>

        </div>

        {/* RESULTS SECTION */}
        <div className="mb-10 w-full max-w-5xl">
          <h2 className="text-2xl lg:text-[28px] font-bold text-[#000000] mb-5 tracking-tight">
            Results & Conclusion
          </h2>
          <p className="text-gray-800 text-[15px] md:text-[16px] leading-relaxed w-full break-words whitespace-normal">
            {project.result || "Results and conclusions are not yet documented for this project."}
          </p>
        </div>

      </div>
    </div>
  );
}
