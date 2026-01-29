'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, type ApiError } from '@/lib/api';

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

interface UploadProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
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
// Outputs an 800x800px image to fit within backend requirements (500-1500px)
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

  // Set canvas size to fixed 800x800 (within backend requirements: 500-1500px)
  const outputSize = 800;
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
    }, 'image/jpeg', 0.9);
  });
}

export function UploadProductImageModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadProductImageModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    // Calculate minZoom based on actual rendered dimensions
    const cropSize = 320; // crop area size
    const minRenderedDimension = Math.min(mediaSize.width, mediaSize.height);
    const calculatedMinZoom = (cropSize / minRenderedDimension) * 1.02;

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

      // Check dimensions: 500x500 to 1500x1500
      if (img.width < 500 || img.height < 500) {
        toast.error('Kích thước ảnh tối thiểu là 500x500 pixels');
        return;
      }
      if (img.width > 1500 || img.height > 1500) {
        toast.error('Kích thước ảnh tối đa là 1500x1500 pixels');
        return;
      }

      // Create preview URL
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
      setIsUploading(true);

      // Get cropped image blob
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);

      // Create File from Blob
      const file = new File([croppedBlob], 'product-image.jpg', { type: 'image/jpeg' });

      // Upload to server
      const result = await apiClient.uploadProductImage(file);

      toast.success('Tải ảnh lên thành công');
      handleClose();
      onUploadSuccess(result.imageUrl);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Upload error:', apiError);
      toast.error(apiError?.message || 'Không thể tải ảnh lên. Vui lòng thử lại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setCroppedAreaPixels(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tải ảnh sản phẩm</DialogTitle>
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
              Nhấn để chọn hoặc kéo thả hình ảnh vào khung này
            </p>
            <p className="text-xs text-gray-400 mt-2">Chấp nhận: JPG, PNG, WEBP</p>
            <p className="text-xs text-gray-400 mt-1">500x500 - 1500x1500 px</p>
            <p className="text-xs text-gray-400">Tối đa 2MB</p>
          </div>
        ) : (
          // Crop interface
          <div className="space-y-4">
            {/* Cropper */}
            <div className="relative w-full h-[320px] bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                minZoom={minZoom}
                maxZoom={3}
                aspect={1}
                cropShape="rect"
                cropSize={{ width: 320, height: 320 }}
                showGrid={true}
                restrictPosition={true}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onMediaLoaded={onMediaLoaded}
              />
            </div>

            {/* Zoom slider */}
            <div>
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

            {/* Select another image */}
            <div
              {...getRootProps()}
              className="border border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...getInputProps()} />
              <p className="text-xs text-gray-600">Chọn ảnh khác</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {selectedImage && (
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tải lên
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
