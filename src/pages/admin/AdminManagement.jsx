// src/pages/admin/AdminManagement.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAllAdmins,
  inviteAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from "../../lib/services/adminManagementService";
import { getAdmin } from "../../utils/auth";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";
import DeleteModal from "../../components/admin_ui/DeleteModal";

export default function AdminManagement() {
  const currentAdmin = getAdmin();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    role: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for admins
  const {
    data: adminsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await getAllAdmins();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
  });

  const admins = adminsData || [];

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setFormData({ email: "", username: "", role: "admin" });
      setSelectedAdmin(null);
    }
  }, [isModalOpen]);

  // Open modal for adding new admin
  const handleAddNew = () => {
    setSelectedAdmin(null);
    setFormData({ email: "", username: "", role: "admin" });
    setIsModalOpen(true);
  };

  // Open modal for editing admin
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      username: admin.username,
      role: admin.role,
    });
    setIsModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.username) {
      toast.error("Email and username are required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedAdmin) {
        // Update existing admin
        await updateAdmin(selectedAdmin.id, {
          username: formData.username,
          role: formData.role,
        });
        toast.success("Admin updated successfully");
      } else {
        // Invite new admin
        await inviteAdmin({
          email: formData.email,
          username: formData.username,
          role: formData.role,
        });
        toast.success("Admin invited successfully. They will receive an email to set their password.");
      }

      setIsModalOpen(false);
      refetch();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle status (enable/disable)
  const handleToggleStatus = async (admin) => {
    try {
      const newStatus = !admin.is_active;
      await toggleAdminStatus(admin.id, newStatus);
      toast.success(newStatus ? "Admin enabled successfully" : "Admin disabled successfully");
      refetch();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to update status";
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      await deleteAdmin(adminToDelete.id);
      toast.success("Admin deleted successfully");
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      refetch();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to delete admin";
      toast.error(errorMessage);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if current user is super_admin
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Failed to load admins</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-500 mt-1">Manage administrator accounts and permissions</p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-900 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Admin
          </button>
        )}
      </div>

      {/* Info message for non-super admins */}
      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <ShieldExclamationIcon className="w-5 h-5" />
            <span className="font-medium">Limited Access</span>
          </div>
          <p className="text-yellow-700 mt-1 text-sm">
            Only super admins can manage admin accounts. Contact a super admin if you need to make changes.
          </p>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <UserCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p>No admins found</p>
                    {isSuperAdmin && (
                      <button
                        onClick={handleAddNew}
                        className="mt-2 text-[#8B1A1A] hover:underline"
                      >
                        Add your first admin
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center">
                          <span className="text-[#8B1A1A] font-semibold">
                            {admin.username?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {admin.username}
                            {admin.id === currentAdmin?.id && (
                              <span className="ml-2 text-xs text-gray-500">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === "super_admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {admin.role === "super_admin" ? (
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                        ) : null}
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(admin.created_at)}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit button */}
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 text-gray-500 hover:text-[#8B1A1A] hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit admin"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>

                          {/* Toggle status button */}
                          {admin.id !== currentAdmin?.id && (
                            <button
                              onClick={() => handleToggleStatus(admin)}
                              className={`p-2 rounded-lg transition-colors ${
                                admin.is_active
                                  ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  : "text-green-500 hover:text-green-600 hover:bg-green-50"
                              }`}
                              title={admin.is_active ? "Disable admin" : "Enable admin"}
                            >
                              {admin.is_active ? (
                                <ShieldExclamationIcon className="w-5 h-5" />
                              ) : (
                                <ShieldCheckIcon className="w-5 h-5" />
                              )}
                            </button>
                          )}

                          {/* Delete button */}
                          {admin.id !== currentAdmin?.id && (
                            <button
                              onClick={() => handleDeleteClick(admin)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete admin"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              {/* Modal header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAdmin ? "Edit Admin" : "Add New Admin"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="px-6 py-6">
                <div className="space-y-4">
                  {/* Email - only show for new admin */}
                  {!selectedAdmin && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                        placeholder="admin@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        An invitation email will be sent to this address
                      </p>
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                      placeholder="johndoe"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Super admins can manage other admin accounts
                    </p>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : selectedAdmin ? "Update Admin" : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message={
          adminToDelete
            ? `Are you sure you want to delete "${adminToDelete.username}"? This action cannot be undone.`
            : "Are you sure you want to delete this admin?"
        }
        confirmText="Delete"
        isDanger
      />
    </div>
  );
}
