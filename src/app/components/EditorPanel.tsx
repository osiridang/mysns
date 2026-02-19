import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card } from "@/app/components/ui/card";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { 
  TemplateType, 
  ProfileImage,
  HorizontalCardData,
  QuadLayoutData,
  VerticalListCardData,
  VerticalCardData,
} from '@/types';
import { AVAILABLE_ICONS } from '@/constants';
import { imageApi } from '@/utils/api';

interface EditorPanelProps {
  templateType: TemplateType;
  formData: HorizontalCardData | QuadLayoutData | VerticalListCardData | VerticalCardData;
  onFormChange: (field: string, value: any) => void;
}

export function EditorPanel({ templateType, formData, onFormChange }: EditorPanelProps) {
  const [profileImages, setProfileImages] = useState<ProfileImage[]>([]);
  const [showProfileGallery, setShowProfileGallery] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch profile images
  useEffect(() => {
    fetchProfileImages();
  }, []);

  const fetchProfileImages = async () => {
    setLoading(true);
    try {
      const data = await imageApi.getProfileImages(publicAnonKey);
      setProfileImages(data.images || []);
    } catch (error) {
      console.error('Error fetching profile images:', error);
      toast.error('프로필 이미지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFormChange('imageUrl', reader.result as string);
        toast.success('이미지가 업로드되었습니다!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSelect = (url: string) => {
    onFormChange('imageUrl', url);
    setShowProfileGallery(false);
    toast.success('프로필 이미지가 선택되었습니다!');
  };

  const handleClearImage = () => {
    onFormChange('imageUrl', '');
    toast.info('이미지가 제거되었습니다.');
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...(formData.items || ['', '', '', ''])];
    newItems[index] = value;
    onFormChange('items', newItems);
  };

  const handleItemDetailChange = (itemIndex: number, detailIndex: number, value: string) => {
    const newItemDetails = [...(formData.itemDetails || [['', ''], ['', ''], ['', ''], ['', '']])];
    if (!newItemDetails[itemIndex]) {
      newItemDetails[itemIndex] = ['', ''];
    }
    newItemDetails[itemIndex][detailIndex] = value;
    onFormChange('itemDetails', newItemDetails);
  };

  const handleIconChange = (index: number, iconName: string) => {
    const newIconNames = [...(formData.iconNames || ['Zap', 'Sprout', 'Globe', 'TrendingUp'])];
    newIconNames[index] = iconName;
    onFormChange('iconNames', newIconNames);
  };


  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">디자인 편집</h3>
      </div>

      {/* 템플릿별 입력 필드 */}
      {templateType === 'horizontal-card' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="headline1">제목 (첫 줄)</Label>
            <Input
              id="headline1"
              value={formData.headline1 || ''}
              onChange={(e) => onFormChange('headline1', e.target.value)}
              placeholder="미래는 이미"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline2">제목 (둘째 줄)</Label>
            <Input
              id="headline2"
              value={formData.headline2 || ''}
              onChange={(e) => onFormChange('headline2', e.target.value)}
              placeholder="우리 안에 있습니다"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subheadline">부제목</Label>
            <Input
              id="subheadline"
              value={formData.subheadline || ''}
              onChange={(e) => onFormChange('subheadline', e.target.value)}
              placeholder="부제목을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bodyText">본문</Label>
            <Textarea
              id="bodyText"
              value={formData.bodyText || ''}
              onChange={(e) => onFormChange('bodyText', e.target.value)}
              placeholder="본문 내용을 입력하세요"
              rows={4}
            />
          </div>
        </>
      )}

      {/* 4분할 레이아웃 전용 - 정책 아이템 상세 편집 */}
      {templateType === 'quad-layout' && (
        <>
          {/* 제목 줄 관리 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>메인 제목</Label>
              <Button
                onClick={() => {
                  const currentHeadlines = formData.headlines || [];
                  if (currentHeadlines.length < 5) {
                    onFormChange('headlines', [...currentHeadlines, { text: '', color: '#FFFFFF' }]);
                  }
                }}
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={(formData.headlines || []).length >= 5}
              >
                <Plus className="w-3 h-3" />
                제목 줄 추가
              </Button>
            </div>

            {(formData.headlines || []).map((headline, index) => (
              <div key={index} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-blue-900">
                      제목 줄 {index + 1}
                      {index === 2 && ' (얼굴 좌측)'}
                      {index === 3 && ' (얼굴 우측)'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newHeadlines = formData.headlines.filter((_, i) => i !== index);
                      onFormChange('headlines', newHeadlines);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    삭제
                  </button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">텍스트</Label>
                  <Input
                    value={headline.text}
                    onChange={(e) => {
                      const newHeadlines = [...formData.headlines];
                      newHeadlines[index] = { ...newHeadlines[index], text: e.target.value };
                      onFormChange('headlines', newHeadlines);
                    }}
                    placeholder={`제목 줄 ${index + 1}`}
                    className="bg-white text-[14px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">색상</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...formData.headlines];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...formData.headlines];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      placeholder="#FFFFFF"
                      className="flex-1 text-[14px] font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.headlines || formData.headlines.length === 0) && (
              <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                제목이 없습니다. '+ 제목 줄 추가' 버튼을 눌러 추가하세요.
              </div>
            )}
          </div>
          
          {/* 4개 정책 카드 편집 */}
          <div className="space-y-4">
            <Label>정책 카드 (4개)</Label>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-blue-900">카드 {index + 1}</span>
                </div>
                
                {/* 카드 제목 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">카드 제목</Label>
                  <Input
                    value={formData.items?.[index] || ''}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder={`정책 카드 ${index + 1} 제목`}
                    className="bg-white"
                  />
                </div>
                
                {/* 불릿 포인트 1 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">불릿 포인트 1</Label>
                  <Input
                    value={formData.itemDetails?.[index]?.[0] || ''}
                    onChange={(e) => handleItemDetailChange(index, 0, e.target.value)}
                    placeholder="세부 내용 1"
                    className="bg-white text-sm"
                  />
                </div>
                
                {/* 불릿 포인트 2 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">불릿 포인트 2</Label>
                  <Input
                    value={formData.itemDetails?.[index]?.[1] || ''}
                    onChange={(e) => handleItemDetailChange(index, 1, e.target.value)}
                    placeholder="세부 내용 2"
                    className="bg-white text-sm"
                  />
                </div>
                
                {/* 아이콘 선택 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">아이콘 선택</Label>
                  <Select
                    value={formData.iconNames?.[index] || 'Zap'}
                    onValueChange={(value) => handleIconChange(index, value)}
                  >
                    <SelectTrigger className="bg-white text-[14px] font-mono">
                      <SelectValue>
                        {availableIcons.find(icon => icon.name === formData.iconNames?.[index])?.label || '번개'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[14px] font-mono">
                      {availableIcons.map(icon => (
                        <SelectItem key={icon.name} value={icon.name}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 세로 리스트 카드 전용 - 리스트 아이템 편집 */}
      {templateType === 'vertical-list-card' && (
        <>
          {/* 제목 줄 관리 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>메인 제목</Label>
              <Button
                onClick={() => {
                  const currentHeadlines = formData.headlines || [];
                  if (currentHeadlines.length < 5) {
                    onFormChange('headlines', [...currentHeadlines, { text: '', color: '#FFFFFF' }]);
                  }
                }}
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={(formData.headlines || []).length >= 5}
              >
                <Plus className="w-3 h-3" />
                제목 줄 추가
              </Button>
            </div>

            {(formData.headlines || []).map((headline, index) => (
              <div key={index} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-blue-900">
                      제목 줄 {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newHeadlines = formData.headlines.filter((_, i) => i !== index);
                      onFormChange('headlines', newHeadlines);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    삭제
                  </button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">텍스트</Label>
                  <Input
                    value={headline.text}
                    onChange={(e) => {
                      const newHeadlines = [...formData.headlines];
                      newHeadlines[index] = { ...newHeadlines[index], text: e.target.value };
                      onFormChange('headlines', newHeadlines);
                    }}
                    placeholder={`제목 줄 ${index + 1}`}
                    className="bg-white text-[14px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-700">색상</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...formData.headlines];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...formData.headlines];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      placeholder="#FFFFFF"
                      className="flex-1 text-[14px] font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.headlines || formData.headlines.length === 0) && (
              <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                제목이 없습니다. '+ 제목 줄 추가' 버튼을 눌러 추가하세요.
              </div>
            )}
          </div>
          
          {/* 4개 리스트 아이템 편집 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>리스트 항목</Label>
              <Button
                onClick={() => {
                  const currentItems = formData.items || [];
                  if (currentItems.length < 8) {
                    onFormChange('items', [...currentItems, '']);
                    // 아이콘도 추가
                    const currentIcons = formData.iconNames || [];
                    onFormChange('iconNames', [...currentIcons, 'Zap']);
                  }
                }}
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={(formData.items || []).length >= 8}
              >
                <Plus className="w-3 h-3" />
                항목 추가
              </Button>
            </div>

            {(formData.items || []).map((item, index) => (
              <div key={index} className="p-4 border-2 border-green-200 rounded-lg bg-green-50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-green-900">리스트 항목 {index + 1}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newItems = formData.items.filter((_, i) => i !== index);
                      onFormChange('items', newItems);
                      // 아이콘도 삭제
                      const newIcons = (formData.iconNames || []).filter((_, i) => i !== index);
                      onFormChange('iconNames', newIcons);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    삭제
                  </button>
                </div>
                
                {/* 항목 제목 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">항목 제목</Label>
                  <Input
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder={`리스트 항목 ${index + 1} 제목`}
                    className="bg-white"
                  />
                </div>
                
                {/* 아이콘 선택 */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">아이콘 선택</Label>
                  <Select
                    value={formData.iconNames?.[index] || 'Zap'}
                    onValueChange={(value) => handleIconChange(index, value)}
                  >
                    <SelectTrigger className="bg-white text-[14px] font-mono">
                      <SelectValue>
                        {AVAILABLE_ICONS.find(icon => icon.name === (formData as VerticalListCardData).iconNames?.[index])?.label || '번개'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[14px] font-mono">
                      {AVAILABLE_ICONS.map(icon => (
                        <SelectItem key={icon.name} value={icon.name}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {(!(formData as VerticalListCardData).items || (formData as VerticalListCardData).items.length === 0) && (
              <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                리스트 항목이 없습니다. '+ 항목 추가' 버튼을 눌러 추가하세요.
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}