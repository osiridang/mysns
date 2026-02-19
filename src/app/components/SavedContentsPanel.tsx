import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { SavedContent } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface SavedContentsPanelProps {
  onLoadContent: (content: SavedContent) => void;
}

export function SavedContentsPanel({ onLoadContent }: SavedContentsPanelProps) {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);

  useEffect(() => {
    loadSavedContents();
  }, []);

  const loadSavedContents = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CONTENTS);
      if (saved) {
        const contents = JSON.parse(saved);
        setSavedContents(contents);
      }
    } catch (error) {
      console.error('Failed to load saved contents:', error);
      toast.error('저장된 내용을 불러오는데 실패했습니다.');
    }
  };

  const deleteContent = (id: string) => {
    try {
      const updatedContents = savedContents.filter(content => content.id !== id);
      localStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(updatedContents));
      setSavedContents(updatedContents);
      toast.success('내용이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleLoadContent = (content: SavedContent) => {
    onLoadContent(content);
    toast.success('내용을 불러왔습니다!');
  };

  const getTemplateDisplayName = (type: string) => {
    switch (type) {
      case 'horizontal-card':
        return '가로형 카드뉴스';
      case 'quad-layout':
        return '4분할 레이아웃';
      case 'vertical-list-card':
        return '세로 리스트 카드';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">저장된 내용</h3>
        <span className="text-sm text-gray-500">{savedContents.length}개</span>
      </div>

      {savedContents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-2">저장된 내용이 없습니다</p>
          <p className="text-xs text-gray-400">
            '내용 저장' 버튼을 눌러 현재 편집 중인 내용을 저장하세요
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {savedContents.map((content) => (
            <Card key={content.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{content.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        {getTemplateDisplayName(content.templateType)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(content.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLoadContent(content)}
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    불러오기
                  </Button>
                  <Button
                    onClick={() => deleteContent(content.id)}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}