import { forwardRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DEFAULT_IMAGES, TEMPLATE_DIMENSIONS } from '@/constants';

interface HorizontalCardTemplateProps {
  headline1: string;
  headline2: string;
  subheadline: string;
  bodyText: string;
  bgColor: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  textImageUrls?: string[];
  logoUrl?: string;
  copyrightUrl?: string;
}

export const HorizontalCardTemplate = forwardRef<HTMLDivElement, HorizontalCardTemplateProps>(
  ({ headline1, headline2, subheadline, bodyText, bgColor, imageUrl, backgroundImageUrl, textImageUrls = [], logoUrl, copyrightUrl }, ref) => {
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
            <h2 className="text-white font-black leading-tight" style={{ fontSize: '3rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>
              {headline1 || '정책 제목'}
            </h2>
            <h2 className="text-white font-black leading-tight" style={{ fontSize: '3rem', marginTop: '-1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>
              {headline2}
            </h2>
            <p className="text-blue-100 font-medium" style={{ fontSize: '1.5rem' }}>
              {subheadline || '부제목을 입력하세요'}
            </p>
            <p className="text-blue-200 leading-relaxed" style={{ fontSize: '1.2rem' }}>
              {bodyText || '본문 내용을 입력하세요. 정책이나 공약에 대한 설명을 간결하게 작성합니다.'}
            </p>
          </div>
        </div>

        {/* 우측 이미지 영역 */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-transparent" />
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

        {/* 하단 카피라이트 이미지 */}
        {copyrightUrl && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <ImageWithFallback
              src={copyrightUrl}
              alt="Copyright"
              className="h-8 w-auto object-contain opacity-90"
            />
          </div>
        )}
      </div>
    );
  }
);

HorizontalCardTemplate.displayName = 'HorizontalCardTemplate';