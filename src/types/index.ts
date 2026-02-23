export type TemplateType = 'horizontal-card' | 'quad-layout' | 'vertical-list-card' | 'vertical-card' | 'square-layout';

/** 하단 카피라이트 영역 (이미지처럼 좌·중앙·우 3단 구성, 텍스트 입력) */
export interface CopyrightArea {
  left1: string;
  left2: string;
  centerName: string;
  right1: string;
  right2: string;
  right3: string;
  /** 1줄(좌측1)에서 색상 강조할 단어 */
  highlightWord: string;
  /** 2줄(좌측2)에서 색상 강조할 단어. 없으면 highlightWord 사용 */
  highlightWord2?: string;
}

export interface Headline {
  text: string;
  color: string;
}

export interface HorizontalCardData {
  headline1: string;
  headline2: string;
  headline1Color?: string;
  headline2Color?: string;
  subheadline: string;
  items: string[];
  iconNames: string[];
  bgColor: string;
  imageUrl: string;
  backgroundImageUrl: string;
  textImageUrls: string[];
  logoUrl: string;
  copyrightArea: CopyrightArea;
}

export interface QuadLayoutData {
  headlines: Headline[];
  bgColor: string;
  imageUrl: string;
  backgroundImageUrl: string;
  textImageUrls: string[];
  logoUrl: string;
  items: string[];
  itemDetails: string[][];
  iconNames: string[];
  copyrightArea: CopyrightArea;
}

export interface VerticalListCardData {
  headlines: Headline[];
  bgColor: string;
  imageUrl: string;
  backgroundImageUrl: string;
  textImageUrls: string[];
  logoUrl: string;
  items: string[];
  iconNames: string[];
  copyrightArea: CopyrightArea;
}

export interface VerticalCardData {
  headline1: string;
  headline2: string;
  subheadline: string;
  bodyTexts: string[];
  bgColor: string;
  imageUrl: string;
  backgroundImageUrl: string;
  textImageUrls: string[];
  logoUrl: string;
  copyrightArea: CopyrightArea;
}

export interface SquareLayoutData {
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
  logoUrl: string;
  copyrightArea: CopyrightArea;
}

export type TemplateData = {
  'horizontal-card': HorizontalCardData;
  'quad-layout': QuadLayoutData;
  'vertical-list-card': VerticalListCardData;
  'vertical-card': VerticalCardData;
  'square-layout': SquareLayoutData;
};

export interface ProfileImage {
  id: string;
  filename: string;
  name: string;
  url: string | null;
  createdAt: string;
}

export interface SavedContent {
  id: string;
  templateType: TemplateType;
  data: HorizontalCardData | QuadLayoutData | VerticalListCardData | VerticalCardData | SquareLayoutData;
  timestamp: number;
  title: string;
}
