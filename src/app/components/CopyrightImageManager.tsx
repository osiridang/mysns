import { useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Upload, FileImage, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_IMAGES } from '@/constants';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CopyrightImageManagerProps {
  selectedImageUrl: string;
  onSelectImage: (url: string) => void;
}

export function CopyrightImageManager({ selectedImageUrl, onSelectImage }: CopyrightImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVisible = Boolean(selectedImageUrl);

  const currentUrl = selectedImageUrl || DEFAULT_IMAGES.copyright;

  const handleShow = () => {
    onSelectImage(DEFAULT_IMAGES.copyright);
    toast.success('하단 문구를 표시합니다.');
  };

  const handleHide = () => {
    onSelectImage('');
    toast.success('하단 문구를 숨겼습니다.');
  };

  const handleUseDefault = () => {
    onSelectImage(DEFAULT_IMAGES.copyright);
    toast.success('기본 하단 문구 이미지를 적용했습니다.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 선택할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSelectImage(reader.result as string);
      toast.success('하단 문구 이미지를 변경했습니다.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">하단 문구 (카피라이트)</h3>
      <p className="text-sm text-gray-500">
        카드 제일 하단에 표시되는 이미지입니다.
      </p>

      {/* 보이기 / 감추기 - 엑티브 = 현재 상태 */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={isVisible ? "default" : "secondary"}
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleShow}
        >
          <Eye className="w-4 h-4" />
          보이기
        </Button>
        <Button
          type="button"
          variant={!isVisible ? "default" : "secondary"}
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleHide}
          disabled={!isVisible}
        >
          <EyeOff className="w-4 h-4" />
          감추기
        </Button>
      </div>

      {/* 현재 선택 미리보기 */}
      <div className="rounded-lg border bg-gray-50 p-3">
        <p className="text-xs text-gray-500 mb-2">
          {isVisible ? '현재 적용' : '현재 감춤'}
        </p>
        <div className="flex items-center justify-center h-12 bg-white rounded border">
          {isVisible ? (
            <ImageWithFallback
              src={currentUrl}
              alt="하단 문구"
              className="max-h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-gray-400 text-sm">하단 문구가 숨겨져 있습니다</span>
          )}
        </div>
      </div>

      {/* 기본 이미지 사용 */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={handleUseDefault}
      >
        <FileImage className="w-4 h-4" />
        기본 이미지 사용 (하단카피라이트.png)
      </Button>

      {/* 직접 업로드 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        이미지 업로드
      </Button>
    </div>
  );
}
