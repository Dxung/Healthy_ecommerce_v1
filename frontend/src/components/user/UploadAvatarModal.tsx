'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UploadAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: File) => void;
}

// Helper function to create image from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Helper function to get cropped image
// Always outputs a 400x400px image to meet backend validation (min 150px)
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to fixed 400x400 (meets backend requirements: 150-2000px)
  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw the cropped image, resizing it to fit the output size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/jpeg', 0.95);
  });
}

export function UploadAvatarModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadAvatarModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number; naturalWidth: number; naturalHeight: number }) => {
    // Calculate minZoom based on actual rendered dimensions
    // mediaSize.width/height = how the image is rendered in the container
    const circleDiameter = 360;

    // Get the smaller dimension of the rendered image
    const minRenderedDimension = Math.min(mediaSize.width, mediaSize.height);

    // Calculate zoom needed to cover the circle completely
    // Add 2% buffer to ensure no gaps
    const calculatedMinZoom = (circleDiameter / minRenderedDimension) * 1.02;

    setMinZoom(calculatedMinZoom);
    setZoom(calculatedMinZoom);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Kích thước ảnh không được vượt quá 2MB');
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Check dimensions: 150x150 to 2000x2000
      if (img.width < 150 || img.height < 150) {
        toast.error('Kích thước ảnh tối thiểu là 150x150 pixels');
        return;
      }
      if (img.width > 2000 || img.height > 2000) {
        toast.error('Kích thước ảnh tối đa là 2000x2000 pixels');
        return;
      }

      // Create preview URL
      // minZoom will be calculated in onMediaLoaded callback after image renders
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Không thể đọc ảnh. Vui lòng thử lại');
    };

    img.src = objectUrl;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const handleSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);

      // Create File from Blob
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      // Close modal immediately - don't wait for upload
      handleClose();

      // Upload in background - parent component will handle API call
      // Toast notifications will show when done
      await onUploadSuccess(file);
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Crop/Upload error:', {
        message: error?.message,
        errorCode: error?.errorCode,
        name: error?.name,
        fullError: error
      });
      // Show user-friendly error message
      const errorMessage = error?.message || 'Không thể xử lý ảnh. Vui lòng thử lại';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[660px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
        </DialogHeader>

        {!selectedImage ? (
          // Upload zone
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              Nhấn để chọn hoặc kéo thả hình ảnh vào khung này.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Chấp nhận: JPG, PNG, WEBP (tối đa 2MB)
            </p>
          </div>
        ) : (
          // Crop interface
          <div className="space-y-4">
            {/* Cropper and Dropzone side by side */}
            <div className="flex gap-4 items-start">
              {/* Left side - Cropper (360x360 container and crop circle - both same size) */}
              <div className="flex flex-col gap-4">
                <div className="relative w-[360px] h-[360px] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    minZoom={minZoom}
                    maxZoom={3}
                    aspect={1}
                    cropShape="round"
                    cropSize={{ width: 360, height: 360 }}
                    showGrid={false}
                    restrictPosition={true}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onMediaLoaded={onMediaLoaded}
                  />
                </div>

                {/* Zoom slider - matches cropper width exactly */}
                <div className="w-[360px]">
                  <label className="text-sm font-medium mb-2 block">Thu phóng</label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={minZoom}
                    max={3}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right side - Dropzone (matches cropper height exactly, wider width) */}
              <div
                {...getRootProps()}
                className="h-[360px] w-[240px] border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center flex-shrink-0"
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-600">Chọn ảnh khác</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {selectedImage && (
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
