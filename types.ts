import { LucideIcon } from 'lucide-react';

export enum ContentType {
  WELCOME = 'welcome',
  IT_SETUP = 'it_setup',
  COMPANY = 'company',
  UX_PART = 'ux_part',
  WELFARE = 'welfare',
  COMMUTE = 'commute',
  TOOLS = 'tools',
  OFFICE_GUIDE = 'office_guide',
}

export interface SubSection {
  title: string;
  content: string | string[]; // Can be a paragraph or a list
  codeBlock?: string; // For things like signatures or wifi passwords
  imagePlaceholder?: string;
  link?: string;
}

export interface SectionData {
  id: ContentType;
  title: string;
  icon: LucideIcon;
  description: string;
  subSections: SubSection[];
  heroImage?: string;
  heroVideo?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}