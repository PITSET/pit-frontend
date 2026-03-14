import { useEffect, useState, useMemo } from "react";
import { getAllMembers, deleteMember } from "../../lib/services/memberService";
import {
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import MemberModal from "../../components/admin_ui/MemberModal";
import DeleteModal from "../../components/admin_ui/DeleteModal";
import EmptyState from "../../components/admin_ui/EmptyState";
import Loading from "../../components/ui/Loading";

export default function AdminMembers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Role filter state
  const [roleFilter, setRoleFilter] = useState("all");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchMembers = async () => {
    try {
      const response = await getAllMembers();
      const newData = response.data;
      setData(newData);

      // Adjust current page if it becomes invalid after deletion
      // Need to recalculate filtered data to get correct pagination
      let newFilteredData = newData;
      if (roleFilter !== 'all') {
        newFilteredData = newData.filter(item => {
          if (roleFilter === 'founder') return item.is_founder === true;
          if (roleFilter === 'instructor') return item.is_instructor === true;
          return true;
        });
      }
      const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newFilteredData.length === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowRoleDropdown(false);
    };

    if (showRoleDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showRoleDropdown]);

  // Filter data by role
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by role (instructor or founder)
    if (roleFilter !== "all") {
      result = result.filter(item => {
        if (roleFilter === "founder") return item.is_founder === true;
        if (roleFilter === "instructor") return item.is_instructor === true;
        return true;
      });
    }

    return result;
  }, [data, roleFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

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
          { label: 'Name', show: true },
          { label: 'Biography', show: true },
          { label: 'Role', show: true },
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
          onClick={fetchMembers}
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
            Members
          </h1>

          <EmptyState
            title="No Members Yet"
            description="Get started by creating your first member. You can add member details, descriptions, and images."
            buttonText="Create First Member"
            onButtonClick={handleCreate}
          />
        </div>

        {/* Modal - rendered even when empty */}
        <MemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchMembers}
          item={selectedItem}
        />
      </>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Members
        </h1>

        <button
          onClick={handleCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2.5 md:py-2 bg-primary-gradient text-white font-medium text-sm rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create Member</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Role Filter - Custom Dropdown Style */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Custom dropdown button */}
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="w-full sm:w-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-300 transition-all duration-200 min-w-[180px]"
            >
              <span className={roleFilter !== "all" ? "text-orange-600" : "text-slate-600"}>
                {roleFilter === "all" 
                  ? `All (${data.length})` 
                  : roleFilter === "founder" 
                  ? "Founder" 
                  : "Instructor"}
              </span>
              <ChevronDownIcon 
                className={`w-5 h-5 text-slate-400 ml-2 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Dropdown options */}
            {showRoleDropdown && (
              <div className="absolute z-20 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-y-auto animate-fadeIn">
                {/* All option */}
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("all");
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between border-b border-slate-100 ${
                    roleFilter === "all"
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium">All Roles</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    roleFilter === "all"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.length}
                  </span>
                </button>
                
                {/* Founder option */}
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("founder");
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                    roleFilter === "founder"
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>Founder</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    roleFilter === "founder"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.filter(item => item.is_founder === true).length}
                  </span>
                </button>

                {/* Instructor option */}
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("instructor");
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition flex items-center justify-between ${
                    roleFilter === "instructor"
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>Instructor</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    roleFilter === "instructor"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.filter(item => item.is_instructor === true).length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Filter (only show when filter is active) */}
          {roleFilter !== "all" && (
            <button
              onClick={() => setRoleFilter("all")}
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
      {roleFilter !== "all" && (
        <div className="mb-4 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <span className="font-medium text-gray-900">
            {filteredData.length} {filteredData.length === 1 ? 'member' : 'members'}
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
                  <th className="px-4 lg:px-8 py-4 text-center">Biography</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Role</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-100 transition ${!item.is_featured ? 'bg-gray-50' : ''}`}>
                    <td className="px-4 lg:px-8 py-4 text-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                        <img
                          src={item.image_url || item.images?.[0] || "/placeholder.svg"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center font-medium">
                      {item.name}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-left max-w-xs lg:max-w-xl">
                      <p className="line-clamp-2 lg:line-clamp-2">
                        {item.bio || "No biography available"}
                      </p>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_founder && item.is_instructor
                          ? 'bg-orange-100 text-orange-800'
                          : item.is_founder
                          ? 'bg-orange-100 text-orange-800'
                          : item.is_instructor
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {item.is_founder && item.is_instructor 
                          ? 'Founder, Instructor' 
                          : item.is_founder 
                          ? 'Founder' 
                          : item.is_instructor 
                          ? 'Instructor' 
                          : 'Unknown'}
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
                className={`bg-white rounded-xl border shadow-sm p-4 ${!item.is_featured ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || item.images?.[0] || "/placeholder.svg"}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${item.is_featured ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.name}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.is_founder && item.is_instructor
                            ? 'bg-orange-100 text-orange-800'
                            : item.is_founder
                            ? 'bg-orange-100 text-orange-800'
                            : item.is_instructor
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {item.is_founder && item.is_instructor 
                            ? 'Founder, Instructor' 
                            : item.is_founder 
                            ? 'Founder' 
                            : item.is_instructor 
                            ? 'Instructor' 
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.bio || "No biography available"}
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
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchMembers}
        item={selectedItem}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onRefresh={fetchMembers}
        item={itemToDelete}
        sectionType="Member"
        deleteFunction={deleteMember}
      />
    </div>
  );
}
