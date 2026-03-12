import { useEffect, useState, useMemo } from "react";
import { getAllContacts } from "../../lib/services/adminContactService";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import EmptyState from "../../components/admin_ui/EmptyState";
import Loading from "../../components/ui/Loading";

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchContacts = async () => {
    try {
      const result = await getAllContacts();
      setContacts(result.data || []);
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

  // Filter data by status
  const filteredData = useMemo(() => {
    let result = contacts;

    if (statusFilter !== "all") {
      result = result.filter(item => item.status === statusFilter);
    }

    return result;
  }, [contacts, statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get unique statuses for filter buttons
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(contacts.map(c => c.status).filter(Boolean));
    return Array.from(statuses);
  }, [contacts]);

  if (loading) return (
    <Loading 
      table={{
        columns: [
          { label: 'Name', show: true },
          { label: 'Email', show: true },
          { label: 'Message', show: true },
          { label: 'Status', show: true },
          { label: 'Action', show: true }
        ],
        showPosition: false,
        showImage: false,
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
          Contact Messages
        </h1>

        <EmptyState
          title="No Messages Yet"
          description="When visitors contact you through the contact form, their messages will appear here."
          buttonText="Refresh"
          onButtonClick={fetchContacts}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          Contact Messages
        </h1>

        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
          {contacts.length} {contacts.length === 1 ? 'message' : 'messages'}
        </div>
      </div>

      {/* Status Filter - Button Style */}
      {uniqueStatuses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-1">Filter by:</span>
            
            {/* All Status Button */}
            <button
              onClick={() => setStatusFilter("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                statusFilter === "all"
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <FunnelIcon className={`w-4 h-4 ${statusFilter === "all" ? 'text-white' : 'text-gray-400'}`} />
              All
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                statusFilter === "all"
                  ? 'bg-orange-200 text-orange-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {contacts.length}
              </span>
            </button>

            {/* Status-specific buttons */}
            {uniqueStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusFilter === status ? 'bg-white' : 'bg-orange-400'}`}></span>
                {status}
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  statusFilter === status
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {contacts.filter(item => item.status === status).length}
                </span>
              </button>
            ))}

            {/* Clear Filter (only show when filter is active) */}
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center p-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                title="Clear filter"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {statusFilter !== "all" && (
        <div className="mb-4 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <span className="font-medium text-gray-900">
            {filteredData.length} {filteredData.length === 1 ? 'message' : 'messages'}
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
                  <th className="px-4 lg:px-8 py-4 text-center">Name</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Email</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Message</th>
                  <th className="px-4 lg:px-8 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-100 transition">
                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center font-medium text-gray-900">
                      {contact.name}
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        {contact.email}
                      </a>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-gray-600 text-left max-w-xs lg:max-w-xl">
                      <p className="line-clamp-2 lg:line-clamp-2">
                        {contact.message || "No message"}
                      </p>
                    </td>

                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contact.status === 'new' || contact.status === 'unread'
                          ? 'bg-orange-100 text-orange-800'
                          : contact.status === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : contact.status === 'replied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {contact.status || 'Unknown'}
                      </span>
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
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    contact.status === 'new' || contact.status === 'unread'
                      ? 'bg-orange-100 text-orange-800'
                      : contact.status === 'read'
                      ? 'bg-blue-100 text-blue-800'
                      : contact.status === 'replied'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {contact.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-3">
                    {contact.message || "No message"}
                  </p>
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
    </div>
  );
}
