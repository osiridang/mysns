import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/config/supabase';

interface SavedImage {
  id: string;
  filename: string;
  url: string | null;
  metadata: {
    template: string;
    headline: string;
    subheadline?: string;
    createdAt: string;
  };
  createdAt: string;
}

interface SavedImagesPanelProps {
  onLoadImage: (metadata: any) => void;
  accessToken: string;
}

export function SavedImagesPanel({ onLoadImage, accessToken }: SavedImagesPanelProps) {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/images`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch images. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('이미지 목록을 불러오는데 실패했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/images/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('이미지가 삭제되었습니다.');
      fetchImages(); // Refresh list
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('이미지 삭제에 실패했습니다.');
    }
  };

  const handleLoad = (image: SavedImage) => {
    onLoadImage(image.metadata);
    toast.success('이미지 설정을 불러왔습니다.');
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">저장된 이미지</h3>
        <Button
          onClick={fetchImages}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          저장된 이미지가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                {image.url && (
                  <div className="flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.metadata.headline}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {image.metadata.headline}
                  </h4>
                  {image.metadata.subheadline && (
                    <p className="text-sm text-gray-600 truncate">
                      {image.metadata.subheadline}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    템플릿: {image.metadata.template}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleLoad(image)}
                    size="sm"
                    variant="outline"
                  >
                    불러오기
                  </Button>
                  <Button
                    onClick={() => handleDelete(image.id)}
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}