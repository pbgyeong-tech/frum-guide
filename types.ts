import { LucideIcon } from 'lucide-react';

// 메뉴 ID 목록 (여기 없는 이름을 쓰면 에러가 납니다)
export enum ContentType {
  WELCOME = 'welcome',
  COMPANY = 'company',
  WORK_WAY = 'work_way',      // 🟢 추가됨
  IT_SETUP = 'it_setup',
  WELFARE = 'welfare',
  COMMUTE = 'commute',
  TOOLS = 'tools',
  OFFICE_GUIDE = 'office_guide',
  ETC = 'etc',                // 🟢 추가됨
  FAQ = 'faq',
  SEARCH = 'search',
  GUIDE_EDIT = 'guide_edit',
  UX_PART = 'ux_part'         // 혹시 몰라 추가함 (UX팀 소개용)
}

// 하위 섹션 (카드 하나하나의 데이터 구조)
export interface SubSection {
  title: string;
  content: string | string[]; // 텍스트 또는 줄바꿈된 텍스트 배열
  codeBlock?: string;         // 코드 블록 (선택 사항)
  link?: string;              // 링크 (선택 사항)
  imagePlaceholder?: string;  // 이미지 URL (선택 사항)
  keywords?: string[];        // 검색용 키워드
}

// 메인 섹션 (메뉴 하나의 데이터 구조)
export interface SectionData {
  id: ContentType;
  title: string;
  description?: string;       // 설명 (선택 사항)
  icon?: LucideIcon | any;    // 아이콘
  heroImage?: string;         // 상단 배경 이미지
  heroVideo?: string;         // 상단 배경 동영상
  subSections: SubSection[];  // 하위 콘텐츠 목록
  children?: SectionData[];   // 하위 메뉴 (뎁스)
}