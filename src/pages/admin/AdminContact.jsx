import { useEffect, useState } from "react";
import { getAllContacts, deleteContact } from "../../lib/services/adminContactService";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import ContactModal from "../../components/admin_ui/ContactModal";
import DeleteModal from "../../components/admin_ui/DeleteModal";
import EmptyState from "../../components/admin_ui/EmptyState";
import Loading from "../../components/ui/Loading";

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts();
      const newData = response.data || [];
      setContacts(newData);
      setError("");

      // Adjust current page if it becomes invalid after deletion
      const newTotalPages = Math.ceil(newData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newData.length === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(contacts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contacts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle edit click
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Handle add new click
  const handleAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  if (loading) return (
    <Loading 
      table={{
        columns: [
          { label: 'Email', show: true },
          { label: 'Phone', show: true },
          { label: 'Address', show: true },
          { label: 'Action', show: true }
        ],
        showPosition: false,
        showImage: false,
        showStatus: false,
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
          onClick={fetchContacts}
          className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty state
  if (contacts.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
          Contact Information
        </h1>

        <EmptyState
          title="No Contact Information"
          description="Add your company contact details to display on the website."
          buttonText="Add Contact Info"
          onButtonClick={handleAddClick}
        />

        <ContactModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onRefresh={fetchContacts}
          item={selectedItem}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Contact Information
        </h1>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>
      </div>

      {contacts.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr className="text-sm font-semibold text-gray-600">
                  <th className="px-4 lg:px-8 py-4 text-center">Email</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Phone</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Address</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-100 transition">
                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center text-gray-600">
                      {contact.email}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center text-gray-600">
                      {contact.phone}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-left max-w-xs">
                      <span className="line-clamp-2">{contact.address}</span>
                    </td>

                    <td className="px-2 sm:px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <div className="inline-flex items-center justify-center gap-0 rounded-md sm:rounded-lg border border-gray-200 sm:border-gray-300 overflow-hidden">
                        <button
                          onClick={() => handleEditClick(contact)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 sm:hover:bg-gray-200 transition"
                        >
                          <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>

                        <div className="h-4 w-px sm:h-6 bg-gray-200 sm:bg-gray-300"></div>

                        <button
                          onClick={() => handleDeleteClick(contact)}
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
                  {Math.min(indexOfLastItem, contacts.length)} of {contacts.length} results
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
                    )
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
            {currentItems.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Email</span>
                    <span className="block text-sm text-gray-600">
                      {contact.email}
                    </span>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Phone</span>
                    <span className="block text-sm text-gray-600">
                      {contact.phone}
                    </span>
                  </div>
                  
                  {/* Address */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Address</span>
                    <span className="block text-sm text-gray-600">
                      {contact.address}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(contact)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(contact)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onRefresh={fetchContacts}
        item={selectedItem}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onRefresh={fetchContacts}
        item={itemToDelete}
        deleteFunction={deleteContact}
        sectionType="contact"
      />
    </div>
  );
}
