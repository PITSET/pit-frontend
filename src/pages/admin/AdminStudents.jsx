import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllStudents, deleteStudent } from "../../lib/services/studentService";
import { getAllPrograms } from "../../lib/services/programService";
import { ErrorType, getErrorTitle, parseHttpError } from "../../lib/httpErrorHandler";
import {
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import StudentModal from "../../components/admin_ui/StudentModal";
import DeleteModal from "../../components/admin_ui/DeleteModal";
import EmptyState from "../../components/admin_ui/EmptyState";
import Loading from "../../components/ui/Loading";

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Program filter state
  const [programFilter, setProgramFilter] = useState("all");
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Query for students with caching
  const { 
    data: studentsResponse, 
    isLoading: isStudentsLoading, 
    error: studentsError, 
    refetch: refetchStudents 
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await getAllStudents();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Query for programs with caching
  const { 
    data: programsResponse, 
    isLoading: isProgramsLoading 
  } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await getAllPrograms();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const data = studentsResponse || [];
  const programs = programsResponse || [];

  const isLoading = isStudentsLoading || isProgramsLoading;
  const error = studentsError;

  // Helper function to get program name by ID
  const getProgramName = (programId) => {
    if (!programId) return "N/A";
    const program = programs.find(p => p.id === programId || String(p.id) === String(programId));
    return program?.program_name || program?.name || programId;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProgramDropdown(false);
    };

    if (showProgramDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showProgramDropdown]);

  // Filter data by program
  const filteredData = useMemo(() => {
    if (programFilter === "all") {
      return data;
    }
    return data.filter(item => String(item.program_id) === String(programFilter));
  }, [data, programFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [programFilter]);

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

  // Invalidate cache after mutations
  const invalidateStudentsCache = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  // Helper to determine error type from error object for UI display
  const getErrorInfo = (error) => {
    if (!error) return { type: ErrorType.UNKNOWN, title: 'Something Went Wrong', message: 'An unexpected error occurred' };
    
    // Use the parsed error from httpErrorHandler
    const parsedError = parseHttpError(error);
    
    return { 
      type: parsedError.type, 
      title: getErrorTitle(parsedError.type), 
      message: parsedError.message,
      isRetryable: parsedError.isRetryable,
      needsReauth: parsedError.needsReauth
    };
  };

  if (isLoading) return (
    <Loading 
      table={{
        columns: [
          { label: 'Image', show: true },
          { label: 'Name', show: true },
          { label: 'Email', show: true },
          { label: 'Program', show: true },
          { label: 'Action', show: true }
        ],
        showPosition: false,
        showImage: true,
        showStatus: true,
        rows: 4
      }}
    />
  );

  // Handle different error types with appropriate UI
  const errorInfo = getErrorInfo(error);
  const errorType = errorInfo.type;
  const errorTitle = errorInfo.title;
  const errorMessage = errorInfo.message;
  const isRateLimited = errorType === ErrorType.RATE_LIMIT;
  const isNetworkError = errorType === ErrorType.NETWORK;
  const isServerError = errorType === ErrorType.SERVER;
  const isAuthError = errorType === ErrorType.AUTH || errorType === ErrorType.FORBIDDEN;

  if (error) return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        {/* Error icon based on error type */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isRateLimited ? 'bg-orange-100' : 
          isNetworkError ? 'bg-blue-100' : 
          isServerError ? 'bg-red-100' : 
          isAuthError ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {isRateLimited ? (
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isNetworkError ? (
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          ) : isAuthError ? (
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : isServerError ? (
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {errorTitle}
        </h3>
        <p className="text-gray-600 mb-4">
          {isRateLimited 
            ? 'Too many requests. Please wait a moment and try again.'
            : isNetworkError
            ? 'Unable to connect to the server. Please check your internet connection.'
            : isServerError
            ? 'Server is experiencing issues. Please try again later.'
            : isAuthError
            ? 'You do not have permission to access this resource. Please contact an administrator.'
            : errorMessage}
        </p>
        <button 
          onClick={() => refetchStudents()}
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            Students
          </h1>

          <EmptyState
            title="No Students Yet"
            description="Get started by creating your first student. You can add student details and enroll them in a program."
            buttonText="Create First Student"
            onButtonClick={handleCreate}
          />
        </div>

        {/* Modal - rendered even when empty */}
        <StudentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={invalidateStudentsCache}
          item={selectedItem}
        />

        {/* Delete Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          deleteFunction={deleteStudent}
          onRefresh={invalidateStudentsCache}
          item={itemToDelete}
          sectionType="student"
        />
      </>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Students
        </h1>

        <button
          onClick={handleCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2.5 md:py-2 bg-primary-gradient text-white font-medium text-sm rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create Student</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Program Filter - Custom Dropdown Style */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Custom dropdown button */}
            <button
              type="button"
              onClick={() => setShowProgramDropdown(!showProgramDropdown)}
              className="w-full sm:w-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-300 transition-all duration-200 min-w-[180px]"
            >
              <span className={programFilter !== "all" ? "text-orange-600" : "text-slate-600"}>
                {programFilter === "all" 
                  ? `All Programs (${data.length})` 
                  : getProgramName(programFilter)}
              </span>
              <ChevronDownIcon 
                className={`w-5 h-5 text-slate-400 ml-2 transition-transform ${showProgramDropdown ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Dropdown options */}
            {showProgramDropdown && (
              <div className="absolute z-20 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto animate-fadeIn">
                {/* All option */}
                <button
                  type="button"
                  onClick={() => {
                    setProgramFilter("all");
                    setShowProgramDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between border-b border-slate-100 ${
                    programFilter === "all"
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium">All Programs</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    programFilter === "all"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.length}
                  </span>
                </button>
                
                {/* Program options */}
                {programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => {
                      setProgramFilter(program.id);
                      setShowProgramDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                      String(programFilter) === String(program.id)
                        ? "bg-orange-50 text-orange-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{program.program_name || program.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      String(programFilter) === String(program.id)
                        ? "bg-orange-200 text-orange-800"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {data.filter(item => String(item.program_id) === String(program.id)).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filter (only show when filter is active) */}
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
        </div>
      </div>

      {/* Results count */}
      {programFilter !== "all" && (
        <div className="mb-4 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <span className="font-medium text-gray-900">
            {filteredData.length} {filteredData.length === 1 ? 'student' : 'students'}
          </span>
          {' '}found
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
                  <th className="px-4 lg:px-8 py-4 text-center">Name</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Email</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Program</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 transition">
                    <td className="px-4 lg:px-8 py-4 text-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center font-medium">
                      {item.name}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-center">
                      {item.email || "N/A"}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {getProgramName(item.program_id)}
                      </span>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
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
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate text-gray-900">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.email || "No email"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {getProgramName(item.program_id)}
                      </span>
                    </div>
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
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
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
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={invalidateStudentsCache}
        item={selectedItem}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        deleteFunction={deleteStudent}
        onRefresh={invalidateStudentsCache}
        item={itemToDelete}
        sectionType="student"
      />
    </div>
  );
}
