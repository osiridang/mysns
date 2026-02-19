import { useState, useRef, useEffect } from 'react';
import { TemplateSelector } from '@/app/components/TemplateSelector';
import { EditorPanel } from '@/app/components/EditorPanel';
import { SavedImagesPanel } from '@/app/components/SavedImagesPanel';
import { SavedContentsPanel } from '@/app/components/SavedContentsPanel';
import { ProfileImageManager } from '@/app/components/ProfileImageManager';
import { BackgroundImageManager } from '@/app/components/BackgroundImageManager';
import { TextImageManager } from '@/app/components/TextImageManager';
import { LogoImageManager } from '@/app/components/LogoImageManager';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Toaster, toast } from 'sonner';
import { HorizontalCardTemplate } from '@/app/components/HorizontalCardTemplate';
import { QuadLayoutTemplate } from '@/app/components/QuadLayoutTemplate';
import { VerticalListCardTemplate } from '@/app/components/VerticalListCardTemplate';
import { VerticalCardTemplate } from '@/app/components/VerticalCardTemplate';
import { Button } from '@/app/components/ui/button';
import { Download, Share2, Save, Layout, Edit, ImageIcon, FolderOpen, Type, LogOut, Image as ImageIconLucide, Braces, BookmarkPlus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { LoginPage } from '@/app/components/LoginPage';
import { TemplateType, TemplateData } from '@/types';
import { DEFAULT_IMAGES, STORAGE_KEYS } from '@/constants';
import { authApi, imageApi } from '@/utils/api';

// 🚀 개발 모드: true로 설정하면 로그인 없이 바로 사용 가능
const DEV_MODE = true;

type MenuTab = 'template' | 'edit' | 'profile' | 'background' | 'textimage' | 'logo' | 'saved' | 'saved-contents';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 🚀 개발 모드일 때는 publicAnonKey 사용 (유효한 토큰)
  const effectiveAccessToken = DEV_MODE ? publicAnonKey : accessToken;

  // 기본 템플릿 데이터
  const DEFAULT_TEMPLATE_DATA: TemplateData = {
    'horizontal-card': {
      headline1: '미래는 이미',
      headline2: '우리 안에 있습니다',
      subheadline: '전북특별자치도지사 후보',
      bodyText: '전북의 미래를 위한 새로운 비전을 제시합니다.',
      bgColor: '#1e40af',
      imageUrl: DEFAULT_IMAGES.profile,
      backgroundImageUrl: '',
      textImageUrls: [DEFAULT_IMAGES.label] as string[],
      logoUrl: DEFAULT_IMAGES.logo,
    },
    'quad-layout': {
      headlines: [
        { text: '가장 강력한 전북', color: '#FFFFFF' },
        { text: '이원택과 더불어!', color: '#01FE05' }
      ],
      bgColor: '#1e40af',
      imageUrl: DEFAULT_IMAGES.profile,
      backgroundImageUrl: '',
      textImageUrls: [DEFAULT_IMAGES.label] as string[],
      logoUrl: DEFAULT_IMAGES.logo,
      items: [
        '탄소 제로의 심장, 새만금 국제에너지도시',
        '스마트 농생명, 미래 양보의 핵심',
        'K컬쳐 글로벌 허브',
        '지강 발전, 지역 도약 모델 창출'
      ],
      itemDetails: [
        ['해상풍력 에너지 선도', '그린수소 생산기지'],
        ['푸드테크 혁신 클러스터', '스마트팜 확대'],
        ['한류 콘텐츠 제작 허브', 'K-Pop 공연장 건립'],
        ['균형발전 특별법 제정', '지역 일자리 창출']
      ],
      iconNames: ['Zap', 'Sprout', 'Globe', 'TrendingUp']
    },
    'vertical-list-card': {
      headlines: [
        { text: '가장 강력한 전북', color: '#FFFFFF' },
        { text: '이원택과 더불어!', color: '#01FE05' }
      ],
      bgColor: '#1e40af',
      imageUrl: DEFAULT_IMAGES.profile,
      backgroundImageUrl: '',
      textImageUrls: [DEFAULT_IMAGES.label] as string[],
      logoUrl: DEFAULT_IMAGES.logo,
      items: [
        '탄소 제로의 심장, 새만금 국제에너지도시',
        '스마트 농생명, 미래 양보의 핵심',
        'K컬쳐 글로벌 허브',
        '지강 발전, 지역 도약 모델 창출'
      ],
      iconNames: ['Zap', 'Sprout', 'Globe', 'TrendingUp']
    },
    'vertical-card': {
      headline1: '미래는 이미',
      headline2: '우리 안에 있습니다',
      subheadline: '전북특별자치도지사 후보',
      bodyTexts: ['정책 1', '정책 2', '정책 3'],
      bgColor: '#1e40af',
      imageUrl: DEFAULT_IMAGES.profile,
      backgroundImageUrl: '',
      textImageUrls: [DEFAULT_IMAGES.label] as string[],
      logoUrl: DEFAULT_IMAGES.logo,
    }
  };

  // localStorage에서 저장된 데이터 불러오기
  const loadSavedData = (): TemplateData => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE_DATA);
      if (saved) {
        const parsedData = JSON.parse(saved);
        return {
          ...DEFAULT_TEMPLATE_DATA,
          ...parsedData
        };
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
    return DEFAULT_TEMPLATE_DATA;
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
  
  // 현재 선택된 템플릿의 데이터
  const formData = templateData[selectedTemplate];

  const templateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 템플릿 스케일 자동 조정 - 너비와 높이 모두 고려
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const templateWidth = 720;  // TEMPLATE_DIMENSIONS.width
        const templateHeight = 1200; // TEMPLATE_DIMENSIONS.height
        const padding = 96; // p-12 = 48px * 2 (양쪽)
        
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

  const handleLoadImage = (metadata: any) => {
    // Load template type
    if (metadata.template) {
      setSelectedTemplate(metadata.template as TemplateType);
    }
    
    // Load form data
    setTemplateData(prev => ({
      ...prev,
      [metadata.template]: {
        headline1: metadata.headline1 || '',
        headline2: metadata.headline2 || '',
        subheadline: metadata.subheadline || '',
        contactInfo: metadata.contactInfo || '',
        bodyText: metadata.bodyText || '',
        bodyTexts: metadata.bodyTexts || [],
        bgColor: metadata.bgColor || '#1e40af',
        imageUrl: metadata.imageUrl || '',
        backgroundImageUrl: metadata.backgroundImageUrl || '',
        textImageUrls: metadata.textImageUrls || [],
        logoUrl: metadata.logoUrl || '',
        items: metadata.items || [],
        itemDetails: metadata.itemDetails || [],
        iconNames: metadata.iconNames || []
      }
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

  const handleShare = async () => {
    if (!templateRef.current) return;

    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${selectedTemplate}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '카드뉴스',
          text: '전북특별자치도지사 후보 이원택'
        });
        toast.success('공유되었습니다!');
      } else {
        toast.info('이 브라우저는 공유 기능을 지원하지 않습니다. 다운로드를 이용해주세요.');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('공유에 실패했습니다.');
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
      if (selectedTemplate === 'horizontal-card') {
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
  const handleShowCurrentValues = () => {
    console.log('=== 현재 설정된 모든 값 ===');
    console.log('selectedTemplate:', selectedTemplate);
    console.log('templateData:', JSON.stringify(templateData, null, 2));
    toast.success('콘솔(F12)을 확인하세요!');
  };

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
    
    switch (selectedTemplate) {
      case 'horizontal-card':
        return (
          <HorizontalCardTemplate
            ref={templateRef}
            headline1={formData.headline1}
            headline2={formData.headline2}
            subheadline={formData.subheadline}
            bodyText={formData.bodyText}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{appTitle}</h1>
            <p className="text-xs text-gray-600">{appSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShowCurrentValues} variant="outline" size="sm" className="gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300">
              <Braces className="w-4 h-4" />
              현재값 확인
            </Button>
            <Button onClick={handleSaveContent} variant="outline" size="sm" className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
              <BookmarkPlus className="w-4 h-4" />
              내용 저장
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              공유
            </Button>
            <Button onClick={handleDownload} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              다운로드
            </Button>
            <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              저장
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>
        
        {/* GNB 메뉴 */}
        <div className="border-t">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'template'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layout className="w-4 h-4" />
              템플릿 선택
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4" />
              내용 편집
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              후보 얼굴 관리
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'background'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ImageIconLucide className="w-4 h-4" />
              배경 이미지 관리
            </button>
            <button
              onClick={() => setActiveTab('textimage')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'textimage'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Type className="w-4 h-4" />
              텍스트 이미지 관리
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'logo'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Braces className="w-4 h-4" />
              로고 이미지 관리
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              저장된 이미지
            </button>
            <button
              onClick={() => setActiveTab('saved-contents')}
              className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                activeTab === 'saved-contents'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              저장된 내용
            </button>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 min-h-0">
        {/* 왼쪽 사이드바 - 탭별 컨텐츠 표시 */}
        <aside className="w-80 bg-white border-r overflow-y-auto flex-shrink-0">
          <div className="p-4">
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
          className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-12 min-h-0"
        >
          <div className="shadow-2xl rounded-lg overflow-hidden">
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
    </div>
  );
}