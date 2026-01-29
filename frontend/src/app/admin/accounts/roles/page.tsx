'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Key,
} from 'lucide-react';
import {
  apiClient,
  RoleResponse,
  RoleWithPermissionsResponse,
  PermissionsGroupedResponse,
  PermissionResponse,
} from '@/lib/api';

// Roles that should be hidden from the UI (system roles)
const HIDDEN_ROLES = ['super_admin'];

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissionsResponse | null>(null);
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsGroupedResponse[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Role Dialogs
  const [createRoleDialog, setCreateRoleDialog] = useState(false);
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // Permission Dialogs
  const [createPermissionDialog, setCreatePermissionDialog] = useState(false);
  const [editPermissionDialog, setEditPermissionDialog] = useState(false);
  const [deletePermissionDialog, setDeletePermissionDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);
  const [newPermResource, setNewPermResource] = useState('');
  const [newPermAction, setNewPermAction] = useState('');
  const [newPermDescription, setNewPermDescription] = useState('');

  // Expanded permission groups
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Fetch roles and permissions
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsGroupedData, permissionsData] = await Promise.all([
        apiClient.getRoles(),
        apiClient.getPermissionsGrouped(),
        apiClient.getPermissions(false) as Promise<PermissionResponse[]>,
      ]);

      // Filter out hidden roles (like super_admin)
      const visibleRoles = rolesData.filter(
        (role) => !HIDDEN_ROLES.includes(role.roleName)
      );

      setRoles(visibleRoles);
      setPermissionsGrouped(permissionsGroupedData);
      setAllPermissions(permissionsData);

      // Auto-select first visible role if none selected
      if (visibleRoles.length > 0 && !selectedRole) {
        const firstRole = await apiClient.getRoleById(visibleRoles[0].id);
        setSelectedRole(firstRole);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Select role
  const handleSelectRole = async (role: RoleResponse) => {
    setRoleLoading(true);
    try {
      const roleDetail = await apiClient.getRoleById(role.id);
      setSelectedRole(roleDetail);
    } catch (err: any) {
      alert(err.message || 'Không thể tải chi tiết vai trò');
    } finally {
      setRoleLoading(false);
    }
  };

  // Create role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    setActionLoading(true);
    try {
      await apiClient.createRole(newRoleName, newRoleDescription || undefined);
      setCreateRoleDialog(false);
      setNewRoleName('');
      setNewRoleDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo vai trò');
    } finally {
      setActionLoading(false);
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!selectedRole || !newRoleName.trim()) return;

    setActionLoading(true);
    try {
      await apiClient.updateRole(selectedRole.id, {
        roleName: newRoleName,
        description: newRoleDescription || null,
      });
      setEditRoleDialog(false);
      setNewRoleName('');
      setNewRoleDescription('');
      fetchData();
      // Refresh selected role
      const updated = await apiClient.getRoleById(selectedRole.id);
      setSelectedRole(updated);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật vai trò');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    setActionLoading(true);
    try {
      await apiClient.deleteRole(selectedRole.id);
      setDeleteRoleDialog(false);
      setSelectedRole(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa vai trò');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle permission
  const handleTogglePermission = async (permission: PermissionResponse) => {
    if (!selectedRole) return;

    const hasPermission = selectedRole.permissions.some(p => p.id === permission.id);

    setActionLoading(true);
    try {
      if (hasPermission) {
        await apiClient.removePermissionFromRole(selectedRole.id, permission.id);
      } else {
        await apiClient.assignPermissionsToRole(selectedRole.id, {
          permissionIds: [permission.id],
        });
      }
      // Refresh selected role
      const updated = await apiClient.getRoleById(selectedRole.id);
      setSelectedRole(updated);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật quyền');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle group expansion
  const toggleGroup = (resource: string) => {
    setExpandedGroups(prev =>
      prev.includes(resource)
        ? prev.filter(g => g !== resource)
        : [...prev, resource]
    );
  };

  // Check if role has permission
  const roleHasPermission = (permissionId: string): boolean => {
    return selectedRole?.permissions.some(p => p.id === permissionId) || false;
  };

  // Open edit dialog
  const openEditDialog = () => {
    if (!selectedRole) return;
    setNewRoleName(selectedRole.roleName);
    setNewRoleDescription(selectedRole.description || '');
    setEditRoleDialog(true);
  };

  // ==================== PERMISSION CRUD ====================

  // Create permission
  const handleCreatePermission = async () => {
    if (!newPermResource.trim() || !newPermAction.trim()) return;

    setActionLoading(true);
    try {
      await apiClient.createPermission({
        resource: newPermResource.toLowerCase().trim(),
        action: newPermAction.toLowerCase().trim(),
        description: newPermDescription.trim() || undefined,
      });
      setCreatePermissionDialog(false);
      setNewPermResource('');
      setNewPermAction('');
      setNewPermDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo quyền');
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit permission dialog
  const openEditPermissionDialog = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setNewPermDescription(permission.description || '');
    setEditPermissionDialog(true);
  };

  // Update permission
  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    setActionLoading(true);
    try {
      await apiClient.updatePermission(selectedPermission.id, {
        description: newPermDescription.trim() || undefined,
      });
      setEditPermissionDialog(false);
      setSelectedPermission(null);
      setNewPermDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật quyền');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete permission
  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    setActionLoading(true);
    try {
      await apiClient.deletePermission(selectedPermission.id);
      setDeletePermissionDialog(false);
      setSelectedPermission(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa quyền. Có thể quyền đang được gán cho vai trò.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thiết lập vai trò và quyền</h1>
        <p className="text-gray-600 mt-1">Quản lý vai trò và phân quyền cho người dùng</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vai trò
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'permissions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Quyền hạn
            </div>
          </button>
        </nav>
      </div>

      {/* Roles Tab Content */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Danh sách vai trò</h2>
              <button
                onClick={() => {
                  setNewRoleName('');
                  setNewRoleDescription('');
                  setCreateRoleDialog(true);
                }}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedRole?.id === role.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <Shield className={`w-5 h-5 ${selectedRole?.id === role.id ? 'text-primary' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{role.roleName}</div>
                    {role.description && (
                      <div className="text-sm text-gray-500 truncate">{role.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {roleLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedRole ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedRole.roleName}</h2>
                    {selectedRole.description && (
                      <p className="text-sm text-gray-500">{selectedRole.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openEditDialog}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteRoleDialog(true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-700 mb-4">Quyền hạn</h3>
                  <div className="space-y-2">
                    {permissionsGrouped.map((group) => (
                      <div key={group.resource} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleGroup(group.resource)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900 capitalize">
                            {group.resource}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {group.permissions.filter(p => roleHasPermission(p.id)).length}/{group.permissions.length}
                            </span>
                            {expandedGroups.includes(group.resource) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        {expandedGroups.includes(group.resource) && (
                          <div className="border-t border-gray-200 px-4 py-2 space-y-2">
                            {group.permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={roleHasPermission(permission.id)}
                                  onChange={() => handleTogglePermission(permission)}
                                  disabled={actionLoading}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{permission.description || permission.action}</div>
                                  <div className="text-sm text-gray-500">{permission.permissionName}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Chọn một vai trò để xem và chỉnh sửa quyền
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions Tab Content */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Danh sách quyền hạn</h2>
            <button
              onClick={() => {
                setNewPermResource('');
                setNewPermAction('');
                setNewPermDescription('');
                setCreatePermissionDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Thêm quyền
            </button>
          </div>
          <div className="p-4">
            {permissionsGrouped.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có quyền hạn nào. Nhấn &quot;Thêm quyền&quot; để tạo mới.
              </div>
            ) : (
              <div className="space-y-2">
                {permissionsGrouped.map((group) => (
                  <div key={group.resource} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleGroup(`perm-${group.resource}`)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
                    >
                      <span className="font-medium text-gray-900 capitalize">
                        {group.resource}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {group.permissions.length} quyền
                        </span>
                        {expandedGroups.includes(`perm-${group.resource}`) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {expandedGroups.includes(`perm-${group.resource}`) && (
                      <div className="border-t border-gray-200 divide-y divide-gray-100">
                        {group.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {permission.permissionName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {permission.description || `${permission.resource}:${permission.action}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditPermissionDialog(permission)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPermission(permission);
                                  setDeletePermissionDialog(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Role Dialog */}
      {createRoleDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setCreateRoleDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tạo vai trò mới
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên vai trò *
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Nhập tên vai trò..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setCreateRoleDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim() || actionLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo vai trò
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      {editRoleDialog && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setEditRoleDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chỉnh sửa vai trò
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên vai trò *
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Nhập tên vai trò..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditRoleDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={!newRoleName.trim() || actionLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Dialog */}
      {deleteRoleDialog && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setDeleteRoleDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận xóa vai trò
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa vai trò <strong>{selectedRole.roleName}</strong>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteRoleDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteRole}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xóa vai trò
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PERMISSION DIALOGS ==================== */}

      {/* Create Permission Dialog */}
      {createPermissionDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setCreatePermissionDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tạo quyền mới
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource *
                  </label>
                  <input
                    type="text"
                    value={newPermResource}
                    onChange={(e) => setNewPermResource(e.target.value)}
                    placeholder="vd: product, order, user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tên resource (viết thường, không dấu)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action *
                  </label>
                  <input
                    type="text"
                    value={newPermAction}
                    onChange={(e) => setNewPermAction(e.target.value)}
                    placeholder="vd: create, read, update, delete..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hành động (viết thường, không dấu)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newPermDescription}
                    onChange={(e) => setNewPermDescription(e.target.value)}
                    placeholder="Mô tả quyền hạn này..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
                {newPermResource && newPermAction && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Permission name: <strong>{newPermResource.toLowerCase()}:{newPermAction.toLowerCase()}</strong>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setCreatePermissionDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePermission}
                  disabled={!newPermResource.trim() || !newPermAction.trim() || actionLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Dialog */}
      {editPermissionDialog && selectedPermission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setEditPermissionDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chỉnh sửa quyền
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Permission: <strong>{selectedPermission.permissionName}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newPermDescription}
                    onChange={(e) => setNewPermDescription(e.target.value)}
                    placeholder="Mô tả quyền hạn này..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditPermissionDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdatePermission}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permission Dialog */}
      {deletePermissionDialog && selectedPermission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setDeletePermissionDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận xóa quyền
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa quyền <strong>{selectedPermission.permissionName}</strong>?
                <br />
                <span className="text-red-500">
                  Lưu ý: Không thể xóa quyền đang được gán cho vai trò.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletePermissionDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeletePermission}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xóa quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
