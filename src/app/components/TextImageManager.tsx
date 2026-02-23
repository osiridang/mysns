import { useEffect, useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Trash2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { imageApi } from '@/utils/api';
import { UPLOAD_LIMITS, DEFAULT_IMAGES } from '@/constants';

interface TextImage {
  id: string;
  filename: string;
  name: string;
  url: string | null;
  createdAt: string;
}

interface TextImageManagerProps {
  selectedImageUrl?: string | string[];
  onSelectImage: (urls: string[]) => void;
  accessToken: string;
}

export function TextImageManager({ selectedImageUrl, onSelectImage, accessToken }: TextImageManagerProps) {
  const [images, setImages] = useState<TextImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert to array for consistency
  const selectedUrls = Array.isArray(selectedImageUrl) ? selectedImageUrl : (selectedImageUrl ? [selectedImageUrl] : []);

  /** API 실패 시 사용할 기본 텍스트 이미지 (assets) */
  const getDefaultTextImagesAsList = (): TextImage[] => {
    const names = ['가장강력한전북', '이원택과', '더불어'];
    return (DEFAULT_IMAGES.defaultTextImages || []).map((url, i) => ({
      id: `default-text-${i}`,
      filename: `${names[i]}.svg`,
      name: names[i],
      url,
      createdAt: new Date().toISOString(),
    }));
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await imageApi.getTextImages(accessToken);
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching text images:', error);
      const fallback = getDefaultTextImagesAsList();
      setImages(fallback);
      if (fallback.length > 0) {
        toast.info('서버에서 목록을 불러오지 못해 기본 이미지를 표시합니다.');
      } else {
        toast.error('텍스트 이미지를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - PNG and SVG only
    if (!file.type.match(/image\/(png|svg\+xml)/)) {
      toast.error('PNG 또는 SVG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > UPLOAD_LIMITS.maxFileSize) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);

    try {
      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;

          await imageApi.uploadTextImage(imageData, file.name, accessToken);
          toast.success('텍스트 이미지가 업로드되었습니다!');
          fetchImages();
        } catch (error) {
          console.error('Error uploading text image:', error);
          toast.error(`텍스트 이미지 업로드에 실패했습니다: ${error.message}`);
          setUploading(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        toast.error('파일을 읽는데 실패했습니다.');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      toast.error('텍스트 이미지 업로드에 실패했습니다.');
      setUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await imageApi.deleteTextImage(id, accessToken);
      toast.success('텍스트 이미지가 삭제되었습니다.');
      fetchImages();
    } catch (error) {
      console.error('Error deleting text image:', error);
      toast.error('텍스트 이미지 삭제에 실패했습니다.');
    }
  };

  const handleSelect = (image: TextImage) => {
    if (!image.url) return;
    
    // Toggle selection
    const newUrls = selectedUrls.includes(image.url)
      ? selectedUrls.filter(url => url !== image.url) // Remove if already selected
      : [...selectedUrls, image.url]; // Add if not selected
    
    onSelectImage(newUrls);
    toast.success(
      selectedUrls.includes(image.url) 
        ? '텍스트 이미지가 선택 해제되었습니다.' 
        : '텍스트 이미지가 선택되었습니다.'
    );
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">텍스트 이미지 관리</h3>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          {uploading ? '업로드 중...' : '업로드'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        캘리그라피, 로고 등 텍스트 이미지를 업로드하고 관리하세요. PNG 또는 SVG 형식만 지원합니다.
      </p>

      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>업로드된 텍스트 이미지가 없습니다.</p>
          <p className="text-xs mt-1">위의 업로드 버튼을 눌러 추가하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image) => {
            const isSelected = selectedUrls.includes(image.url || '');
            const isSvg = image.filename?.endsWith('.svg');
            
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
                {/* Image with gray background for visibility */}
                {image.url && (
                  <div className="aspect-square bg-gray-200 flex items-center justify-center p-4">
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

                {/* SVG Badge */}
                {isSvg && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded px-2 py-0.5 text-xs font-medium">
                    SVG
                  </div>
                )}

                {/* Delete Button (기본 이미지는 삭제 불가) */}
                {!image.id.startsWith('default-text-') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                    className="absolute bottom-8 right-2 bg-red-500 text-white rounded p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

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