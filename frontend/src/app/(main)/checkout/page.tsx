'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  apiClient,
  type CheckoutPreviewResponse,
  type AddressResponse,
  type PaymentMethod,
  type ApiError,
} from '@/lib/api';
import { AddressSection } from '@/components/checkout/AddressSection';
import { AddressPickerDialog } from '@/components/checkout/AddressPickerDialog';
import { ProductsSection } from '@/components/checkout/ProductsSection';
import { PaymentMethodSection } from '@/components/checkout/PaymentMethodSection';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { useCart } from '@/contexts/CartContext';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<CheckoutPreviewResponse | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');
  const [shopNotes, setShopNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [useCoin, setUseCoin] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchCheckoutData = useCallback(async () => {
    try {
      setLoading(true);
      const [checkout, addressList, coinWallet, wallet] = await Promise.all([
        apiClient.getCheckoutPreview(),
        apiClient.getAllAddresses(),
        apiClient.getCoinWallet().catch(() => ({ balance: 0 })),
        apiClient.getWalletBalance().catch(() => ({ availableBalance: 0 })),
      ]);
      setCheckoutData(checkout);
      setAddresses(addressList);
      setCoinBalance(coinWallet.balance);
      setWalletBalance(wallet.availableBalance);

      // Auto-select default address
      const defaultAddress = addressList.find((a) => a.isDefault) || addressList[0];
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  const handleShopNoteChange = (shopId: string, note: string) => {
    setShopNotes((prev) => ({
      ...prev,
      [shopId]: note,
    }));
  };

  const handleSelectAddress = (address: AddressResponse) => {
    setSelectedAddress(address);
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!checkoutData || checkoutData.shops.length === 0) {
      toast.error('Không có sản phẩm để đặt hàng');
      return;
    }

    try {
      setSubmitting(true);

      // Build shop notes array
      const shopNotesArray = Object.entries(shopNotes)
        .filter(([, note]) => note.trim())
        .map(([shopId, note]) => ({
          shopId,
          note: note.trim(),
        }));

      const response = await apiClient.createOrder({
        addressId: selectedAddress.id,
        paymentMethod,
        shopNotes: shopNotesArray.length > 0 ? shopNotesArray : undefined,
        useCoin,
      });

      // Refresh cart after successful order
      await refreshCart();

      // If there's a payment URL (VNPay), redirect to it
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      // Otherwise, navigate to success page with order IDs
      const orderIds = response.orders.map((o) => o.id).join(',');
      router.push(`/checkout/success?orders=${orderIds}`);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!checkoutData || checkoutData.shops.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Không có sản phẩm để thanh toán</h2>
        <p className="text-gray-500 mb-6">Vui lòng chọn sản phẩm từ giỏ hàng</p>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  const canSubmit = !!selectedAddress;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/cart"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Address, Products, Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <AddressSection
            address={selectedAddress}
            onChangeAddress={() => setShowAddressPicker(true)}
          />

          {/* Products Section */}
          <ProductsSection
            shops={checkoutData.shops}
            shopNotes={shopNotes}
            onShopNoteChange={handleShopNoteChange}
          />

          {/* Payment Method Section */}
          <PaymentMethodSection
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            useCoin={useCoin}
            onUseCoinChange={setUseCoin}
            coinBalance={coinBalance}
            walletBalance={walletBalance}
          />
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <OrderSummary
            totalItems={checkoutData.totalQuantity}
            subtotal={checkoutData.subtotal}
            total={checkoutData.subtotal}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            canSubmit={canSubmit}
          />
        </div>
      </div>

      {/* Address Picker Dialog */}
      <AddressPickerDialog
        open={showAddressPicker}
        onOpenChange={setShowAddressPicker}
        selectedAddressId={selectedAddress?.id ?? null}
        onSelectAddress={handleSelectAddress}
      />
    </div>
  );
}
