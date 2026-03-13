import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";

/**
 * ProjectsCollection - A reusable component for listing projects with filtering and search.
 * 
 * @param {Array} projects - Array of project objects.
 * @param {Boolean} isLoading - Loading state.
 */
export default function ProjectsCollection({ projects = [], isLoading = false }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    "All",
    "Mechatronics Engineering",
    "Software Engineering",
    "Mechanical Engineering",
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter by tab (program)
      let matchesTab = activeTab === "All";
      
      if (!matchesTab) {
        // Support programs as an array of objects or strings
        const programList = Array.isArray(project.programs) ? project.programs : [];
        const targetTab = activeTab.toLowerCase().trim();

        matchesTab = programList.some(p => {
          if (typeof p === 'object' && p !== null) {
            const name = (p.program_name || p.name || "").toLowerCase().trim();
            return name === targetTab;
          }
          return typeof p === "string" && p.toLowerCase().trim() === targetTab;
        });

        // Fallback to legacy single program field
        if (!matchesTab && project.program) {
          matchesTab = project.program.toLowerCase().trim() === targetTab;
        }
      }

      // Filter by search query (name or keyword/overview)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.name?.toLowerCase().includes(query) ||
        project.overview?.toLowerCase().includes(query) ||
        project.desc?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-4xl md:text-[44px] font-bold text-[#c92a2a] mb-4 tracking-tight">
          Projects Collection
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl">
          Browse and discover projects from different programs. Use the search bar to find projects instantly.
        </p>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2.5 rounded-md font-bold text-sm transition-all border-2 ${
                activeTab === tab
                  ? "bg-[#c92a2a] text-white border-[#c92a2a]"
                  : "bg-white text-gray-800 border-gray-200 hover:border-[#c92a2a]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-[320px]">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f3f5] border-none rounded-[12px] py-4 pl-12 pr-4 text-gray-800 focus:ring-2 focus:ring-[#c92a2a] transition-all outline-none"
          />
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        </div>
      </div>

      {/* PROJECTS GRID */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-[24px] overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] flex flex-col h-full hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] transition-all"
            >
              {/* Image */}
              <div className="h-[260px] w-full overflow-hidden bg-gray-100">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-[15px] leading-relaxed mb-8 line-clamp-3">
                  {project.desc}
                </p>

                <div className="mt-auto flex justify-end">
                  <Link
                    to={`/projects/${project.id}`}
                    className="bg-[#FF4500] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E03E00] transition-colors shadow-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-xl mb-4">No projects found matching your criteria.</p>
          <button 
            onClick={() => {setActiveTab("All"); setSearchQuery("");}}
            className="text-[#c92a2a] font-bold hover:underline py-2 px-4 rounded-lg bg-red-50"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
