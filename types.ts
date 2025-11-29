
import { LucideIcon } from 'lucide-react';

export enum ContentType {
  WELCOME = 'welcome',
  COMPANY = 'company',
  IT_SETUP = 'it_setup',
  WELFARE = 'welfare',
  COMMUTE = 'commute',
  TOOLS = 'tools',
  OFFICE_GUIDE = 'office_guide',
  FAQ = 'faq',
}

export interface SubSection {
  uuid?: string; // Unique ID for deletion/editing stability
  title: string;
  content: string | string[]; // Can be a paragraph or a list
  codeBlock?: string; // For things like signatures or wifi passwords
  imagePlaceholder?: string;
  link?: string;
  keywords?: string[]; // Added for natural language search scoring
  lastEditedBy?: string; // Email of the last editor
  lastEditedAt?: number; // Timestamp of the last edit
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

export interface EditLog {
  timestamp: number;
  userEmail: string;
  sectionId: string;
  subSectionTitle: string;
  action: 'create' | 'update' | 'delete';
  details?: string;
}
