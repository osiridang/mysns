import { forwardRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DEFAULT_IMAGES } from '@/constants';

// 기본 이미지 사용
const profileImage = DEFAULT_IMAGES.profile;
const defaultLogo = DEFAULT_IMAGES.logo;
const labelImage = DEFAULT_IMAGES.label;

interface VerticalCardTemplateProps {
  headline1: string;
  headline2: string;
  subheadline: string;
  bodyTexts: string[];
  bgColor: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  textImageUrls?: string[];
  logoUrl?: string;
}

export const VerticalCardTemplate = forwardRef<HTMLDivElement, VerticalCardTemplateProps>(
  ({ headline1, headline2, subheadline, bodyTexts, bgColor, imageUrl, backgroundImageUrl, textImageUrls = [], logoUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden flex flex-col"
        style={{
          width: '720px',
          height: '1200px',
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

        {/* 상단 슬로건 영역 */}
        <div className="absolute top-0 left-0 right-0 px-10 pt-16 pb-10">
          <div className="space-y-4">
            <div className="w-20 h-1 bg-white/60" />
            <h2 className="text-white font-black leading-tight" style={{ fontSize: '3.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em', fontFamily: 'GmarketSansBold, sans-serif' }}>
              {headline1 || '핵심 슬로건'}
            </h2>
            <h2 className="text-white font-black leading-tight" style={{ fontSize: '3.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em', marginTop: '-1.5rem', fontFamily: 'GmarketSansBold, sans-serif' }}>
              {headline2}
            </h2>
            <p className="text-blue-100 font-medium" style={{ fontSize: '2.2rem' }}>
              {subheadline || '부제목을 입력하세요'}
            </p>
          </div>
        </div>

        {/* 중앙 이미지 영역 */}
        <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 h-[45%] w-full">
          <div className="w-full h-full relative">
            <ImageWithFallback
              src={imageUrl || profileImage}
              alt="이원택 후보"
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center 15%',
                transform: 'scale(0.8)'
              }}
            />
            
            {/* 하단 그라데이션 오버레이 */}
            <div 
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '60%',
                background: 'linear-gradient(to top, rgba(30, 58, 138, 1) 0%, rgba(30, 58, 138, 0.6) 30%, transparent 100%)'
              }}
            />
          </div>
        </div>

        {/* 하단 정책 요약 영역 */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-16 pt-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-4">
            {bodyTexts.map((text, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center">
                  <span className="text-white font-bold" style={{ fontSize: '1rem' }}>
                    {index + 1}
                  </span>
                </div>
                <p className="text-white leading-relaxed flex-1" style={{ fontSize: '1.4rem' }}>
                  {text || '정책 요약 내용을 입력하세요. 핵심 공약이나 메시지를 간결하게 전달니다.'}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-blue-200 font-medium" style={{ fontSize: '1.2rem' }}>이원택</span>
              <span className="text-blue-200" style={{ fontSize: '1.1rem' }}>전북특별자치도 도지사 예비후보</span>
            </div>
          </div>
        </div>

        {/* 텍스트 이미지 오버레이 */}
        <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-4 items-center">
          {textImageUrls.map((url, index) => (
            <ImageWithFallback
              key={index}
              src={url}
              alt={`Text Overlay ${index + 1}`}
              className="max-w-[800px] max-h-[250px] object-contain drop-shadow-2xl"
            />
          ))}
        </div>
      </div>
    );
  }
);

VerticalCardTemplate.displayName = 'VerticalCardTemplate';