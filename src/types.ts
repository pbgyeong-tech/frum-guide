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

export type BlockType = 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'media' | 'link' | 'disclaimer' | 'table' | 'divider';

export interface EditorBlock {
  id: string;
  type: BlockType;
  value: string;
  value2?: string; 
}

export interface ArchiveEntry {
  title: string;
  winner?: string;
  imageUrl?: string;
  description?: string;
}

export interface ArchiveData {
  [year: number]: {
    [month: number]: ArchiveEntry;
  };
}

export interface SubSection {
  uuid?: string; // Unique ID for deletion/editing stability
  slug?: string; // URL Anchor ID (e.g., 'wifi-setup')
  title: string;
  content: string | string[]; // Can be a paragraph or a list
  items?: string[]; // For explicit list items
  codeBlock?: string; // For things like signatures or wifi passwords
  imagePlaceholder?: string;
  link?: string;
  linkTitle?: string; // Added to persist custom link labels
  disclaimer?: string; // Explicit field for the red info box
  keywords?: string[]; // Added for natural language search scoring
  lastEditedBy?: string; // Email of the last editor
  lastEditedAt?: number; // Timestamp of the last edit
  blocks?: EditorBlock[]; // Source of truth for block-based editor
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

export interface ContentSnapshot {
  slug: string;
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
  details: {
    before?: ContentSnapshot;
    after?: ContentSnapshot;
  };
}