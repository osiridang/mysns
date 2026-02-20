import { forwardRef, useRef, useEffect } from 'react';
import { Zap, Sprout, Globe, TrendingUp, Heart, Star, Users, Target, Lightbulb, Award, LucideIcon } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DEFAULT_IMAGES, TEMPLATE_DIMENSIONS } from '@/constants';

const TITLE_BASE_SIZE = 48;
const TITLE_MIN_SIZE = 20;
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
  subheadline: string;
  items?: string[];
  iconNames?: string[];
  bgColor: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  textImageUrls?: string[];
  logoUrl?: string;
  copyrightUrl?: string;
}

export const HorizontalCardTemplate = forwardRef<HTMLDivElement, HorizontalCardTemplateProps>(
  ({ headline1, headline2, subheadline, items = [], iconNames = [], bgColor, imageUrl, backgroundImageUrl, textImageUrls = [], logoUrl, copyrightUrl }, ref) => {
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
        className="relative overflow-hidden"
        style={{
          width: `${TEMPLATE_DIMENSIONS.width}px`,
          height: `${TEMPLATE_DIMENSIONS.height}px`,
          backgroundImage: backgroundImageUrl 
            ? `url(${backgroundImageUrl})` 
            : `linear-gradient(135deg, ${bgColor} 0%, #1e3a8a 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 좌측 텍스트 영역 */}
        <div className="absolute left-0 top-0 h-full w-[55%] flex flex-col justify-center px-12">
          <div className="space-y-6">
            <div className="w-16 h-1 bg-white/60 mb-4" />
            <h2
              ref={title1Ref}
              className="text-white leading-tight"
              style={{
                fontFamily: 'GmarketSansBold, sans-serif',
                fontWeight: 800,
                fontSize: `${TITLE_BASE_SIZE}px`,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em',
              }}
            >
              {headline1 || '정책 제목'}
            </h2>
            <h2
              ref={title2Ref}
              className="text-white leading-tight"
              style={{
                fontFamily: 'GmarketSansBold, sans-serif',
                fontWeight: 800,
                fontSize: `${TITLE_BASE_SIZE}px`,
                marginTop: '-0.5em',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em',
              }}
            >
              {headline2}
            </h2>
            <p className="text-blue-100 font-medium" style={{ fontSize: '1.5rem' }}>
              {subheadline || '부제목을 입력하세요'}
            </p>
            {/* 리스트 항목 (3번 템플릿과 동일 구조) */}
            <div className="space-y-2">
              {(items.length > 0 ? items : [
                '탄소 제로의 심장, 새만금 국제에너지도시',
                '스마트 농생명, 미래 양보의 핵심',
                'K컬쳐 글로벌 허브',
                '지강 발전, 지역 도약 모델 창출',
              ]).map((item, index) => {
                const iconName = iconNames[index] || ['Zap', 'Sprout', 'Globe', 'TrendingUp'][index];
                const Icon = iconMap[iconName] || Zap;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-2 py-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                      {iconName === 'Number' ? (
                        <span className="text-white font-extrabold text-sm" style={{ fontFamily: 'GmarketSansBold, sans-serif' }}>
                          {index + 1}
                        </span>
                      ) : (
                        <Icon size={18} className="text-white" strokeWidth={2.5} />
                      )}
                    </div>
                    <span className="text-blue-100 font-medium" style={{ fontSize: '1.4rem', letterSpacing: '-0.03em' }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 우측 이미지 영역 - 후보는 밝게, 왼쪽 뒷배경만 살짝 어둡게 */}
        <div className="absolute right-0 top-0 h-full w-[45%]">
          <div className="w-full h-full relative">
            <ImageWithFallback
              src={imageUrl || DEFAULT_IMAGES.profile}
              alt="이원택 후보"
              className="w-full h-full object-cover"
              style={{
                objectPosition: '70% 20%'
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 35%, transparent 55%)'
              }}
              aria-hidden
            />
          </div>
        </div>

        {/* 장식 요소 */}
        <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-white/20 rounded" />

        {/* 로고 오버레이 - 좌측 상단 */}
        <div className="absolute top-8 left-8 w-20 h-20 z-20">
          <ImageWithFallback
            src={logoUrl || DEFAULT_IMAGES.logo}
            alt="Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* 텍스트 이미지 오버레이 (상단 중앙) */}
        {textImageUrls && textImageUrls.length > 0 && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col gap-4 items-center z-20">
            {/* 텍스트 이미지 삭제됨 */}
          </div>
        )}

        {/* 하단 카피라이트 이미지 - 너비 100%, 높이 자동, 하단 여백 없음 */}
        {typeof copyrightUrl === 'string' && copyrightUrl.trim() !== '' && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ImageWithFallback
              src={copyrightUrl}
              alt="Copyright"
              className="w-full h-auto object-contain object-center opacity-90"
            />
          </div>
        )}
      </div>
    );
  }
);

HorizontalCardTemplate.displayName = 'HorizontalCardTemplate';