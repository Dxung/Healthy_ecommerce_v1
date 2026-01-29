'use client';

import { MapPin, ChevronRight } from 'lucide-react';
import { type AddressResponse } from '@/lib/api';

interface AddressSectionProps {
  address: AddressResponse | null;
  onChangeAddress: () => void;
}

export function AddressSection({ address, onChangeAddress }: AddressSectionProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3 text-primary">
        <MapPin className="w-5 h-5" />
        <h2 className="font-medium">Địa chỉ nhận hàng</h2>
      </div>

      {address ? (
        <button
          onClick={onChangeAddress}
          className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{address.recipientName}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{address.recipientPhone}</span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </button>
      ) : (
        <button
          onClick={onChangeAddress}
          className="w-full text-left p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <MapPin className="w-5 h-5" />
            <span>Chọn địa chỉ giao hàng</span>
          </div>
        </button>
      )}
    </div>
  );
}
