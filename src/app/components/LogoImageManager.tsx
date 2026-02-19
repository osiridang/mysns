import { useEffect, useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Trash2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface LogoImage {
  id: string;
  filename: string;
  name: string;
  url: string | null;
  createdAt: string;
}

interface LogoImageManagerProps {
  selectedImageUrl?: string;
  onSelectImage: (url: string) => void;
  accessToken: string;
}

export function LogoImageManager({ selectedImageUrl, onSelectImage, accessToken }: LogoImageManagerProps) {
  const [images, setImages] = useState<LogoImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/logo-images`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logo images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching logo images:', error);
      toast.error('로고 이미지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);

    // Read file and upload directly
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/logo-images`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData,
              name: file.name,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        toast.success('로고 이미지가 업로드되었습니다!');
        fetchImages();
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/logo-images/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('로고 이미지가 삭제되었습니다.');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('이미지 삭제에 실패했습니다.');
    }
  };

  const handleSelect = (image: LogoImage) => {
    onSelectImage(image.url || '');
    toast.success('로고 이미지가 선택되었습니다.');
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">로고 이미지 관리</h3>
        <p className="text-sm text-gray-600">
          좌측 상단에 표시될 로고 이미지를 업로드하고 관리하세요.
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          {uploading ? '업로드 중...' : '로고 업로드'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>업로드된 로고 이미지가 없습니다.</p>
          <p className="text-xs mt-1">위 업로드 버튼을 눌러 추가하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {images.map((image) => {
            const isSelected = image.url === selectedImageUrl;
            return (
              <div
                key={image.id}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleSelect(image)}
              >
                {/* Image */}
                {image.url && (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  className="absolute bottom-8 right-2 bg-red-500 text-white rounded p-1.5 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-2 py-1">
                  <p className="text-xs truncate">{image.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}