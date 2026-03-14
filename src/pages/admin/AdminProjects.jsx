import { useEffect, useState, useMemo } from "react";
import { getAllProjects, deleteProject } from "../../lib/services/projectService";
import { getAllPrograms } from "../../lib/services/programService";
import {
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import ProjectModal from "../../components/admin_ui/ProjectModal";
import DeleteModal from "../../components/admin_ui/DeleteModal";
import EmptyState from "../../components/admin_ui/EmptyState";
import Loading from "../../components/ui/Loading";

export default function AdminProjects() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programs, setPrograms] = useState([]);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchProjects = async () => {
    try {
      const [projectsRes, programsRes] = await Promise.all([
        getAllProjects(),
        getAllPrograms()
      ]);
      const newData = projectsRes.data;
      setData(newData);
      setPrograms(programsRes.data || []);

      // Adjust current page if it becomes invalid after deletion
      const newTotalPages = Math.ceil(newData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newData.length === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProgramDropdown && !event.target.closest('.program-dropdown-container')) {
        setShowProgramDropdown(false);
      }
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProgramDropdown, showStatusDropdown]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by program - backend returns nested structure: project_programs: [{ programs: { id: 1 } }]
    if (programFilter !== "all") {
      result = result.filter(item => {
        // Extract program IDs from nested structure
        const programIds = item.project_programs?.map(pp => pp.programs?.id) || [];
        return programIds.includes(programFilter);
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter(item => item.is_featured === isActive);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [data, searchQuery, statusFilter, programFilter]);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, programFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  if (loading) return (
    <Loading 
      table={{
        columns: [
          { label: 'Image', show: true },
          { label: 'Project Name', show: true },
          { label: 'Overview', show: true },
          { label: 'Status', show: true },
          { label: 'Action', show: true }
        ],
        showPosition: false,
        showImage: true,
        showStatus: true,
        rows: 4
      }}
    />
  );

  // Handle rate limiting (429) specifically
  const isRateLimited = error.includes('429');
  if (error) return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isRateLimited ? 'Too Many Requests' : 'Unable to Load'}
        </h3>
        <p className="text-gray-600 mb-4">
          {isRateLimited 
            ? 'Please wait a moment and try again. We\'re experiencing high traffic.'
            : error}
        </p>
        <button 
          onClick={fetchProjects}
          className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty state
  if (data.length === 0) {
    return (
      <>
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className:text-2xl="text-xl sm md:text-3xl font-semibold text-gray-900 mb-6">
            Projects
          </h1>

          <EmptyState
            title="No Projects Yet"
            description="Get started by creating your first project. You can add project details, descriptions, and images."
            buttonText="Create First Project"
            onButtonClick={handleCreate}
          />
        </div>

        {/* Modal - rendered even when empty */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchProjects}
          item={selectedItem}
        />
      </>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Projects
        </h1>

        <button
          onClick={handleCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2.5 md:py-2 bg-primary-gradient text-white font-medium text-sm rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create Project</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          
          {/* Program Filter */}
          <div className="relative program-dropdown-container">
            <button
              type="button"
              onClick={() => setShowProgramDropdown(!showProgramDropdown)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-300 transition-all duration-200 min-w-[160px]"
            >
              <span className={programFilter !== "all" ? "text-orange-600" : "text-slate-600"}>
                {programFilter === "all" ? `All (${data.length})` : programs.find(p => p.id === programFilter)?.program_name || "Program"}
              </span>
              <ChevronDownIcon className={`h-5 w-5 text-slate-400 ml-2 transition-transform ${showProgramDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showProgramDropdown && (
              <div className="absolute left-0 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl z-10 max-h-64 overflow-y-auto animate-fadeIn">
                <button
                  onClick={() => {
                    setProgramFilter("all");
                    setShowProgramDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between border-b border-slate-100 ${
                    programFilter === "all" ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium">All Programs</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    programFilter === "all" ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.length}
                  </span>
                </button>
                {programs.map(program => (
                  <button
                    key={program.id}
                    onClick={() => {
                      setProgramFilter(program.id);
                      setShowProgramDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                      programFilter === program.id ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{program.program_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      programFilter === program.id ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {data.filter(item => item.project_programs?.some(pp => pp.programs?.id === program.id)).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Program Filter */}
          {programFilter !== "all" && (
            <button
              onClick={() => setProgramFilter("all")}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              title="Clear filter"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}

          {/* Status Filter */}
          <div className="relative status-dropdown-container">
            <button
              type="button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-300 transition-all duration-200 min-w-[140px]"
            >
              <span className={statusFilter !== "all" ? "text-orange-600" : "text-slate-600"}>
                {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
              </span>
              <ChevronDownIcon className={`h-5 w-5 text-slate-400 ml-2 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showStatusDropdown && (
              <div className="absolute left-0 mt-2 w-full min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-xl z-10 animate-fadeIn">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between border-b border-slate-100 ${
                    statusFilter === "all" ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium">All Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === "all" ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("active");
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                    statusFilter === "active" ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === "active" ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.filter(item => item.status === 'active').length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("inactive");
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                    statusFilter === "inactive" ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Inactive
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === "inactive" ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.filter(item => item.status === 'inactive').length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Status Filter */}
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              title="Clear filter"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm transition"
          />
        </div>
      </div>

      {/* Results count */}
      {(programFilter !== "all" || statusFilter !== "all") && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} projects
        </div>
      )}

      {/* Search count */}
      {searchQuery && programFilter === "all" && statusFilter === "all" && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredData.length} projects
        </div>
      )}

      {/* No results found */}
      {filteredData.length === 0 && data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setProgramFilter("all");
              setStatusFilter("all");
            }}
            className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition"
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredData.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr className="text-sm font-semibold text-gray-600">
                  <th className="px-4 lg:px-8 py-4 text-center">Image</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Project Name</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Overview</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Status</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-100 transition ${!item.is_featured ? 'bg-gray-50' : ''}`}>
                    <td className="px-4 lg:px-8 py-4 text-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                        <img
                          src={item.images?.[0] || "/placeholder.svg"}
                          alt={item.name}
                          className={`object-cover w-full h-full ${!item.is_featured ? 'grayscale' : ''}`}
                        />
                      </div>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center font-medium">
                      <span className={!item.is_featured ? 'text-gray-400' : ''}>
                        {item.name}
                      </span>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-left max-w-xs lg:max-w-xl">
                      <p className={`line-clamp-2 lg:line-clamp-2 ${!item.is_featured ? 'text-gray-400' : ''}`}>
                        {item.overview || "No overview available"}
                      </p>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_featured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {item.is_featured ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-2 sm:px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <div className="inline-flex items-center justify-center gap-0 rounded-md sm:rounded-lg border border-gray-200 sm:border-gray-300 overflow-hidden">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 sm:hover:bg-gray-200 transition"
                        >
                          <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>

                        <div className="h-4 w-px sm:h-6 bg-gray-200 sm:bg-gray-300"></div>

                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 sm:p-2 hover:bg-red-50 sm:hover:bg-red-100 transition"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 gap-3 sm:gap-0">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border shadow-sm p-4 border-gray-200"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.name}
                        className={`object-cover w-full h-full ${!item.is_featured ? 'grayscale' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${item.is_featured ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm line-clamp-2 ${item.is_featured ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.overview || "No overview available"}
                      </p>
                      <div className="flex gap-1 ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.is_featured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {item.is_featured ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm line-clamp-2 ${item.is_featured ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.overview || "No overview available"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0">
                    <div className="flex flex-col sm:flex-row items-center gap-0 rounded-md sm:rounded-lg border border-gray-200 sm:border-gray-300 overflow-hidden">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 sm:hover:bg-gray-200 transition"
                      >
                        <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>

                      <div className="h-px w-4 sm:h-6 sm:w-px bg-gray-200 sm:bg-gray-300"></div>

                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-1.5 sm:p-2 hover:bg-red-50 sm:hover:bg-red-100 transition"
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of{" "}
                  {filteredData.length}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-2 text-sm font-medium text-gray-600">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchProjects}
        item={selectedItem}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onRefresh={fetchProjects}
        item={itemToDelete}
        sectionType="Project"
        deleteFunction={deleteProject}
      />
    </div>
  );
}
