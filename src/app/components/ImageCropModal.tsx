import { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Slider } from '@/app/components/ui/slider';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropModal({ isOpen, imageUrl, onCropComplete, onCancel }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  const handleComplete = async () => {
    if (!imageUrl) return;

    setProcessing(true);
    try {
      let blob: Blob;
      if (imageUrl.startsWith('data:')) {
        blob = dataUrlToBlob(imageUrl);
      } else {
        const response = await fetch(imageUrl);
        blob = await response.blob();
      }
      onCropComplete(blob);
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessing(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">이미 크롭</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative bg-gray-100 flex items-start justify-center overflow-hidden pt-12" style={{ height: '400px' }}>
          <img 
            src={imageUrl} 
            alt="Preview"
            className="object-contain transition-transform"
            style={{ 
              transform: `scale(${zoom})`,
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={processing}
            >
              취소
            </Button>
            <Button
              onClick={handleComplete}
              disabled={processing}
            >
              {processing ? '처리 중...' : '완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}