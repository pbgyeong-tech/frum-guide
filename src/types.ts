import { LucideIcon } from 'lucide-react';

export enum ContentType {
  WELCOME = 'welcome',
  COMPANY = 'company',
  IT_SETUP = 'it_setup',
  WELFARE = 'welfare',
  CULTURE = 'culture',
  COMMUTE = 'commute',
  EXPENSE = 'expense',
  TOOLS = 'tools',
  OFFICE_GUIDE = 'office_guide',
  FAQ = 'faq',
}

export interface SubSection {
  uuid?: string;
  slug?: string;
  title: string;
  content: string | string[];
  codeBlock?: string;
  imagePlaceholder?: string;
  link?: string;
  disclaimer?: string;
  keywords?: string[];
  lastEditedBy?: string;
  lastEditedAt?: number;
}

export interface SectionData {
  id: ContentType;
  title: string;
  icon: LucideIcon;
  description: string;
  subSections: SubSection[];
  heroImage?: string;
  heroVideo?: string;
  children?: SectionData[];
}

export interface ContentSnapshot {
  slug: string; // ✨ 필수 항목으로 변경 (값이 없으면 빈 문자열이라도 넣음)
  title: string;
  body_content: string;
  media: string;
  external_link: string;
  disclaimer_note: string;
}

export interface EditLog {
  timestamp: number;
  userEmail: string;
  sectionId: string;
  subSectionTitle: string;
  action: 'create' | 'update' | 'delete';
  formatted_date?: string; // ✨ 날짜 필드 명시
  details: {
    before?: ContentSnapshot;
    after?: ContentSnapshot;
  };
}