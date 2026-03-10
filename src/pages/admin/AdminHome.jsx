import { useEffect, useState } from "react";
import { getHomeSections, deleteHomeSection } from "../../lib/services/homeService";
import {
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import HomeModal from "../../components/admin_ui/HomeModal";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchHome = async () => {
    try {
      const response = await getHomeSections();
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch home data:", err);
      setError("Failed to fetch home data");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    const toastId = toast.loading("Deleting section...");
    try {
      await deleteHomeSection(id);
      toast.success("Section deleted successfully!", { id: toastId });
      fetchHome();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete section", { id: toastId });
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Home Page
        </h1>

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-gradient text-white rounded-lg hover:bg-primary-gradient-hover transition shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create</span>
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
                      src={item.image_url || "/placeholder.png"}
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-red-100 hover:border-red-300 transition"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
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
                    src={item.image_url || "/placeholder.png"}
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
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.content || "No description available"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
                >
                  <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-red-100 hover:border-red-300 transition"
                >
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
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
    </div>
  );
}
