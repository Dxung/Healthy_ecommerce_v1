'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { AddressModal } from '@/components/user/AddressModal';
import { apiClient, type AddressResponse } from '@/lib/api';
import { Plus, MapPin, Phone, User, CheckCircle } from 'lucide-react';

export default function AddressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);

  // Delete confirmation state
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Prevent duplicate calls in React Strict Mode (development only)
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchAddresses();
  }, [user, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAllAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: AddressResponse) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      setDeletingAddressId(addressToDelete);
      setShowDeleteConfirm(false);
      await apiClient.deleteAddress(addressToDelete);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa địa chỉ');
    } finally {
      setDeletingAddressId(null);
      setAddressToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setAddressToDelete(null);
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await apiClient.setDefaultAddress(addressId);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Không thể thiết lập địa chỉ mặc định');
    }
  };

  const handleModalSuccess = () => {
    fetchAddresses();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Địa chỉ của tôi</h1>
              <div className="relative group">
                <button
                  onClick={handleAddNew}
                  disabled={addresses.length >= 10}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm địa chỉ mới</span>
                </button>
                {addresses.length >= 10 && (
                  <div className="invisible group-hover:visible absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-amber-50 text-amber-800 text-sm rounded-lg shadow-lg border border-amber-200 whitespace-nowrap z-10">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-50 border-l border-t border-amber-200 rotate-45"></div>
                    Đến giới hạn số lượng địa chỉ cùng lúc của người dùng
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchAddresses}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Thử lại
                  </button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <MapPin className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <p className="text-yellow-800">
                    Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để thuận tiện cho việc giao hàng.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address, index) => (
                    <div key={address.id}>
                      {/* Address Card */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          {/* Left Section */}
                          <div className="flex-1">
                            {/* Name and Default Badge */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {address.recipientName}
                                </span>
                              </div>
                              {address.isDefault && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md border border-green-300">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Địa chỉ mặc định</span>
                                </span>
                              )}
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Phone className="w-4 h-4" />
                              <span>{address.recipientPhone}</span>
                            </div>

                            {/* Full Address */}
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{address.fullAddress}</span>
                            </div>
                          </div>

                          {/* Right Section - Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(address)}
                              className="px-4 py-1.5 text-sm text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors whitespace-nowrap"
                            >
                              Chỉnh sửa
                            </button>
                            {/* Hide delete button for default address when other addresses exist */}
                            {(!address.isDefault || addresses.length === 1) && (
                              <button
                                onClick={() => handleDeleteClick(address.id)}
                                disabled={deletingAddressId === address.id}
                                className="px-4 py-1.5 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50"
                              >
                                {deletingAddressId === address.id ? 'Đang xóa...' : 'Xóa'}
                              </button>
                            )}
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefault(address.id)}
                                className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Separator - Don't show after last item */}
                      {index < addresses.length - 1 && (
                        <div className="border-b border-gray-200 my-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        address={editingAddress}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Xác nhận xóa địa chỉ
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 text-center mb-6">
              Bạn chắc chắn muốn xóa địa chỉ này?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
