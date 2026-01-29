'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ViewFullAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  username: string;
}

export function ViewFullAvatarModal({
  isOpen,
  onClose,
  avatarUrl,
  username,
}: ViewFullAvatarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Xem ảnh đại diện</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <img
            src={avatarUrl}
            alt={username}
            className="w-full max-w-[600px] h-auto rounded-lg object-cover"
            style={{ maxHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
