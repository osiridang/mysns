import { forwardRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DEFAULT_IMAGES } from '@/constants';

const SIZE = 720;

interface SquareLayoutTemplateProps {
  headline1: string;
  headline2: string;
  headline1Color?: string;
  headline2Color?: string;
  bodyText: string;
  image1: string;
  image2: string;
  image1Caption?: string;
  image2Caption?: string;
  bgColor: string;
  logoUrl?: string;
  copyrightUrl?: string;
}

export const SquareLayoutTemplate = forwardRef<HTMLDivElement, SquareLayoutTemplateProps>(
  ({ headline1, headline2, headline1Color = '#FFFFFF', headline2Color = '#FFFFFF', bodyText, image1, image2, image1Caption, image2Caption, bgColor, logoUrl, copyrightUrl }, ref) => {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden"
        style={{
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          background: `linear-gradient(135deg, ${bgColor} 0%, #1e3a8a 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 상단: 로고 */}
        <div className="absolute top-6 left-6 w-14 h-14 z-20">
          <ImageWithFallback
            src={logoUrl || DEFAULT_IMAGES.logo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 본문 영역 - 중앙 */}
        <div className="absolute top-24 left-8 right-8 space-y-2">
          <h2
            className="font-extrabold leading-tight"
            style={{
              fontSize: '3rem',
              fontFamily: 'GmarketSansBold, sans-serif',
              color: headline1Color || '#FFFFFF',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {headline1 || '제목1'}
          </h2>
          <h2
            className="font-extrabold leading-tight -mt-5"
            style={{
              fontSize: '3.5rem',
              fontFamily: 'GmarketSansBold, sans-serif',
              color: headline2Color || '#FFFFFF',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {headline2 || '제목2'}
          </h2>
          <p
            className="leading-relaxed"
            style={{ fontSize: '1.3rem', whiteSpace: 'pre-line', color: '#ffffff' }}
          >
            {bodyText || '본문 내용을 입력하세요.'}
          </p>
        </div>

        {/* 하단: 사진 영역 + 카피라이트 (카피라이트가 사진을 가리지 않도록 분리) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
          {/* 사진1, 사진2 - 높이 줄인 직사각형 */}
          <div className="flex gap-4 justify-center px-8 pb-4">
            <div
              className="relative rounded-lg overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0"
              style={{ width: 'calc(50% - 8px)', aspectRatio: '4 / 3' }}
            >
              <ImageWithFallback
                src={image1 || DEFAULT_IMAGES.profile}
                alt="사진1"
                className="w-full h-full object-cover"
              />
              {image1Caption && image1Caption.trim() && (
                <span
                  className="absolute bottom-2 right-2 px-2 py-1 text-white text-xs leading-tight rounded max-w-[85%] truncate"
                  style={{ background: 'rgba(0,0,0,0.85)', fontFamily: 'inherit' }}
                >
                  {image1Caption}
                </span>
              )}
            </div>
            <div
              className="relative rounded-lg overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0"
              style={{ width: 'calc(50% - 8px)', aspectRatio: '4 / 3' }}
            >
              <ImageWithFallback
                src={image2 || DEFAULT_IMAGES.profile}
                alt="사진2"
                className="w-full h-full object-cover"
              />
              {image2Caption && image2Caption.trim() && (
                <span
                  className="absolute bottom-2 right-2 px-2 py-1 text-white text-xs leading-tight rounded max-w-[85%] truncate"
                  style={{ background: 'rgba(0,0,0,0.85)', fontFamily: 'inherit' }}
                >
                  {image2Caption}
                </span>
              )}
            </div>
          </div>
          {/* 하단 카피라이트 - 사진 아래 별도 영역 */}
          {typeof copyrightUrl === 'string' && copyrightUrl.trim() !== '' && (
            <div className="w-full flex-shrink-0">
              <ImageWithFallback
                src={copyrightUrl}
                alt="Copyright"
                className="w-full h-auto object-contain object-center opacity-90"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

SquareLayoutTemplate.displayName = 'SquareLayoutTemplate';
