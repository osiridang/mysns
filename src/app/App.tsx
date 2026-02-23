import { useState, useRef, useEffect } from 'react';
import { TemplateSelector } from '@/app/components/TemplateSelector';
import { EditorPanel } from '@/app/components/EditorPanel';
import { ProfileImageManager } from '@/app/components/ProfileImageManager';
import { BackgroundImageManager } from '@/app/components/BackgroundImageManager';
import { TextImageManager } from '@/app/components/TextImageManager';
import { LogoImageManager } from '@/app/components/LogoImageManager';
import { CopyrightImageManager } from '@/app/components/CopyrightImageManager';
import { publicAnonKey } from '@/config/supabase';
import { Toaster, toast } from 'sonner';
import { HorizontalCardTemplate } from '@/app/components/HorizontalCardTemplate';
import { QuadLayoutTemplate } from '@/app/components/QuadLayoutTemplate';
import { VerticalListCardTemplate } from '@/app/components/VerticalListCardTemplate';
import { VerticalCardTemplate } from '@/app/components/VerticalCardTemplate';
import { SquareLayoutTemplate } from '@/app/components/SquareLayoutTemplate';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent } from '@/app/components/ui/sheet';
import { Download, Menu, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { TemplateType, TemplateData, HorizontalCardData, CopyrightArea } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { DEFAULT_TEMPLATE_DATA, DEFAULT_COPYRIGHT_AREA } from '@/data/defaultTemplate';
import { appDefaultsApi, checkSupabaseConnection } from '@/utils/api';
import { useTemplateScale } from '@/app/hooks/useTemplateScale';
import { NAV_TABS, type MenuTab } from '@/app/config/navTabs';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 기본값은 코드 고정. localStorage와 병합할 때 저장된 값이 비어 있으면 기본값 유지(바꾼 값 되돌리지 않음).
  const loadSavedData = (): TemplateData => {
    const isEmpty = (v: unknown): boolean =>
      v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
    const hasValue = (v: unknown): boolean => !isEmpty(v);
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE_DATA);
      if (!saved) return { ...DEFAULT_TEMPLATE_DATA };
      const parsedData = JSON.parse(saved) as Partial<TemplateData>;
      const result = { ...DEFAULT_TEMPLATE_DATA };
      (Object.keys(result) as TemplateType[]).forEach((key) => {
        if (!parsedData[key] || typeof parsedData[key] !== 'object') return;
        const defBlock = result[key] as Record<string, unknown>;
        const savedBlock = parsedData[key] as Record<string, unknown>;
        const merged = { ...defBlock };
        Object.keys(savedBlock).forEach((field) => {
          const sVal = savedBlock[field];
          const dVal = defBlock[field];
          if (isEmpty(sVal) && hasValue(dVal)) merged[field] = dVal;
          else if (sVal !== undefined) merged[field] = sVal;
        });
        if (key === 'horizontal-card') {
            const h = merged as any;
            if (h.bodyText && (!h.items || h.items.length === 0)) {
              h.items = [h.bodyText];
              h.iconNames = ['Zap', 'Sprout', 'Globe', 'TrendingUp'];
            }
            delete h.bodyText;
          }
        // 기본 로고(LOGO_white.png) 고정: 브라우저/저장값이 빈 경우 항상 기본 로고 유지
        if ('logoUrl' in merged && !(merged as any).logoUrl?.trim()) {
          (merged as any).logoUrl = (DEFAULT_TEMPLATE_DATA[key] as any).logoUrl ?? defBlock.logoUrl;
        }
        // 저장된 문구 마이그레이션: 양보 → 안보 (데이터 자체를 수정)
        const fixYangbo = (s: unknown): unknown => {
          if (typeof s !== 'string' || !s.includes('양보')) return s;
          return s.replace(/양보/g, '안보');
        };
        if (Array.isArray(merged.items)) {
          (merged as any).items = (merged as any).items.map((item: string) => fixYangbo(item));
        }
        if (Array.isArray((merged as any).headlines)) {
          (merged as any).headlines = (merged as any).headlines.map((h: { text?: string; color?: string }) =>
            h && typeof h.text === 'string' ? { ...h, text: fixYangbo(h.text) as string } : h
          );
        }
        if (Array.isArray((merged as any).bodyTexts)) {
          (merged as any).bodyTexts = (merged as any).bodyTexts.map((item: string) => fixYangbo(item));
        }
        if (Array.isArray((merged as any).itemDetails)) {
          (merged as any).itemDetails = (merged as any).itemDetails.map((row: string[]) =>
            Array.isArray(row) ? row.map((cell) => fixYangbo(cell)) : row
          );
        }
        // 카피라이트: 단일 텍스트/이미지 → 3단 영역 마이그레이션
        const defCopyright = (DEFAULT_TEMPLATE_DATA[key] as any).copyrightArea;
        (merged as any).copyrightArea = (merged as any).copyrightArea ?? defCopyright;
        delete (merged as any).copyrightText;
        delete (merged as any).copyrightUrl;
        result[key] = merged as TemplateData[TemplateType];
      });
      // 수정된 데이터를 localStorage에 다시 저장 (DB 정리 → 다음부터는 안보만 로드됨)
      try {
        localStorage.setItem(STORAGE_KEYS.TEMPLATE_DATA, JSON.stringify(result));
      } catch (_) {}
      return result;
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
    return { ...DEFAULT_TEMPLATE_DATA };
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
  
  // 현재 선택된 템플릿의 데이터 (기본값과 병합해 누락된 필드 없이 미리보기/편집에 사용)
  const formData = (() => {
    const def = DEFAULT_TEMPLATE_DATA[selectedTemplate] as Record<string, unknown>;
    const cur = templateData[selectedTemplate] as Record<string, unknown> | undefined;
    if (!cur || typeof cur !== 'object') return def as TemplateData[TemplateType];
    return { ...def, ...cur } as TemplateData[TemplateType];
  })();

  const templateRef = useRef<HTMLDivElement>(null);
  const { scale, containerPadding } = useTemplateScale(containerRef, selectedTemplate);

  const effectiveAccessToken = publicAnonKey;

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

  // 개발 시 Supabase 연결 여부 콘솔에 출력
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    checkSupabaseConnection().then(({ ok, message }) => {
      if (ok) console.log('[Supabase]', message);
      else console.warn('[Supabase 연결 실패]', message);
    });
  }, []);

  // 서버에 저장된 앱 기본값 로드 (다른 브라우저에서도 동일한 값 표시)
  // 규칙: 서버 값으로 덮되, 서버가 빈 값이면 현재(로컬) 값을 유지 → 바꾼 기본값 되돌리지 않음
  useEffect(() => {
    let cancelled = false;
    appDefaultsApi.get()
      .then((res: any) => {
        if (cancelled || !res || typeof res !== 'object') return;
        const { templateData: serverTemplateData, appTitle: serverTitle, appSubtitle: serverSubtitle, selectedTemplate: serverTemplate } = res;

        const isEmpty = (v: unknown): boolean =>
          v === undefined || v === null ||
          (typeof v === 'string' && !v.trim()) ||
          (Array.isArray(v) && v.length === 0);
        const hasValue = (v: unknown): boolean => !isEmpty(v);

        setTemplateData((prev) => {
          if (!serverTemplateData || typeof serverTemplateData !== 'object' || Object.keys(serverTemplateData).length === 0) return prev;
          const result = { ...prev } as TemplateData;
          (Object.keys(serverTemplateData) as TemplateType[]).forEach((key) => {
            const serverBlock = serverTemplateData[key];
            if (!serverBlock || typeof serverBlock !== 'object') return;
            const currentBlock = (result[key] ?? {}) as Record<string, unknown>;
            const merged = { ...currentBlock };
            Object.keys(serverBlock).forEach((field) => {
              const sVal = serverBlock[field];
              const cVal = currentBlock[field];
              if (isEmpty(sVal) && hasValue(cVal)) {
                merged[field] = cVal;
              } else if (sVal !== undefined) {
                merged[field] = sVal;
              }
            });
            if (key === 'horizontal-card') {
              const h = merged as any;
              if (h.bodyText && (!h.items || h.items.length === 0)) {
                h.items = [h.bodyText];
                h.iconNames = h.iconNames ?? ['Zap', 'Sprout', 'Globe', 'TrendingUp'];
              }
              delete h.bodyText;
            }
        // 기본 로고(LOGO_white.png) 고정: 빈 값이면 코드 기본값으로 복원
            const defLogo = (DEFAULT_TEMPLATE_DATA[key] as any)?.logoUrl;
            if (defLogo && !(merged as any).logoUrl?.trim()) (merged as any).logoUrl = defLogo;
        // 저장된 문구 마이그레이션: 양보 → 안보 (반드시 안보로 통일)
        const fixYangbo = (s: unknown): unknown => {
          if (typeof s !== 'string' || !s.includes('양보')) return s;
          return s.replace(/양보/g, '안보');
        };
        if (Array.isArray(merged.items)) {
          (merged as any).items = (merged as any).items.map((item: string) => fixYangbo(item));
        }
        if (Array.isArray((merged as any).headlines)) {
          (merged as any).headlines = (merged as any).headlines.map((h: { text?: string; color?: string }) =>
            h && typeof h.text === 'string' ? { ...h, text: fixYangbo(h.text) as string } : h
          );
        }
        if (Array.isArray((merged as any).bodyTexts)) {
          (merged as any).bodyTexts = (merged as any).bodyTexts.map((item: string) => fixYangbo(item));
        }
        if (Array.isArray((merged as any).itemDetails)) {
          (merged as any).itemDetails = (merged as any).itemDetails.map((row: string[]) =>
            Array.isArray(row) ? row.map((cell) => fixYangbo(cell)) : row
          );
        }
        const defCopyright = (DEFAULT_TEMPLATE_DATA[key] as any).copyrightArea;
        (merged as any).copyrightArea = (merged as any).copyrightArea ?? defCopyright;
        delete (merged as any).copyrightText;
        delete (merged as any).copyrightUrl;
            result[key] = merged as TemplateData[TemplateType];
      });
      return result;
        });

        if (typeof serverTitle === 'string' && serverTitle.trim() !== '') setAppTitle(serverTitle.trim());
        if (typeof serverSubtitle === 'string') setAppSubtitle(serverSubtitle);
        if (typeof serverTemplate === 'string' && ['horizontal-card', 'quad-layout', 'vertical-list-card', 'vertical-card', 'square-layout'].includes(serverTemplate)) {
          setSelectedTemplate(serverTemplate as TemplateType);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setTemplateData(prev => {
      const def = DEFAULT_TEMPLATE_DATA[selectedTemplate] as Record<string, unknown>;
      const cur = prev[selectedTemplate] as Record<string, unknown> | undefined;
      const base = (cur && typeof cur === 'object') ? { ...def, ...cur } : { ...def };
      return {
        ...prev,
        [selectedTemplate]: { ...base, [field]: value } as TemplateData[TemplateType]
      };
    });
  };

  /** 하단 문구(카피라이트)는 모든 템플릿에 동일 적용 - 3단 텍스트 */
  const handleCopyrightChange = (partial: Partial<CopyrightArea>) => {
    setTemplateData(prev => {
      const next = { ...prev };
      (Object.keys(next) as TemplateType[]).forEach((key) => {
        const current = (next[key] as any)?.copyrightArea ?? DEFAULT_COPYRIGHT_AREA;
        next[key] = { ...next[key], copyrightArea: { ...current, ...partial } } as TemplateData[TemplateType];
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
        copyrightArea: metadata.copyrightArea ?? prev[metadata.template]?.copyrightArea ?? DEFAULT_COPYRIGHT_AREA
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

  const renderTemplate = () => {
    // Use selected profile image or custom imageUrl
    const finalImageUrl = formData.imageUrl;
    const backgroundImageUrl = formData.backgroundImageUrl;
    const textImageUrls = formData.textImageUrls;
    const logoUrl = formData.logoUrl;
    const copyrightArea = (formData as any).copyrightArea ?? DEFAULT_COPYRIGHT_AREA;

    switch (selectedTemplate) {
      case 'horizontal-card':
        return (
          <HorizontalCardTemplate
            ref={templateRef}
            headline1={formData.headline1}
            headline2={formData.headline2}
            headline1Color={(formData as HorizontalCardData).headline1Color}
            headline2Color={(formData as HorizontalCardData).headline2Color}
            subheadline={formData.subheadline}
            items={formData.items}
            iconNames={formData.iconNames}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            copyrightArea={copyrightArea}
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
            copyrightArea={copyrightArea}
          />
        );
      case 'vertical-list-card': {
        const vlHeadlines = Array.isArray(formData.headlines)
          ? formData.headlines
          : (DEFAULT_TEMPLATE_DATA['vertical-list-card'] as { headlines: { text: string; color: string }[] }).headlines;
        return (
          <VerticalListCardTemplate
            ref={templateRef}
            headlines={vlHeadlines}
            items={formData.items}
            bgColor={formData.bgColor}
            imageUrl={finalImageUrl}
            backgroundImageUrl={backgroundImageUrl}
            textImageUrls={textImageUrls}
            logoUrl={logoUrl}
            iconNames={formData.iconNames}
            copyrightArea={copyrightArea}
          />
        );
      }
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
            copyrightArea={copyrightArea}
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
            copyrightArea={copyrightArea}
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
            <Button onClick={handleDownload} size="sm" className="gap-2 flex-shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">다운로드</span>
            </Button>
          </div>
        </div>
        
        {/* GNB 메뉴 - 데스크톱 */}
        <div className="border-t hidden md:block">
          <nav className="flex overflow-x-auto">
            {NAV_TABS.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 md:px-6 py-2 md:py-3 flex items-center justify-center gap-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
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
                  copyrightArea={(formData as any).copyrightArea ?? DEFAULT_COPYRIGHT_AREA}
                  onCopyrightChange={handleCopyrightChange}
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
            <div
              className="template-canvas"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease'
              }}
            >
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
            {NAV_TABS.map(({ tab, label, icon: Icon }) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setDrawerOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
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
                  copyrightArea={(formData as any).copyrightArea ?? DEFAULT_COPYRIGHT_AREA}
                  onCopyrightChange={handleCopyrightChange}
                />
              </div>
            )}

          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}