'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface EmailUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string | null;
  onSuccess: () => void;
}

export function EmailUpdateDialog({
  open,
  onOpenChange,
  currentEmail,
  onSuccess,
}: EmailUpdateDialogProps) {
  const [email, setEmail] = useState(currentEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Email không hợp lệ');
      return;
    }

    // Check if email is the same as current
    if (email.trim() === currentEmail) {
      setError('Email mới phải khác email hiện tại');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.updateProfile({ email: email.trim() });
      toast.success('Cập nhật email thành công!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      // Handle specific error for duplicate email
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes('đã được sử dụng')) {
          setError('Email này đã được sử dụng bởi tài khoản khác');
        } else {
          setError(errorMessage || 'Có lỗi xảy ra khi cập nhật email');
        }
      } else {
        setError('Có lỗi xảy ra khi cập nhật email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setEmail(currentEmail || '');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật email</DialogTitle>
          <DialogDescription>
            Nhập địa chỉ email mới của bạn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
