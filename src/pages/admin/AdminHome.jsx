import { useEffect, useState } from "react";
import { getHomeSections, deleteHomeSection } from "../../lib/services/homeService";
import { getFetchErrorMessage, ErrorType, getErrorTitle } from "../../lib/httpErrorHandler";
import {
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import HomeModal from "../../components/admin_ui/HomeModal";
import DeleteModal from "../../components/admin_ui/DeleteModal";
import EmptyState from "../../components/admin_ui/EmptyState";
import Loader from "../../components/ui/Loader";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchHome = async () => {
    try {
      const response = await getHomeSections();
      const newData = response.data;
      setData(newData);

      // Adjust current page if it becomes invalid after deletion
      const newTotalPages = Math.ceil(newData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newData.length === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch home data:", err);
      setError(getFetchErrorMessage(err, 'fetch home data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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

  // Helper to determine error type from error message for UI display
  const getErrorInfo = (errorMsg) => {
    if (!errorMsg) return { type: ErrorType.UNKNOWN, title: 'Something Went Wrong' };
    
    if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
      return { type: ErrorType.RATE_LIMIT, title: getErrorTitle(ErrorType.RATE_LIMIT) };
    }
    if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('connection')) {
      return { type: ErrorType.NETWORK, title: getErrorTitle(ErrorType.NETWORK) };
    }
    if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503') || errorMsg.toLowerCase().includes('server error')) {
      return { type: ErrorType.SERVER, title: getErrorTitle(ErrorType.SERVER) };
    }
    if (errorMsg.includes('404') || errorMsg.toLowerCase().includes('not found')) {
      return { type: ErrorType.NOT_FOUND, title: getErrorTitle(ErrorType.NOT_FOUND) };
    }
    if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('session')) {
      return { type: ErrorType.AUTH, title: getErrorTitle(ErrorType.AUTH) };
    }
    if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.toLowerCase().includes('access denied')) {
      return { type: ErrorType.FORBIDDEN, title: getErrorTitle(ErrorType.FORBIDDEN) };
    }
    if (errorMsg.includes('timeout') || errorMsg.toLowerCase().includes('timed out')) {
      return { type: ErrorType.TIMEOUT, title: getErrorTitle(ErrorType.TIMEOUT) };
    }
    
    return { type: ErrorType.UNKNOWN, title: 'Unable to Load' };
  };

  if (loading) return <Loader />;

  // Handle different error types with appropriate UI
  const errorInfo = getErrorInfo(error);
  const errorType = errorInfo.type;
  const errorTitle = errorInfo.title;
  const isRateLimited = errorType === ErrorType.RATE_LIMIT;
  const isNetworkError = errorType === ErrorType.NETWORK;
  const isServerError = errorType === ErrorType.SERVER;

  if (error) return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
            : error}
        </p>
        <button 
          onClick={fetchHome}
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
            Home Page
          </h1>

          <EmptyState
            title="No Home Sections Yet"
            description="Get started by creating your first home section. You can add hero, about, program, contact, or any other section type."
            buttonText="Create First Section"
            onButtonClick={handleCreate}
          />
        </div>

        {/* Modal - rendered even when empty */}
        <HomeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchHome}
          item={selectedItem}
          existingSectionTypes={[]}
          existingOrderPositions={[]}
        />
      </>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Home Page
        </h1>

        <button
          onClick={handleCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 md:py-2 bg-primary-gradient text-white font-medium text-sm rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Create Section</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr className="text-sm font-semibold text-gray-600">
              <th className="px-4 lg:px-8 py-4 text-center">Image</th>
              <th className="px-4 lg:px-8 py-4 text-center">Title</th>
              <th className="px-4 lg:px-8 py-4 text-center">Description</th>
              <th className="px-4 lg:px-8 py-4 text-center">Position</th>
              <th className="px-4 lg:px-8 py-4 text-center">Status</th>
              <th className="px-4 lg:px-8 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-100 transition ${!item.is_active ? 'bg-gray-50' : ''}`}>
                <td className="px-4 lg:px-8 py-4 text-center">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>

                <td className="px-4 lg:px-8 py-4 lg:py-6 text-center font-medium">
                  {item.title}
                </td>

                <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-left max-w-xs lg:max-w-xl">
                  <p className="line-clamp-2 lg:line-clamp-2">
                    {item.content || "No description available"}
                  </p>
                </td>

                <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                  <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md text-sm font-semibold ${
                    item.is_active 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    #{item.order_position}
                  </span>
                </td>

                <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
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
              {Math.min(indexOfLastItem, data.length)} of {data.length} results
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
            className={`bg-white rounded-xl border shadow-sm p-4 ${!item.is_active ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}
          >
            <div className="flex gap-4">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${item.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                    item.is_active 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.content || "No description available"}
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
              {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} of{" "}
              {data.length}
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

      {/* Modal */}
      <HomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchHome}
        item={selectedItem}
        existingSectionTypes={Object.values(
          data.reduce((acc, item) => {
            const baseType = item.section_type.replace(/\s+\d+$/, '').trim();
            if (!acc[baseType]) {
              acc[baseType] = { type: baseType, isActive: false };
            }
            // If any section of this type is active, mark as active
            if (item.is_active) {
              acc[baseType].isActive = true;
            }
            return acc;
          }, {})
        )}
        existingOrderPositions={data.map((item) => item.order_position)}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onRefresh={fetchHome}
        item={itemToDelete}
        sectionType="Home Section"
        deleteFunction={deleteHomeSection}
      />
    </div>
  );
}
