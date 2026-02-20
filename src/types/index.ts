export type TemplateType = 'horizontal-card' | 'quad-layout' | 'vertical-list-card' | 'vertical-card' | 'square-layout';

export interface Headline {
  text: string;
  color: string;
}

export interface HorizontalCardData {
  headline1: string;
  headline2: string;
  subheadline: string;
  items: string[];
  iconNames: string[];
  bgColor: string;
  imageUrl: string;
  backgroundImageUrl: string;
  textImageUrls: string[];
  logoUrl: string;
  copyrightUrl: string;
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
  copyrightUrl: string;
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
  copyrightUrl: string;
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
  copyrightUrl: string;
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
  copyrightUrl: string;
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
