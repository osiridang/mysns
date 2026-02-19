// API Configuration
export const API_BASE_URL = (projectId: string) => 
  `https://${projectId}.supabase.co/functions/v1/make-server-3dc5a6da`;

export const API_ENDPOINTS = {
  LOGIN: '/login',
  VERIFY_SESSION: '/verify-session',
  SAVE_IMAGE: '/save-image',
  PROFILE_IMAGES: '/profile-images',
  BACKGROUND_IMAGES: '/background-images',
  TEXT_IMAGES: '/text-images',
  LOGO_IMAGES: '/logo-images',
  SAVED_IMAGES: '/saved-images',
};

// Default Images
export const DEFAULT_IMAGES = {
  profile: 'https://images.unsplash.com/photo-1543132220-7bc04a0e790a?w=800&h=1200&fit=crop',
  logo: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=200&h=200&fit=crop',
  label: '',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TEMPLATE_DATA: 'mysns-template-data',
  SELECTED_TEMPLATE: 'mysns-selected-template',
  APP_TITLE: 'mysns-app-title',
  APP_SUBTITLE: 'mysns-app-subtitle',
  SAVED_CONTENTS: 'mysns-saved-contents',
  ACCESS_TOKEN: 'accessToken',
};

// Template Dimensions
export const TEMPLATE_DIMENSIONS = {
  width: 720,
  height: 1200,
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
