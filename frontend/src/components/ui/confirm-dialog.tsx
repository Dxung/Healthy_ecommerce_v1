'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, ToggleLeft } from 'lucide-react';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  loading?: boolean;
}

const variantStyles: Record<ConfirmDialogVariant, { icon: React.ReactNode; buttonClass: string }> = {
  danger: {
    icon: <Trash2 className="w-6 h-6 text-red-500" />,
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: <ToggleLeft className="w-6 h-6 text-yellow-500" />,
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'info',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {styles.icon}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="mt-2 text-sm text-gray-600">
                  {typeof description === 'string' ? (
                    <p className="whitespace-pre-line">{description}</p>
                  ) : (
                    description
                  )}
                </div>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={styles.buttonClass}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
