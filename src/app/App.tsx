import { useState, useRef, useEffect } from 'react';
import { TemplateSelector } from '@/app/components/TemplateSelector';
import { EditorPanel } from '@/app/components/EditorPanel';
import { SavedImagesPanel } from '@/app/components/SavedImagesPanel';
import { SavedContentsPanel } from '@/app/components/SavedContentsPanel';
import { ProfileImageManager } from '@/app/components/ProfileImageManager';
import { BackgroundImageManager } from '@/app/components/BackgroundImageManager';
import { TextImageManager } from '@/app/components/TextImageManager';
import { LogoImageManager } from '@/app/components/LogoImageManager';
import { CopyrightImageManager } from '@/app/components/CopyrightImageManager';
import { projectId, publicAnonKey } from '@/config/supabase';
import { Toaster, toast } from 'sonner';
import { HorizontalCardTemplate } from '@/app/components/HorizontalCardTemplate';
import { QuadLayoutTemplate } from '@/app/components/QuadLayoutTemplate';
import { VerticalListCardTemplate } from '@/app/components/VerticalListCardTemplate';
import { VerticalCardTemplate } from '@/app/components/VerticalCardTemplate';
import { SquareLayoutTemplate } from '@/app/components/SquareLayoutTemplate';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent } from '@/app/components/ui/sheet';
import { Download, Save, Layout, Edit, ImageIcon, FolderOpen, Type, LogOut, Image as ImageIconLucide, Braces, BookmarkPlus, Menu, X, FileText, RotateCcw, Star } from 'lucide-react';
import { toPng } from 'html-to-image';
import { LoginPage } from '@/app/components/LoginPage';
import { TemplateType, TemplateData } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { DEFAULT_TEMPLATE_DATA } from '@/data/defaultTemplate';
import { authApi, imageApi } from '@/utils/api';

const DEV_MODE = true;

type MenuTab = 'template' | 'edit' | 'profile' | 'background' | 'textimage' | 'logo' | 'copyright' | 'saved' | 'saved-contents';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const effectiveAccessToken = DEV_MODE ? publicAnonKey : accessToken;

  // 사용자 지정 기본값(있으면) 또는 앱 기본값 반환
  const getBaseTemplateData = (): TemplateData => {
    try {
      const userDefault = localStorage.getItem(STORAGE_KEYS.USER_DEFAULT_TEMPLATE_DATA);
      if (userDefault) {
        const parsed = JSON.parse(userDefault) as TemplateData;
        return { ...DEFAULT_TEMPLATE_DATA, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse user default template data:', e);
    }
    return DEFAULT_TEMPLATE_DATA;
  };

  // localStorage에서 저장된 데이터 불러오기 (템플릿별로 기본값과 병합해 누락 필드 보정)
  const loadSavedData = (): TemplateData => {
    try {
      const base = getBaseTemplateData();
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE_DATA);
      if (saved) {
        const parsedData = JSON.parse(saved) as Partial<TemplateData>;
        const result = { ...base };
        (Object.keys(result) as TemplateType[]).forEach((key) => {
          if (parsedData[key] && typeof parsedData[key] === 'object') {
            const merged = { ...result[key], ...parsedData[key] } as TemplateData[TemplateType];
            // 1번 템플릿: 예전 bodyText → items 마이그레이션
            if (key === 'horizontal-card') {
              const h = merged as any;
              if (h.bodyText && (!h.items || h.items.length === 0)) {
                h.items = [h.bodyText];
                h.iconNames = ['Zap', 'Sprout', 'Globe', 'TrendingUp'];
              }
              delete h.bodyText;
            }
            result[key] = merged;
          }
        });
        return result;
      }
      return base;
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
    return getBaseTemplateData();
  };

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE);
    return (saved as TemplateType) || 'horizontal-card';
  });
  const [activeTab, setActiveTab] = useState<MenuTab>('template');
  
  // 앱 제목 관리
  const [appTitle, setAppTitle] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_TITLE);
    return saved || '정치 홍보물 디자인 도구';
  });
  const [appSubtitle, setAppSubtitle] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_SUBTITLE);
    return saved || '이원택 후보님 선거 홍보 카드뉴스 제작';
  });
  
  // 각 템플릿별로 독립적인 데이터 관리
  const [templateData, setTemplateData] = useState(loadSavedData());
  
  // 현재 선택된 템플릿의 데이터 (탭 이동 시 undefined 방지)
  const formData = templateData[selectedTemplate] ?? DEFAULT_TEMPLATE_DATA[selectedTemplate];

  const templateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerPadding, setContainerPadding] = useState(0);

  // 템플릿 스케일 자동 조정 - 너비와 높이 모두 고려 (% 기반 동적 패딩)
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const templateWidth = 720;  // TEMPLATE_DIMENSIONS.width
        const templateHeight = 1200; // TEMPLATE_DIMENSIONS.height

        // 화면 크기별 동적 패딩 계산 (% 기반)
        let paddingPercent = 0.02; // 기본값: 2% (매우 작음)
        if (containerWidth >= 1024) {
          paddingPercent = 0.06; // 데스크톱: 6%
        } else if (containerWidth >= 768) {
          paddingPercent = 0.04; // 태블릿: 4%
        } else if (containerWidth >= 640) {
          paddingPercent = 0.03; // 소형: 3%
        }

        // 실제 패딩값 (% 계산)
        let padding = Math.max(
          containerWidth * paddingPercent,
          containerHeight * paddingPercent
        );

        // 상단 패딩은 매우 작게 (1/4으로)
        const topPadding = padding * 0.15;

        // 패딩을 상태에 저장 (상단은 별도로)
        setContainerPadding(topPadding);

        // 가용 공간 계산
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;

        // 너비와 높이 기준 스케일 중 더 작은 값 선택 (템플릿 전체가 보이도록)
        const scaleByWidth = availableWidth / templateWidth;
        const scaleByHeight = availableHeight / templateHeight;
        const newScale = Math.min(scaleByWidth, scaleByHeight, 1); // 최대 1 (확대 방지)

        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    // 템플릿이 변경될 때도 스케일 재계산
    const timer = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [selectedTemplate]);

  // 🔄 템플릿 데이터가 변경될 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_DATA, JSON.stringify(templateData));
    } catch (error) {
      console.error('Failed to save template data:', error);
    }
  }, [templateData]);

  // 🔄 선택된 템플릿이 변경될 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEMPLATE, selectedTemplate);
    } catch (error) {
      console.error('Failed to save selected template:', error);
    }
  }, [selectedTemplate]);

  // 🔄 앱 제목이 변경될 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_TITLE, appTitle);
    } catch (error) {
      console.error('Failed to save app title:', error);
    }
  }, [appTitle]);

  // 🔄 앱 부제목이 변경될 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SUBTITLE, appSubtitle);
    } catch (error) {
      console.error('Failed to save app subtitle:', error);
    }
  }, [appSubtitle]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (storedToken) {
        try {
          await authApi.verifySession(storedToken);
          setAccessToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.login(email, password);
      if (data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
        toast.success('로그인 성공!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    setAccessToken('');
    setIsAuthenticated(false);
    toast.info('로그아웃되었습니다.');
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated && !DEV_MODE) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  const handleFormChange = (field: string, value: any) => {
    setTemplateData(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [field]: value
      }
    }));
  };

  const handleResetToDefaults = () => {
    const base = getBaseTemplateData();
    setTemplateData(JSON.parse(JSON.stringify(base)));
    toast.success('모든 템플릿이 기본값으로 초기화되었습니다.');
  };

  /** 현재 설정(본문, 썸네일, 라벨 등)을 기본값으로 저장 → 이후 '기본값 초기화' 시 이 값으로 복원 */
  const handleSaveAsDefault = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DEFAULT_TEMPLATE_DATA, JSON.stringify(templateData));
      toast.success('현재 설정이 기본값으로 저장되었습니다. 앞으로 기본값 초기화 시 이 내용이 적용됩니다.');
    } catch (error) {
      console.error('Failed to save as default:', error);
      toast.error('기본값 저장에 실패했습니다.');
    }
  };

  /** 하단 문구(카피라이트)는 모든 템플릿에 동일 적용 */
  const handleCopyrightChange = (url: string) => {
    setTemplateData(prev => {
      const next = { ...prev };
      (Object.keys(next) as TemplateType[]).forEach((key) => {
        next[key] = { ...next[key], copyrightUrl: url };
      });
      return next;
    });
  };

  const handleLoadImage = (metadata: any) => {
    // Load template type
    if (metadata.template) {
      setSelectedTemplate(metadata.template as TemplateType);
    }
    
    // Load form data
    setTemplateData(prev => ({
      ...prev,
      [metadata.template]: {
        ...prev[metadata.template as TemplateType],
        headline1: metadata.headline1 ?? prev[metadata.template]?.headline1 ?? '',
        headline2: metadata.headline2 ?? prev[metadata.template]?.headline2 ?? '',
        subheadline: metadata.subheadline ?? prev[metadata.template]?.subheadline ?? '',
        contactInfo: metadata.contactInfo ?? '',
        bodyTexts: metadata.bodyTexts ?? prev[metadata.template]?.bodyTexts ?? [],
        bgColor: metadata.bgColor ?? prev[metadata.template]?.bgColor ?? '#2A48A0',
        imageUrl: metadata.imageUrl ?? prev[metadata.template]?.imageUrl ?? '',
        backgroundImageUrl: metadata.backgroundImageUrl ?? prev[metadata.template]?.backgroundImageUrl ?? '',
        textImageUrls: metadata.textImageUrls ?? prev[metadata.template]?.textImageUrls ?? [],
        logoUrl: metadata.logoUrl ?? prev[metadata.template]?.logoUrl ?? '',
        items: metadata.items ?? (metadata.bodyText ? [metadata.bodyText] : prev[metadata.template]?.items ?? []),
        itemDetails: metadata.itemDetails ?? prev[metadata.template]?.itemDetails ?? [],
        iconNames: metadata.iconNames ?? prev[metadata.template]?.iconNames ?? ['Zap', 'Sprout', 'Globe', 'TrendingUp'],
        copyrightUrl: metadata.copyrightUrl ?? prev[metadata.template]?.copyrightUrl ?? ''
      } as TemplateData[TemplateType]
    }));
  };

  const handleDownload = async () => {
    if (!templateRef.current) return;

    try {
      toast.loading('이미지를 생성하고 있습니다...');
      
      const dataUrl = await toPng(templateRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${selectedTemplate}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast.dismiss();
      toast.success('이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.dismiss();
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSave = async () => {
    if (!templateRef.current) return;

    try {
      toast.loading('이미지를 저장하고 있습니다...');
      
      const dataUrl = await toPng(templateRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Save to server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da/save-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: dataUrl,
          metadata: {
            template: selectedTemplate,
            ...formData,
            createdAt: new Date().toISOString(),
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save image');
      }

      const result = await response.json();
      console.log('Image saved:', result);

      toast.dismiss();
      toast.success('이미지가 서버에 저장되었습니다!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.dismiss();
      toast.error(`저장에 실패했습니다: ${error.message}`);
    }
  };

  const handleSaveContent = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CONTENTS);
      const savedContents = saved ? JSON.parse(saved) : [];

      let title = '';
      if (selectedTemplate === 'horizontal-card' || selectedTemplate === 'square-layout') {
        title = (formData as any).headline1 || '제목 없음';
      } else if (selectedTemplate === 'quad-layout' || selectedTemplate === 'vertical-list-card') {
        title = (formData as any).headlines?.[0]?.text || '제목 없음';
      }

      const newContent = {
        id: `content-${Date.now()}`,
        templateType: selectedTemplate,
        data: { ...formData },
        timestamp: Date.now(),
        title: title
      };

      const updatedContents = [newContent, ...savedContents];
      localStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(updatedContents));

      toast.success('현재 내용이 저장되었습니다!');
    } catch (error) {
      console.error('Save content failed:', error);
      toast.error('내용 저장에 실패했습니다.');
    }
  };

  // 🔧 디버그: 현재 설정값 콘솔에 출력
  const handleLoadContent = (content: any) => {
    // Switch to the saved template type
    setSelectedTemplate(content.templateType);

    // Load the saved data
    setTemplateData(prev => ({
      ...prev,
      [content.templateType]: {
        ...content.data
      }
    }));

    // Switch to edit tab
    setActiveTab('edit');
  };

  const renderTemplate = () => {
    // Use selected profile image or custom imageUrl
    const finalImageUrl = formData.imageUrl;
    const backgroundImageUrl = formData.backgroundImageUrl;
    const textImageUrls = formData.textImageUrls;
    const logoUrl = formData.logoUrl;
    const copyrightUrl = formData.copyrightUrl && String(formData.copyrightUrl).trim() ? formData.copyrightUrl : '';
    
    switch (selectedTemplate) {
      case 'horizontal-card':
        return (
          <HorizontalCardTemplate
            ref={templateRef}
            headline1={formData.headline1}
            headline2={formData.headline2}
            subheadline={formData.subheadline}
            items={formData.items}
            iconNames={formData.iconNames}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            copyrightUrl={copyrightUrl}
          />
        );
      case 'quad-layout':
        return (
          <QuadLayoutTemplate
            ref={templateRef}
            headlines={formData.headlines}
            items={formData.items}
            itemDetails={formData.itemDetails}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            iconNames={formData.iconNames}
            copyrightUrl={copyrightUrl}
          />
        );
      case 'vertical-list-card':
        return (
          <VerticalListCardTemplate
            ref={templateRef}
            headlines={formData.headlines || [
              { text: formData.headline1 || '', color: '#FFFFFF' },
              { text: formData.headline2 || '', color: '#01FE05' }
            ]}
            items={formData.items}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            iconNames={formData.iconNames}
            copyrightUrl={copyrightUrl}
          />
        );
      case 'square-layout':
        return (
          <SquareLayoutTemplate
            ref={templateRef}
            headline1={formData.headline1}
            headline2={formData.headline2}
            headline1Color={formData.headline1Color}
            headline2Color={formData.headline2Color}
            bodyText={formData.bodyText}
            image1={formData.image1}
            image2={formData.image2}
            image1Caption={formData.image1Caption}
            image2Caption={formData.image2Caption}
            bgColor={formData.bgColor}
            logoUrl={formData.logoUrl}
            copyrightUrl={copyrightUrl}
          />
        );
      case 'vertical-card':
        return (
          <VerticalCardTemplate
            ref={templateRef}
            headline1={formData.headline1}
            headline2={formData.headline2}
            subheadline={formData.subheadline}
            bodyTexts={formData.bodyTexts || ['정책 1', '정책 2', '정책 3']}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            copyrightUrl={copyrightUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Toaster position="top-center" />
      
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setDrawerOpen(true)}
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">{appTitle}</h1>
              <p className="text-xs text-gray-600 hidden sm:block">{appSubtitle}</p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2 overflow-x-auto">
            <Button onClick={handleSaveAsDefault} variant="outline" size="sm" className="hidden sm:flex gap-2 text-blue-700 border-blue-300 hover:bg-blue-50 flex-shrink-0">
              <Star className="w-4 h-4" />
              <span className="hidden md:inline">현재 값을 기본값으로</span>
            </Button>
            <Button onClick={handleResetToDefaults} variant="outline" size="sm" className="hidden sm:flex gap-2 text-amber-700 border-amber-300 hover:bg-amber-50 flex-shrink-0">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">기본값 초기화</span>
            </Button>
            <Button onClick={handleSaveContent} variant="outline" size="sm" className="hidden sm:flex gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 flex-shrink-0">
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden md:inline">내용 저장</span>
            </Button>
            <Button onClick={handleDownload} size="sm" className="gap-2 flex-shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">다운로드</span>
            </Button>
            <Button onClick={handleSave} variant="outline" size="sm" className="hidden sm:flex gap-2 flex-shrink-0">
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">저장</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:flex gap-2 flex-shrink-0">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">로그아웃</span>
            </Button>
          </div>
        </div>
        
        {/* GNB 메뉴 - 데스크톱 */}
        <div className="border-t hidden md:block">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'template'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span className="hidden md:inline">템플릿 선택</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span className="hidden md:inline">내용 편집</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden lg:inline">후보 얼굴 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'background'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIconLucide className="w-4 h-4" />
              <span className="hidden lg:inline">배경 이미지</span>
            </button>
            <button
              onClick={() => setActiveTab('textimage')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'textimage'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Type className="w-4 h-4" />
              <span className="hidden lg:inline">텍스트 이미지</span>
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'logo'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Braces className="w-4 h-4" />
              <span className="hidden lg:inline">로고 이미지</span>
            </button>
            <button
              onClick={() => setActiveTab('copyright')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'copyright'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">하단 문구</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden lg:inline">저장된 이미지</span>
            </button>
            <button
              onClick={() => setActiveTab('saved-contents')}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'saved-contents'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden lg:inline">저장된 내용</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* 왼쪽 사이드바 - 데스크톱만 표시 */}
        <aside className="hidden md:flex md:w-80 bg-white border-r overflow-y-auto flex-shrink-0">
          <div className="p-4 w-full">
            {activeTab === 'template' && (
              <div>
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                />
              </div>
            )}

            {activeTab === 'edit' && (
              <div>
                <EditorPanel
                  templateType={selectedTemplate}
                  formData={formData}
                  onFormChange={handleFormChange}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <ProfileImageManager
                  selectedImageUrl={formData.imageUrl}
                  onSelectImage={(url) => handleFormChange('imageUrl', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'background' && (
              <div>
                <BackgroundImageManager
                  selectedImageUrl={formData.backgroundImageUrl}
                  onSelectImage={(url) => handleFormChange('backgroundImageUrl', url)}
                  accessToken={effectiveAccessToken}
                  bgColor={formData.bgColor}
                  onColorChange={(color) => handleFormChange('bgColor', color)}
                />
              </div>
            )}

            {activeTab === 'textimage' && (
              <div>
                <TextImageManager
                  selectedImageUrl={formData.textImageUrls}
                  onSelectImage={(url) => handleFormChange('textImageUrls', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'logo' && (
              <div>
                <LogoImageManager
                  selectedImageUrl={formData.logoUrl}
                  onSelectImage={(url) => handleFormChange('logoUrl', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'copyright' && (
              <div>
                <CopyrightImageManager
                  selectedImageUrl={formData.copyrightUrl ?? ''}
                  onSelectImage={handleCopyrightChange}
                />
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <SavedImagesPanel
                  onLoadImage={handleLoadImage}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'saved-contents' && (
              <div>
                <SavedContentsPanel
                  onLoadContent={handleLoadContent}
                />
              </div>
            )}
          </div>
        </aside>

        {/* 오른쪽 메인 캔버스 영역 */}
        <main
          ref={containerRef}
          className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center min-h-0 overflow-auto"
          style={{
            paddingTop: `${containerPadding}px`,
            paddingLeft: `${containerPadding * 2}px`,
            paddingRight: `${containerPadding * 2}px`,
            paddingBottom: `${containerPadding * 2}px`
          }}
        >
          <div className="shadow-2xl rounded-lg overflow-hidden flex-shrink-0">
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease'
            }}>
              {renderTemplate()}
            </div>
          </div>
        </main>
      </div>

      {/* 모바일 사이드바 드로어 */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          {/* 드로어 헤더 */}
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">메뉴</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 드로어 GNB 메뉴 */}
          <nav className="border-b divide-y">
            <button
              onClick={() => {
                setActiveTab('template');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'template'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layout className="w-4 h-4" />
              템플릿 선택
            </button>
            <button
              onClick={() => {
                setActiveTab('edit');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              내용 편집
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              후보 얼굴 관리
            </button>
            <button
              onClick={() => {
                setActiveTab('background');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'background'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIconLucide className="w-4 h-4" />
              배경 이미지 관리
            </button>
            <button
              onClick={() => {
                setActiveTab('textimage');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'textimage'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Type className="w-4 h-4" />
              텍스트 이미지 관리
            </button>
            <button
              onClick={() => {
                setActiveTab('logo');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'logo'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Braces className="w-4 h-4" />
              로고 이미지 관리
            </button>
            <button
              onClick={() => {
                setActiveTab('copyright');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'copyright'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              하단 문구
            </button>
            <button
              onClick={() => {
                setActiveTab('saved');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              저장된 이미지
            </button>
            <button
              onClick={() => {
                setActiveTab('saved-contents');
                setDrawerOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === 'saved-contents'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              저장된 내용
            </button>
          </nav>

          {/* 드로어 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'template' && (
              <div>
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                />
              </div>
            )}

            {activeTab === 'edit' && (
              <div>
                <EditorPanel
                  templateType={selectedTemplate}
                  formData={formData}
                  onFormChange={handleFormChange}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <ProfileImageManager
                  selectedImageUrl={formData.imageUrl}
                  onSelectImage={(url) => handleFormChange('imageUrl', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'background' && (
              <div>
                <BackgroundImageManager
                  selectedImageUrl={formData.backgroundImageUrl}
                  onSelectImage={(url) => handleFormChange('backgroundImageUrl', url)}
                  accessToken={effectiveAccessToken}
                  bgColor={formData.bgColor}
                  onColorChange={(color) => handleFormChange('bgColor', color)}
                />
              </div>
            )}

            {activeTab === 'textimage' && (
              <div>
                <TextImageManager
                  selectedImageUrl={formData.textImageUrls}
                  onSelectImage={(url) => handleFormChange('textImageUrls', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'logo' && (
              <div>
                <LogoImageManager
                  selectedImageUrl={formData.logoUrl}
                  onSelectImage={(url) => handleFormChange('logoUrl', url)}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'copyright' && (
              <div>
                <CopyrightImageManager
                  selectedImageUrl={formData.copyrightUrl ?? ''}
                  onSelectImage={handleCopyrightChange}
                />
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <SavedImagesPanel
                  onLoadImage={handleLoadImage}
                  accessToken={effectiveAccessToken}
                />
              </div>
            )}

            {activeTab === 'saved-contents' && (
              <div>
                <SavedContentsPanel
                  onLoadContent={handleLoadContent}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}