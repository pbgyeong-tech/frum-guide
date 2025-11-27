
import { LucideIcon } from 'lucide-react';

export enum ContentType {
  WELCOME = 'welcome',
  SEARCH = 'search', // Renamed from FAQ to SEARCH
  COMPANY = 'company',
  WORK_INTRO = 'work_intro',
  UX_PART = 'ux_part',
  IT_SETUP = 'it_setup',
  WELFARE = 'welfare',
  COMMUTE = 'commute',
  TOOLS = 'tools',
  OFFICE_GUIDE = 'office_guide',
  GUIDE_EDIT = 'guide_edit',
}

export interface SubSection {
  title: string;
  content: string | string[]; // Can be a paragraph or a list
  codeBlock?: string; // For things like signatures or wifi passwords
  imagePlaceholder?: string;
  link?: string;
  keywords?: string[]; // Added for natural language search scoring
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
