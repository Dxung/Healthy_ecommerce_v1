'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient, type AddressResponse, type ApiError } from '@/lib/api';
import { Loader2, MapPin, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddressPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAddressId: string | null;
  onSelectAddress: (address: AddressResponse) => void;
}

export function AddressPickerDialog({
  open,
  onOpenChange,
  selectedAddressId,
  onSelectAddress,
}: AddressPickerDialogProps) {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllAddresses();
      setAddresses(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address: AddressResponse) => {
    onSelectAddress(address);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = '/user/account/address';
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm địa chỉ mới
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                return (
                  <button
                    key={address.id}
                    onClick={() => handleSelect(address)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{address.recipientName}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{address.recipientPhone}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {address.addressLine}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {address.wardName}, {address.districtName}, {address.provinceName}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {addresses.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                window.location.href = '/user/account/address';
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm địa chỉ mới
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
