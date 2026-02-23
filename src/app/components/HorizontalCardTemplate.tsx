import { forwardRef, useRef, useEffect } from 'react';
import { Zap, Sprout, Globe, TrendingUp, Heart, Star, Users, Target, Lightbulb, Award, LucideIcon } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CopyrightBanner } from './CopyrightBanner';
import { DEFAULT_IMAGES, getTemplateDimensions } from '@/constants';

const TITLE_BASE_SIZE = 72;
const TITLE_MIN_SIZE = 24;
const TITLE_STEP = 4;

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Sprout,
  Globe,
  TrendingUp,
  Heart,
  Star,
  Users,
  Target,
  Lightbulb,
  Award,
};

interface HorizontalCardTemplateProps {
  headline1: string;
  headline2: string;
  headline1Color?: string;
  headline2Color?: string;
  subheadline: string;
  items?: string[];
  iconNames?: string[];
  bgColor: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  textImageUrls?: string[];
  logoUrl?: string;
  copyrightArea?: import('@/types').CopyrightArea;
}

export const HorizontalCardTemplate = forwardRef<HTMLDivElement, HorizontalCardTemplateProps>(
  ({ headline1, headline2, headline1Color = '#FFFFFF', headline2Color = '#FFFFFF', subheadline, items = [], iconNames = [], bgColor, imageUrl, backgroundImageUrl, textImageUrls = [], logoUrl, copyrightArea }, ref) => {
    const title1Ref = useRef<HTMLHeadingElement>(null);
    const title2Ref = useRef<HTMLHeadingElement>(null);

    const shrinkToFit = (el: HTMLHeadingElement | null, maxLines = 2) => {
      if (!el) return;
      let size = TITLE_BASE_SIZE;
      const lineHeight = 1.2;

      const measure = () => {
        el.style.fontSize = `${size}px`;
        const maxHeight = size * lineHeight * maxLines;
        if (el.scrollHeight > maxHeight + 2 && size > TITLE_MIN_SIZE) {
          size -= TITLE_STEP;
          requestAnimationFrame(measure);
        }
      };
      requestAnimationFrame(measure);
    };

    useEffect(() => {
      const raf = requestAnimationFrame(() => {
        shrinkToFit(title1Ref.current);
        shrinkToFit(title2Ref.current);
      });
      return () => cancelAnimationFrame(raf);
    }, [headline1, headline2]);

    return (
      <div
        ref={ref}
        className="relative overflow-hidden flex flex-col"
        style={{
          width: `${getTemplateDimensions('horizontal-card').width}px`,
          height: `${getTemplateDimensions('horizontal-card').height}px`,
          backgroundImage: backgroundImageUrl 
            ? `url(${backgroundImageUrl})` 
            : `linear-gradient(135deg, ${bgColor} 0%, #1e3a8a 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 후보 이미지: 하단 우측, 리스트 앞에 표시(z-20) - 가려지지 않게 */}
        <div
          className="absolute right-0 bottom-0 z-20 flex items-end justify-end pointer-events-none"
          style={{ width: '75%', height: '78%', transform: 'translateX(56px)' }}
        >
          <div className="w-full max-w-[95%] h-full flex items-end justify-end pr-0">
            <ImageWithFallback
              src={imageUrl || DEFAULT_IMAGES.profile}
              alt="이원택 후보"
              className="max-h-full w-auto object-contain object-bottom drop-shadow-2xl"
              style={{ objectPosition: 'right bottom' }}
            />
          </div>
        </div>

        {/* 텍스트 콘텐츠: 위에 겹치도록 z-10, 하단 패딩으로 이미지와 살짝 겹침 */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0 px-8 pt-6 pb-24">
          {/* 로고 - 상단 */}
          <div className="flex-shrink-0 w-24 h-24 mb-4">
            <ImageWithFallback
              src={logoUrl || DEFAULT_IMAGES.logo}
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          {/* 타이틀1 */}
          <h2
            ref={title1Ref}
            className="leading-tight flex-shrink-0"
            style={{
              fontFamily: 'GmarketSansBold, sans-serif',
              fontWeight: 800,
              fontSize: `${TITLE_BASE_SIZE}px`,
              lineHeight: '80px',
              color: headline1Color,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '-0.05em',
            }}
          >
            {headline1 || '정책 제목'}
          </h2>
          {/* 타이틀2 */}
          <h2
            ref={title2Ref}
            className="leading-tight flex-shrink-0 mt-1"
            style={{
              fontFamily: 'GmarketSansBold, sans-serif',
              fontWeight: 800,
              fontSize: `${TITLE_BASE_SIZE}px`,
              color: headline2Color,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '-0.05em',
            }}
          >
            {headline2}
          </h2>

          {/* 부제목 - 타이틀 바로 밑 */}
          <p className="text-white/95 font-medium flex-shrink-0 mt-2" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', fontFamily: 'GmarketSansBold, sans-serif' }}>
            {subheadline || '부제목을 입력하세요'}
          </p>

          {/* 리스트 - 다른 템플릿과 유사한 박싱 효과 */}
          <div className="flex-shrink-0 flex flex-col gap-2.5 mt-8 min-h-0">
            {(items.length > 0 ? items : [
              '탄소 제로의 심장, 새만금 국제에너지도시',
              '스마트 농생명, 미래 안보의 핵심',
              'K컬쳐 글로벌 허브',
              '지강 발전, 지역 도약 모델 창출',
            ]).map((item, index) => {
              const iconName = iconNames[index] || ['Zap', 'Sprout', 'Globe', 'TrendingUp'][index];
              const Icon = iconMap[iconName] || Zap;
              return (
                <div
                  key={index}
                  className="relative flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-md font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                    {iconName === 'Number' ? (
                      <span className="text-white font-extrabold text-sm" style={{ fontFamily: 'GmarketSansBold, sans-serif' }}>{index + 1}</span>
                    ) : (
                      <Icon size={18} className="text-white" strokeWidth={2.5} />
                    )}
                  </div>
                  <span className="font-semibold" style={{ fontSize: '24px', letterSpacing: '-0.03em', color: '#ffffff', wordBreak: 'keep-all' }}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 min-h-4" />
        </div>

        {copyrightArea && (
          <div className="relative z-30 flex-shrink-0 w-full">
            <CopyrightBanner data={copyrightArea} />
          </div>
        )}
      </div>
    );
  }
);

HorizontalCardTemplate.displayName = 'HorizontalCardTemplate';