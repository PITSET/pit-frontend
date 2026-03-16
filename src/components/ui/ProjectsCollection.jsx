import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { HiAdjustmentsHorizontal, HiUsers } from "react-icons/hi2";

/**
 * ProjectsCollection - A reusable component for listing projects with filtering and search.
 * 
 * @param {Array} projects - Array of project objects.
 * @param {Boolean} isLoading - Loading state.
 */
export default function ProjectsCollection({ projects = [], isLoading = false }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    teamSize: "All",
    launchYear: "All",
  });
  const filterRef = useRef(null);

  const tabs = [
    "All",
    "Mechatronics Engineering",
    "Software Engineering",
    "Mechanical Engineering",
  ];

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const years = useMemo(() => {
    const yearsSet = new Set();
    projects.forEach(p => {
      if (p.date) {
        const year = p.date.split(" ").pop();
        if (year && !isNaN(year)) yearsSet.add(year);
      }
    });
    return ["All", ...Array.from(yearsSet).sort((a, b) => b - a)];
  }, [projects]);

  const teamSizes = ["All", "1-3", "4-6", "7+"];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter by tab (program)
      let matchesTab = activeTab === "All";

      if (!matchesTab) {
        const programList = Array.isArray(project.programs) ? project.programs : [];
        const targetTab = activeTab.toLowerCase().trim();

        matchesTab = programList.some(p => {
          if (typeof p === 'object' && p !== null) {
            const name = (p.program_name || p.name || "").toLowerCase().trim();
            return name === targetTab;
          }
          return typeof p === "string" && p.toLowerCase().trim() === targetTab;
        });

        if (!matchesTab && project.program) {
          matchesTab = project.program.toLowerCase().trim() === targetTab;
        }
      }

      // Filter by search query (mainly title)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.name?.toLowerCase().includes(query);

      // Filter by Team Size (Student Count)
      let matchesTeamSize = filters.teamSize === "All";
      if (!matchesTeamSize) {
        const size = project.students?.length || 0;
        if (filters.teamSize === "1-3") matchesTeamSize = size >= 1 && size <= 3;
        else if (filters.teamSize === "4-6") matchesTeamSize = size >= 4 && size <= 6;
        else if (filters.teamSize === "7+") matchesTeamSize = size >= 7;
      }

      // Filter by Launch Year
      let matchesYear = filters.launchYear === "All";
      if (!matchesYear && project.date) {
        matchesYear = project.date.includes(filters.launchYear);
      }

      return matchesTab && matchesSearch && matchesTeamSize && matchesYear;
    });
  }, [projects, activeTab, searchQuery, filters]);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        {/* Tabs (Desktop Only) */}
        <div className="hidden lg:flex flex-wrap gap-3 justify-center md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${activeTab === tab
                ? "bg-[#c92a2a] text-white border-[#c92a2a] shadow-lg shadow-red-200"
                : "bg-white text-gray-600 border-gray-100 hover:border-red-200 hover:text-red-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar & Filter Button Container */}
        <div className="relative flex items-center gap-4 w-full lg:w-[400px]">
          {/* Search Bar - Skeuomorphic Pressed In */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-[16px] py-4 pl-12 pr-4 text-gray-800 focus:ring-2 focus:ring-[#c92a2a]/20 transition-all outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
            />
            <BsSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          </div>

          {/* Filter Button - Skeuomorphic Popped Out (Mobile Only) */}
          <div className="relative lg:hidden" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-[56px] h-[56px] flex items-center justify-center rounded-[16px] transition-all bg-white border border-gray-100 text-gray-600 hover:text-[#c92a2a] active:scale-95 ${isFilterOpen
                ? "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] text-[#c92a2a]"
                : "shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,1)]"
                }`}
            >
              <HiAdjustmentsHorizontal size={24} />
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-6">
                  {/* Programs (Mobile Only) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Programs</label>
                    <div className="flex flex-col gap-2">
                      {tabs.map(tab => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            setIsFilterOpen(false); // Close dropdown on selection
                          }}
                          className={`px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors ${activeTab === tab
                            ? "bg-red-50 text-[#c92a2a]"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Launch Date</label>
                    <select
                      value={filters.launchYear}
                      onChange={(e) => setFilters(prev => ({ ...prev, launchYear: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red-100 outline-none"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year === "All" ? "All Years" : year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Button */}
                  <button
                    onClick={() => {
                      setFilters({ teamSize: "All", launchYear: "All" });
                      setIsFilterOpen(false);
                    }}
                    className="w-full pt-4 border-t border-gray-50 text-xs font-bold text-gray-400 hover:text-[#c92a2a] transition-colors"
                  >
                    RESET FILTERS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROJECTS GRID */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[8px_8px_20px_rgba(0,0,0,0.04)] flex flex-col h-full hover:shadow-[12px_12px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1"
            >
              {/* Image */}
              <Link to={`/projects/${project.id}`} className="block h-[240px] w-full overflow-hidden bg-gray-100 relative group">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {project.date && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] font-bold text-[#c92a2a] uppercase tracking-wider shadow-sm">
                    {project.date}
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-8 flex flex-col grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-8 line-clamp-3">
                  {project.desc}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <HiUsers className="text-lg" />
                    <span className="text-[14px] font-bold">{project.students?.length || 0}</span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="bg-[#c92a2a] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b02525] transition-all shadow-lg shadow-red-100 hover:shadow-red-200"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg mb-6">No projects found matching your criteria.</p>
          <button
            onClick={() => {
              setActiveTab("All");
              setSearchQuery("");
              setFilters({ teamSize: "All", launchYear: "All" });
            }}
            className="text-white bg-[#c92a2a] font-bold py-3 px-8 rounded-xl hover:bg-[#b02525] transition-all shadow-lg shadow-red-100"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
