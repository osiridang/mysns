// API Configuration
export const API_BASE_URL = (projectId: string) => 
  `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da`;

export const API_ENDPOINTS = {
  HEALTH: '/health',
  LOGIN: '/login',
  VERIFY_SESSION: '/verify-session',
  SAVE_IMAGE: '/save-image',
  IMAGES: '/images',
  APP_DEFAULTS: '/app-defaults',
  PROFILE_IMAGES: '/profile-images',
  BACKGROUND_IMAGES: '/background-images',
  TEXT_IMAGES: '/text-images',
  LOGO_IMAGES: '/logo-images',
  SAVED_IMAGES: '/saved-images',
};

// Default Images
import profileImage from '../assets/주먹불끈이원택.png';
import logoImage from '../assets/LOGO_white.png';
import copyrightImage from '../assets/하단카피라이트.png';
import textImage1 from '../assets/가장강력한전북.svg';
import textImage2 from '../assets/이원택과.svg';
import textImage3 from '../assets/더불어.svg';

export const DEFAULT_IMAGES = {
  profile: profileImage,
  logo: logoImage,
  copyright: copyrightImage,
  label: '',
  /** 텍스트이미지 페이지 기본값 (가장강력한전북, 이원택과, 더불어) */
  defaultTextImages: [textImage1, textImage2, textImage3] as string[],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TEMPLATE_DATA: 'mysns-template-data',
  USER_DEFAULT_TEMPLATE_DATA: 'mysns-user-default-template-data',
  SELECTED_TEMPLATE: 'mysns-selected-template',
  APP_TITLE: 'mysns-app-title',
  APP_SUBTITLE: 'mysns-app-subtitle',
  SAVED_CONTENTS: 'mysns-saved-contents',
  ACCESS_TOKEN: 'accessToken',
};

// Template Dimensions (기본값)
export const TEMPLATE_DIMENSIONS = {
  width: 720,
  height: 1200,
};

// 1번 테마(가로형 카드)는 높이를 더 낮게
const HORIZONTAL_CARD_HEIGHT = 1080;
// 2번 테마(4분할 레이아웃)는 높이를 줄임
const QUAD_LAYOUT_HEIGHT = 1080;
// 3번 테마(세로 리스트 카드) 높이
const VERTICAL_LIST_CARD_HEIGHT = 1080;

/** 선택된 템플릿에 맞는 크기 반환 */
export function getTemplateDimensions(templateType: string): { width: number; height: number } {
  if (templateType === 'horizontal-card') {
    return { width: TEMPLATE_DIMENSIONS.width, height: HORIZONTAL_CARD_HEIGHT };
  }
  if (templateType === 'quad-layout') {
    return { width: TEMPLATE_DIMENSIONS.width, height: QUAD_LAYOUT_HEIGHT };
  }
  if (templateType === 'vertical-list-card') {
    return { width: TEMPLATE_DIMENSIONS.width, height: VERTICAL_LIST_CARD_HEIGHT };
  }
  return { ...TEMPLATE_DIMENSIONS };
}

// 템플릿 타입 → 좌측 패널 표시용 한글 이름
export const TEMPLATE_LABELS: Record<string, string> = {
  'horizontal-card': '가로형 카드',
  'quad-layout': '4분할 레이아웃',
  'vertical-list-card': '세로 리스트 카드',
  'vertical-card': '세로형 카드',
  'square-layout': '사각 2단 레이아웃',
};

// Available Icons
export const AVAILABLE_ICONS = [
  { name: 'Number', label: '숫자 (1,2,3,4)' },
  { name: 'Zap', label: '번개' },
  { name: 'Heart', label: '하트' },
  { name: 'Star', label: '별' },
  { name: 'Users', label: '사람들' },
  { name: 'Target', label: '타겟' },
  { name: 'TrendingUp', label: '상승' },
  { name: 'Globe', label: '지구' },
  { name: 'Sprout', label: '새싹' },
  { name: 'Lightbulb', label: '전구' },
  { name: 'Award', label: '상' },
];

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: 'image/*',
};
