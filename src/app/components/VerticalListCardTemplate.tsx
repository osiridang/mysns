import { forwardRef } from 'react';
import { Zap, Sprout, Globe, TrendingUp, Heart, Star, Users, Target, Lightbulb, Award, LucideIcon } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CopyrightBanner } from './CopyrightBanner';
import { DEFAULT_IMAGES, getTemplateDimensions } from '@/constants';

// 기본 이미지 사용
const profileImage = DEFAULT_IMAGES.profile;
const defaultLogo = DEFAULT_IMAGES.logo;
const labelImage = DEFAULT_IMAGES.label;

interface HeadlineItem {
  text: string;
  color: string;
}

interface VerticalListCardTemplateProps {
  headlines: HeadlineItem[];
  items: string[];
  bgColor: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  textImageUrls?: string[];
  logoUrl?: string;
  iconNames?: string[];
  copyrightArea?: import('@/types').CopyrightArea;
}

export const VerticalListCardTemplate = forwardRef<HTMLDivElement, VerticalListCardTemplateProps>(
  ({ headlines = [], items = [], bgColor, imageUrl, backgroundImageUrl, textImageUrls = [], logoUrl, iconNames = [], copyrightArea }, ref) => {
    const defaultItems = [
      '탄소 제로의 심장, 새만금 국제에너지도시',
      '스마트 농생명, 미래 안보의 핵심',
      'K컬쳐 글로벌 허브',
      '지강 발전, 지역 도약 모델 창출'
    ];
    
    const displayItems = items.length > 0 ? items : defaultItems;

    // 아이콘 매핑
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

    // 아이콘 이름을 실제 컴포넌트로 변환
    const icons = iconNames.length > 0 
      ? iconNames.map(name => iconMap[name] || Zap)
      : [Zap, Sprout, Globe, TrendingUp];

    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          width: `${getTemplateDimensions('vertical-list-card').width}px`,
          height: `${getTemplateDimensions('vertical-list-card').height}px`,
          backgroundImage: backgroundImageUrl 
            ? `url(${backgroundImageUrl})` 
            : `linear-gradient(135deg, ${bgColor} 0%, #1e3a8a 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 로고 오버레이 */}
        <div className="absolute top-8 right-10 w-20 h-20 z-20">
          <ImageWithFallback
            src={logoUrl || defaultLogo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 메인 메시지 - 제목 줄 1~2 대형, 3~5 추가 제목은 동일 영역에 표시 (2번 테마와 동일하게 최대 5개) */}
        <div className="absolute top-0 left-0 right-0 px-10 pt-16 pb-10">
          <div className="space-y-4">
            {headlines.slice(0, 2).map((headline, index) => (
              <h2
                key={index}
                className="text-white leading-tight whitespace-pre-line"
                style={{
                  fontSize: index === 0 ? '3.75rem' : '4.75rem',
                  fontWeight: 700,
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  letterSpacing: '-0.02em',
                  marginTop: index === 0 ? 0 : '-1.5rem',
                  fontFamily: 'GmarketSansBold, sans-serif',
                  color: headline.color
                }}
              >
                {headline.text}
              </h2>
            ))}
            {headlines.slice(2, 5).map((headline, index) => (
              <h2
                key={index + 2}
                className="text-white leading-tight whitespace-pre-line"
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  letterSpacing: '-0.02em',
                  marginTop: '-0.5rem',
                  fontFamily: 'GmarketSansBold, sans-serif',
                  color: headline.color
                }}
              >
                {headline.text}
              </h2>
            ))}
          </div>
        </div>

        {/* 인물 사진 - 4분할 레이아웃과 동일: 하단 연장 + 그라데이션 */}
        <div className="absolute top-[15%] left-[calc(58%+50px)] transform -translate-x-1/2">
          <div className="relative" style={{ width: '450px', height: '500px' }}>
            <ImageWithFallback
              src={imageUrl || profileImage}
              alt="이원택 후보"
              className="object-cover"
              style={{
                width: '600px',
                height: '600px',
                objectPosition: 'center 0%'
              }}
            />
            {/* 하단 그라데이션 오버레이 - 4분할과 동일 */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: '-135px',
                right: '-135px',
                bottom: '-150px',
                height: '50%',
                background: 'linear-gradient(to top, rgba(30, 58, 138, 1) 15%, rgba(30, 58, 138, 0.5) 45%, transparent 100%)'
              }}
            />
          </div>
        </div>

        {/* 세로 리스트 카드 */}
        <div className="absolute bottom-40 left-0 right-0 px-8">
          <div className="flex flex-col gap-3 pb-6">
            {displayItems.map((item, index) => {
              const Icon = icons[index];
              const iconName = iconNames[index] || 'Zap';
              return (
                <div
                  key={index}
                  className="relative rounded-xl px-6 py-4 backdrop-blur-md flex items-center gap-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* 아이콘 또는 숫자 */}
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                    {iconName === 'Number' ? (
                      <span className="text-white font-extrabold text-xl" style={{ fontFamily: 'GmarketSansBold, sans-serif' }}>
                        {index + 1}
                      </span>
                    ) : (
                      <Icon size={24} className="text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* 카드 제목 */}
                  <h3 
                    className="text-white font-bold leading-tight flex-1"
                    style={{ 
                      fontSize: '1.5rem',
                      fontFamily: 'GmarketSansBold, sans-serif'
                    }}
                  >
                    {item}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 라벨 - 제일 밑에 배치 */}
        <div className="absolute bottom-0 left-0 right-0">
          {labelImage && (
            <ImageWithFallback
              src={labelImage} 
              alt="이원택 후보 경력" 
              className="w-full object-contain"
              style={{
                maxHeight: '120px'
              }}
            />
          )}
        </div>

        {/* 텍스트 이미지 오버레이 */}
        <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-3 items-center">
          {/* 텍스트 이미지 삭제됨 */}
        </div>

        {copyrightArea && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <CopyrightBanner data={copyrightArea} />
          </div>
        )}
      </div>
    );
  }
);

VerticalListCardTemplate.displayName = 'VerticalListCardTemplate';