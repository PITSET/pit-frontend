// src/pages/admin/AdminManagement.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAdmins } from "../../lib/services/adminManagementService";
import { getAdmin } from "../../utils/auth";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../components/ui/Loader";
import AddAdminModal from "../../components/admin_ui/AddAdminModal";
import EditAdminModal from "../../components/admin_ui/EditAdminModal";
import ConfirmStatusModal from "../../components/admin_ui/ConfirmStatusModal";
import DeleteAdminModal from "../../components/admin_ui/DeleteAdminModal";

export default function AdminManagement() {
  const currentAdmin = getAdmin();

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected admin for modals
  const [selectedAdmin, setSelectedAdmin] = useState(null);

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

  // Open Add Modal
  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  // Open Status Modal (enable/disable)
  const handleToggleStatus = (admin) => {
    setSelectedAdmin(admin);
    setIsStatusModalOpen(true);
  };

  // Open Delete Modal
  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
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

      {/* Modals */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSuccess={() => refetch()}
      />

      <ConfirmStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSuccess={() => refetch()}
      />

      <DeleteAdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
