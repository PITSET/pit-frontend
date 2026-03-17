import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Button } from "./Button";

export default function ProjectsCarousel({ projects = [], isLoadingProjects = false }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!projects.length) {
      setIndex(0);
      return;
    }
    setIndex((current) => (current >= projects.length ? 0 : current));
  }, [projects]);

  const nextProject = () => {
    if (!projects.length) return;
    setIndex((index + 1) % projects.length);
  };

  const prevProject = () => {
    if (!projects.length) return;
    setIndex((index - 1 + projects.length) % projects.length);
  };

  return (
    <section className="py-24 bg-[#f8f9fc] w-full flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-6xl px-6">
        <h2 className="text-center font-bold text-5xl md:text-6xl mb-12 lg:mb-20 text-[#1A1A1A]">
          Projects
        </h2>

        <div className="flex flex-col items-center relative w-full mb-10">
          {/* Main Card Container */}
          <div className="relative bg-[#FAFAFC] w-full md:w-[85%] lg:w-[900px] xl:w-[950px] min-h-[450px] rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center p-8 md:p-12 lg:pr-16 md:gap-14">

            {/* Image (Overlapping the left edge on larger screens) */}
            <div className="relative w-[300px] md:w-[380px] lg:w-[420px] h-[300px] md:h-[400px] lg:h-[420px] shrink-0 md:-ml-24 lg:-ml-32 md:mt-0 mb-8 md:mb-0 bg-gray-200 rounded-3xl overflow-hidden shadow-2xl z-10 transition-all duration-300">
              <img
                src={projects[index]?.image || ""}
                alt={projects[index]?.title || "Project Image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
              <p className="font-semibold text-gray-500 tracking-widest text-[13px] md:text-sm uppercase mb-3">
                {isLoadingProjects ? "" : projects[index]?.date || "Date"}
              </p>

              <h3 className="font-bold text-2xl md:text-[32px] text-[#1A1A1A] mb-4 leading-tight">
                {isLoadingProjects ? "" : projects[index]?.title || "Project Title"}
              </h3>

              <p className="text-gray-600 text-[15px] md:text-base leading-relaxed mb-4">
                {isLoadingProjects ? "" : projects[index]?.overview || projects[index]?.desc || "No overview available"}
              </p>

              {/* Program tags */}
              {!isLoadingProjects && projects[index]?.programNames?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {projects[index].programNames.map((name, i) => (
                    <span
                      key={i}
                      className="bg-brand-primary/10 text-brand-primary text-[11px] md:text-xs font-bold px-3 py-1 rounded-full border border-brand-primary/20 shadow-sm transition-transform hover:scale-105"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <Button variant="link" asChild>
                <Link to={`/projects/${projects[index]?.id}`}>
                  Read More
                </Link>
              </Button>

              {/* Bottom Controls row: Indicators + Navigation */}
              <div className="flex items-center justify-between w-full mt-auto">
                {/* Dots / Indicators */}
                <div className="flex items-center gap-3">
                  {projects.map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-full transition-all duration-300 ${i === index
                        ? "bg-brand-primary w-10 h-[10px]"
                        : "bg-brand-primary-dark w-[10px] h-[10px]"
                        }`}
                    ></span>
                  ))}
                </div>

                {/* Arrow Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={prevProject}
                    disabled={!projects.length || isLoadingProjects}
                    className="w-12 h-12 rounded-full border border-gray-300 bg-transparent flex items-center justify-center text-brand-primary text-xl transition-all duration-300 hover:bg-brand-primary/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={nextProject}
                    disabled={!projects.length || isLoadingProjects}
                    className="w-12 h-12 rounded-full border border-gray-300 bg-transparent flex items-center justify-center text-brand-primary text-xl transition-all duration-300 hover:bg-brand-primary/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All Projects Button */}
        <div className="flex justify-center mt-12 md:mt-24">
          <Button asChild variant="primary" size="lg">
            <Link to="/projects">VIEW ALL PROJECTS</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
