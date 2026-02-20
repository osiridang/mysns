import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { X, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { publicAnonKey } from '@/config/supabase';
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
  SquareLayoutData,
} from '@/types';
import { AVAILABLE_ICONS, TEMPLATE_LABELS } from '@/constants';
import { imageApi } from '@/utils/api';

interface EditorPanelProps {
  templateType: TemplateType;
  formData: HorizontalCardData | QuadLayoutData | VerticalListCardData | VerticalCardData | SquareLayoutData;
  onFormChange: (field: string, value: any) => void;
}

export function EditorPanel({ templateType, formData, onFormChange }: EditorPanelProps) {
  const [profileImages, setProfileImages] = useState<ProfileImage[]>([]);
  const [showProfileGallery, setShowProfileGallery] = useState(false);
  const [selectingForField, setSelectingForField] = useState<'image1' | 'image2' | 'imageUrl'>('imageUrl');
  const [loading, setLoading] = useState(false);
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field = 'imageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onFormChange(field, reader.result as string);
        toast.success('이미지가 업로드되었습니다!');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleProfileSelect = (url: string, field?: 'image1' | 'image2' | 'imageUrl') => {
    const target = field ?? selectingForField;
    onFormChange(target, url);
    setShowProfileGallery(false);
    toast.success('이미지가 선택되었습니다!');
  };

  const openGalleryFor = (field: 'image1' | 'image2' | 'imageUrl') => {
    setSelectingForField(field);
    setShowProfileGallery(true);
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


  const templateLabel = TEMPLATE_LABELS[templateType] ?? templateType;

  return (
    <Card className="p-6 space-y-6">
      <div className="border-b pb-4 mb-2">
        <p className="text-xs text-gray-500 mb-1">현재 템플릿</p>
        <p className="font-semibold text-gray-900">{templateLabel}</p>
      </div>
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
              placeholder="우리안에 있습니다"
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

          {/* 리스트 항목 (3번 템플릿과 동일 구조) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>리스트 항목</Label>
              <Button
                onClick={() => {
                  const currentItems = (formData as HorizontalCardData).items || [];
                  if (currentItems.length < 8) {
                    onFormChange('items', [...currentItems, '']);
                    const currentIcons = (formData as HorizontalCardData).iconNames || [];
                    onFormChange('iconNames', [...currentIcons, 'Zap']);
                  }
                }}
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={((formData as HorizontalCardData).items || []).length >= 8}
              >
                <Plus className="w-3 h-3" />
                항목 추가
              </Button>
            </div>

            {((formData as HorizontalCardData).items || []).map((item, index) => (
              <div key={index} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-blue-900">리스트 항목 {index + 1}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newItems = ((formData as HorizontalCardData).items || []).filter((_, i) => i !== index);
                      onFormChange('items', newItems);
                      const newIcons = ((formData as HorizontalCardData).iconNames || []).filter((_, i) => i !== index);
                      onFormChange('iconNames', newIcons);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    삭제
                  </button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">항목 제목</Label>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...((formData as HorizontalCardData).items || [])];
                      newItems[index] = e.target.value;
                      onFormChange('items', newItems);
                    }}
                    placeholder={`리스트 항목 ${index + 1}`}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">아이콘 선택</Label>
                  <Select
                    value={(formData as HorizontalCardData).iconNames?.[index] || 'Zap'}
                    onValueChange={(value) => {
                      const newIconNames = [...((formData as HorizontalCardData).iconNames || ['Zap', 'Sprout', 'Globe', 'TrendingUp'])];
                      newIconNames[index] = value;
                      onFormChange('iconNames', newIconNames);
                    }}
                  >
                    <SelectTrigger className="bg-white text-[14px] font-mono">
                      <SelectValue>
                        {AVAILABLE_ICONS.find(icon => icon.name === (formData as HorizontalCardData).iconNames?.[index])?.label || '번개'}
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

            {(!(formData as HorizontalCardData).items || (formData as HorizontalCardData).items.length === 0) && (
              <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                리스트 항목이 없습니다. &apos;+ 항목 추가&apos; 버튼을 눌러 추가하세요.
              </div>
            )}
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
                      const newHeadlines = (formData.headlines || []).filter((_, i) => i !== index);
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
                      const newHeadlines = [...(formData.headlines || [])];
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
                        const newHeadlines = [...(formData.headlines || [])];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...(formData.headlines || [])];
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
                        {AVAILABLE_ICONS.find(icon => icon.name === formData.iconNames?.[index])?.label || '번개'}
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
                      const newHeadlines = (formData.headlines || []).filter((_, i) => i !== index);
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
                      const newHeadlines = [...(formData.headlines || [])];
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
                        const newHeadlines = [...(formData.headlines || [])];
                        newHeadlines[index] = { ...newHeadlines[index], color: e.target.value };
                        onFormChange('headlines', newHeadlines);
                      }}
                      className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={headline.color}
                      onChange={(e) => {
                        const newHeadlines = [...(formData.headlines || [])];
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
                리스트 항목이 없습니다. &apos;+ 항목 추가&apos; 버튼을 눌러 추가하세요.
              </div>
            )}
          </div>
        </>
      )}

      {/* 정사각형 레이아웃 전용 */}
      {templateType === 'square-layout' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="headline1">제목1</Label>
            <Input
              id="headline1"
              value={(formData as SquareLayoutData).headline1 || ''}
              onChange={(e) => onFormChange('headline1', e.target.value)}
              placeholder="제목1"
            />
            <div className="flex gap-2 items-center">
              <Label className="text-xs text-gray-600 shrink-0">제목1 색상</Label>
              <input
                type="color"
                value={(formData as SquareLayoutData).headline1Color || '#FFFFFF'}
                onChange={(e) => onFormChange('headline1Color', e.target.value)}
                className="w-10 h-9 rounded border cursor-pointer"
              />
              <Input
                value={(formData as SquareLayoutData).headline1Color || '#FFFFFF'}
                onChange={(e) => onFormChange('headline1Color', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline2">제목2</Label>
            <Input
              id="headline2"
              value={(formData as SquareLayoutData).headline2 || ''}
              onChange={(e) => onFormChange('headline2', e.target.value)}
              placeholder="제목2"
            />
            <div className="flex gap-2 items-center">
              <Label className="text-xs text-gray-600 shrink-0">제목2 색상</Label>
              <input
                type="color"
                value={(formData as SquareLayoutData).headline2Color || '#FFFFFF'}
                onChange={(e) => onFormChange('headline2Color', e.target.value)}
                className="w-10 h-9 rounded border cursor-pointer"
              />
              <Input
                value={(formData as SquareLayoutData).headline2Color || '#FFFFFF'}
                onChange={(e) => onFormChange('headline2Color', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyText">본문 내용</Label>
            <textarea
              id="bodyText"
              value={(formData as SquareLayoutData).bodyText || ''}
              onChange={(e) => onFormChange('bodyText', e.target.value)}
              placeholder="본문 내용을 입력하세요"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label>사진1</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={(formData as SquareLayoutData).image1 || ''}
                onChange={(e) => onFormChange('image1', e.target.value)}
                placeholder="이미지 URL 또는 업로드"
                className="flex-1 min-w-0"
              />
              <input
                ref={image1InputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'image1')}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => image1InputRef.current?.click()}>
                업로드
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => openGalleryFor('image1')}>갤러리에서 선택</Button>
            </div>
            <Input
              value={(formData as SquareLayoutData).image1Caption || ''}
              onChange={(e) => onFormChange('image1Caption', e.target.value)}
              placeholder="사진1 설명 (우측 하단 라벨)"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>사진2</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={(formData as SquareLayoutData).image2 || ''}
                onChange={(e) => onFormChange('image2', e.target.value)}
                placeholder="이미지 URL 또는 업로드"
                className="flex-1 min-w-0"
              />
              <input
                ref={image2InputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'image2')}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => image2InputRef.current?.click()}>
                업로드
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => openGalleryFor('image2')}>갤러리에서 선택</Button>
            </div>
            <Input
              value={(formData as SquareLayoutData).image2Caption || ''}
              onChange={(e) => onFormChange('image2Caption', e.target.value)}
              placeholder="사진2 설명 (우측 하단 라벨)"
              className="text-sm"
            />
          </div>
          {showProfileGallery && (
            <div className="mt-2 p-2 border rounded-lg space-y-2 max-h-48 overflow-y-auto bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">프로필 갤러리에서 {selectingForField === 'image1' ? '사진1' : '사진2'} 선택</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowProfileGallery(false)}>닫기</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {profileImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleProfileSelect(img.url || '')}
                    className="border rounded overflow-hidden hover:ring-2 ring-blue-500"
                  >
                    {img.url ? <img src={img.url} alt={img.name} className="w-full aspect-square object-cover" /> : <span className="text-xs p-2 block">이미지 없음</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}