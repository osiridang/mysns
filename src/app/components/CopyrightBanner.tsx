import type { CopyrightArea } from '@/types';

const HIGHLIGHT_COLOR = '#22d3ee';
const SIDE_FONT_SIZE = '1rem';
const LEFT_FONT_SIZE = '22px';
const FONT_FAMILY = 'GmarketSansBold';
const LIGHT_WEIGHT = 100;

const BANNER_STYLE: React.CSSProperties = {
  background: 'rgba(0, 28, 92, 1)',
  minHeight: '72px',
  boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
};

const LEFT_LINE_STYLE: React.CSSProperties = {
  fontSize: LEFT_FONT_SIZE,
  fontFamily: FONT_FAMILY,
  fontWeight: LIGHT_WEIGHT,
};

const CENTER_NAME_STYLE: React.CSSProperties = {
  fontSize: '72px',
  lineHeight: 1,
  letterSpacing: '-0.02em',
  fontFamily: FONT_FAMILY,
};

const RIGHT_LINE_STYLE: React.CSSProperties = {
  fontSize: SIDE_FONT_SIZE,
  fontFamily: FONT_FAMILY,
  fontWeight: LIGHT_WEIGHT,
};

function renderLineWithHighlight(text: string, highlightWord: string, fontSize: string = SIDE_FONT_SIZE) {
  if (!highlightWord.trim()) {
    return <>{text}</>;
  }
  const parts = text.split(highlightWord);
  if (parts.length <= 1) {
    return <>{text}</>;
  }
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} style={{ fontFamily: FONT_FAMILY, fontSize }}>
          {part}
          {i < parts.length - 1 && (
            <span style={{ color: HIGHLIGHT_COLOR, fontFamily: FONT_FAMILY, fontSize }}>{highlightWord}</span>
          )}
        </span>
      ))}
    </>
  );
}

interface CopyrightBannerProps {
  data: CopyrightArea;
  className?: string;
}

export function CopyrightBanner({ data, className = '' }: CopyrightBannerProps) {
  const {
    left1,
    left2,
    centerName,
    right1,
    right2,
    right3,
    highlightWord,
    highlightWord2,
  } = data;
  const highlight1 = highlightWord ?? '';
  const highlight2 = highlightWord2 ?? highlightWord ?? '';

  const hasContent = left1 || left2 || centerName || right1 || right2 || right3;
  if (!hasContent) return null;

  const rightItems = [right1, right2, right3].filter(Boolean) as string[];

  return (
    <div
      className={`w-full flex items-center justify-between gap-2 px-4 py-4 ${className}`}
      style={BANNER_STYLE}
    >
      <div className="flex-1 min-w-0 text-right flex flex-col justify-center gap-0.5" style={{ maxWidth: '40%' }}>
        {left1 && (
          <div className="text-white leading-tight" style={LEFT_LINE_STYLE}>
            {renderLineWithHighlight(left1, highlight1, LEFT_FONT_SIZE)}
          </div>
        )}
        {left2 && (
          <div className="text-white leading-tight" style={LEFT_LINE_STYLE}>
            {renderLineWithHighlight(left2, highlight2, LEFT_FONT_SIZE)}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-2">
        {centerName && (
          <div
            className="text-white font-extrabold text-center whitespace-nowrap"
            style={CENTER_NAME_STYLE}
          >
            {centerName}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 text-right flex flex-col justify-center gap-0.5">
        {rightItems.map((text, i) => (
          <div
            key={i}
            className="text-white leading-tight whitespace-nowrap"
            style={RIGHT_LINE_STYLE}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
