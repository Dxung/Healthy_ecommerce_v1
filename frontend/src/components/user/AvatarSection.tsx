'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { ViewFullAvatarModal } from './ViewFullAvatarModal';
import { UploadAvatarModal } from './UploadAvatarModal';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface AvatarSectionProps {
  avatarUrl: string;
  username: string;
  onAvatarUpdate: () => void;
}

export function AvatarSection({ avatarUrl, username, onAvatarUpdate }: AvatarSectionProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewFull = () => {
    setIsViewModalOpen(true);
  };

  const handleUpdateAvatar = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = async (file: File) => {
    try {
      await apiClient.uploadAvatar(file);
      toast.success('Ảnh đại diện đã được cập nhật');
      onAvatarUpdate(); // Refresh user data
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Upload error:', {
        message: error?.message,
        errorCode: error?.errorCode,
        statusCode: error?.statusCode,
        fullError: error
      });
      toast.error(error?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại sau');
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeleting(true);
    try {
      await apiClient.deleteAvatar();
      toast.success('Ảnh đại diện đã được xóa');
      onAvatarUpdate(); // Refresh user data
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.message || 'Xóa ảnh thất bại. Vui lòng thử lại sau');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 pt-8">
        {/* Large Avatar */}
        <div className="w-32 h-32 rounded-full border-4 border-primary/30 overflow-hidden bg-primary/5 flex items-center justify-center">
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewFull}
            className="w-full text-xs"
          >
            Xem ảnh đại diện đầy đủ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateAvatar}
            className="w-full text-xs"
          >
            Cập nhật ảnh đại diện
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
          >
            Xóa ảnh đại diện
          </Button>
        </div>
      </div>

      {/* View Full Avatar Modal */}
      <ViewFullAvatarModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        avatarUrl={avatarUrl}
        username={username}
      />

      {/* Upload Avatar Modal */}
      <UploadAvatarModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ảnh đại diện</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại? Ảnh sẽ được đặt về mặc định.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
