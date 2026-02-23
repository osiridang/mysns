import type { LucideIcon } from 'lucide-react';
import { Layout, Edit, ImageIcon, Image as ImageIconLucide, Type, Braces, FileText, Save } from 'lucide-react';

export type MenuTab = 'template' | 'edit' | 'profile' | 'background' | 'textimage' | 'logo' | 'copyright' | 'saved';

export interface NavTabConfig {
  tab: MenuTab;
  label: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTabConfig[] = [
  { tab: 'template', label: '템플릿 선택', icon: Layout },
  { tab: 'edit', label: '내용 편집', icon: Edit },
  { tab: 'profile', label: '후보 얼굴 관리', icon: ImageIcon },
  { tab: 'background', label: '배경 이미지', icon: ImageIconLucide },
  { tab: 'textimage', label: '텍스트 이미지', icon: Type },
  { tab: 'logo', label: '로고 이미지', icon: Braces },
  { tab: 'copyright', label: '하단 문구', icon: FileText },
  { tab: 'saved', label: '저장된 내용', icon: Save },
];
