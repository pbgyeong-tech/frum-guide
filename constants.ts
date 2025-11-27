
import { 
  Home, 
  Wifi, 
  Users, 
  Coffee, 
  Laptop, 
  Building2,
  Clock,
  KeyRound,
  Search, // Changed HelpCircle to Search
  Briefcase,
  HelpCircle,
  Settings
} from 'lucide-react';
import { SectionData, ContentType } from './types';

export const COMPANY_NAME = "FRUM";

export const HANDBOOK_CONTENT: SectionData[] = [
  {
    id: ContentType.WELCOME,
    title: "Welcome",
    icon: Home,
    description: "",
    heroVideo: "https://cdn.midjourney.com/video/efa8c7dd-863a-49ed-95b7-a04d94a5bd87/3.mp4",
    subSections: [
      {
        title: "Onboarding Strategy",
        content: "Frum의 여정에 합류하신 것을 환영합니다. 본 가이드는 새로운 구성원이 조직의 문화·업무 방식·협업 구조를 빠르게 이해하도록 돕는 Roadmap입니다.",
        keywords: ["환영", "입사", "시작", "가이드", "로드맵", "ot", "오리엔테이션", "전략", "비전"]
      }
    ]
  },
  {
    id: ContentType.SEARCH,
    title: "통합 검색",
    icon: Search, // 위에서 import에 Search가 있어야 합니다.
    description: "가이드 전체 내용을 검색해보세요",
    subSections: [] // <--- 대괄호만 남기고 내용은 싹 지웁니다.
  },
  {
    id: ContentType.COMPANY,
    title: "회사 & 조직",
    icon: Building2,
    description: "프럼의 비즈니스 영역과 사무실 안내",
    subSections: [
      {
        title: "안녕하세요.👋",
        imagePlaceholder: "https://www.frum.co.kr/_next/image?url=%2Fimages%2Fabout-frum.jpg&w=3840&q=75",
        content: [
            "프럼은 디지털 에이전시로 UX 컨설팅 및 마케팅, 콘텐츠 발행, 사이트 운영 작업을 진행합니다. 주요 클라이언트는 현대자동차그룹, 삼성, LG등이 있으며 모빌리티 관련 프로젝트가 많습니다.",
            "[프럼 웹사이트에서 자세히 알아보기 >](https://www.frum.co.kr/ko/about)"
        ],
        keywords: ["비전", "사업", "클라이언트", "고객사", "하는일", "에이전시", "업종", "현대", "삼성"]
      },
      {
        title: "프럼의 사업부와 구성원을 소개할게요.",
        content: `| 사업부 | 이름 | 직급 | 이메일 |
|---|---|---|---|
| CEO | 김명진 | 대표 | mjkim@frum.co.kr |
| Business Administrationg | 오한샘 | 수석 | hs.oh@frum.co.kr |
| Creative Development | 홍채빈 | 수석 | cb.hong@frum.co.kr |
| Creative Solution Center | 박영하 | 이사 | yh.park@frum.co.kr |
| Creative Solution Center | 최영진 | 책임 | yj.choi@frum.co.kr |
| Creative Solution Center | 유도예 | 책임 | dy.yu@frum.co.kr |
| Creative Solution Center | 박보경 | 책임 | bg.park@frum.co.kr |
| Creative Solution Center | 김초은 | 선임 | ce.kim@frum.co.kr |
| Creative Solution Center | 정지명 | 선임 | jm.jung@frum.co.kr |
| Creative Solution Center | 허가람 | 선임 | gr.heo@frum.co.kr |
| Creative Solution Center | 경유진 | 선임 | yj.kyoung@frum.co.kr |
| Creative Solution Center | 김혜진 | 사원 | hj.kim@frum.co.kr |
| Creative Solution Center | 박세이 | 사원 | sy.park@frum.co.kr |
| Creative Solution Center | 장우조 | 사원 | wj.jang@frum.co.kr |
| Creative Solution Center | 노유진 | 사원 | yj.noh@frum.co.kr |
| Creative Solution Center | 최인화 | 사원 | ih.choi@frum.co.kr |
| Creative Consulting | 권예훈 | 이사 | kwon@frum.co.kr |
| Creative Consulting | 정지훈 | 선임 | jh.jeong@frum.co.kr |
| Creative Consulting | 박도원 | 선임 | dw.park@frum.co.kr |
| Creative Consulting | 정하영 | 사원 | hy.jung@frum.co.kr |
| Marketing & Campain | 이재훈 | 이사 | jeff@frum.co.kr |
| Marketing & Campain | 공주연 | 책임 | jy.kong@frum.co.kr |
| Marketing & Campain | 진초원 | 선임 | cw.jin@frum.co.kr |
| Platform Operation | 민준기 | 이사 | jk.min@frum.co.kr |
| Platform Operation | 안나현 | 책임 | nh.ahn@frum.co.kr |
| Platform Operation | 이수인 | 사원 | si.lee@frum.co.kr |
| Contents Solution Center | 이기원 | 수석 | kw.lee@frum.co.kr |
| Contents Solution Center | 류민 | 수석 | m.ryu@frum.co.kr |
| Contents Solution Center | 김장원 | 수석 | jw.kim@frum.co.kr |
| Contents Solution Center | 이세환 | 수석 | sh.lee@frum.co.kr |
| Contents Solution Center | 황은비 | 책임 | eb.hwang@frum.co.kr |
| Contents Solution Center | 이인주 | 책임 | ij.lee@frum.co.kr |
| Contents Solution Center | 윤현수 | 책임 | hs.yoon@frum.co.kr |
| Contents Solution Center | 남도연 | 선임 | dy.nam@frum.co.kr |
| Contents Solution Center | 최현진 | 선임 | hj.choi@frum.co.kr |
| Contents Solution Center | 신화섭 | 선임 | hs.shin@frum.co.kr |`,
        keywords: ["조직도", "구성원", "팀원", "연락처", "이메일", "전화번호", "담당자", "누구", "직급", "부서"]
      },
      {
        title: "사무실은 이렇게 구성되어 있어요.",
        imagePlaceholder: "https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/297f7ed436ba3b244718eb7afc34ca2e13960a7d97f310d59a8aa8f7f1203108.jpg",
        content: [
            "- 회의실: 층별 회의실에서 자유롭게 회의를 진행하며, 점심시간에는 회의실에서 식사를 합니다.",
            "- 탕비실: 커피머신, 정수기, 전자레인지, 비상약을 이용할 수 있으며 2층 탕비실에 매달 간식이 들어옵니다.",
            "- 화장실: 세면대 아래에 양치도구 및 파우치를 보관할 수 있는 공간이 있습니다.",
            "- 인쇄실: 인쇄, 파쇄 및 노트, 펜, 테이프, 칼 등의 사무용품을 이용할 수 있는 공간입니다."
        ],
        keywords: ["회의실", "화장실", "탕비실", "간식", "커피", "프린트", "인쇄", "위치", "자리", "약", "비상약", "전자레인지"]
      }
    ]
  },
  {
    id: ContentType.WORK_WAY,   // 🔴 WORK_INTRO → 🟢 WORK_WAY
    title: "일하는 방식",
    icon: Briefcase,
    description: "각 파트별 업무 및 프로세스 소개",
    subSections: [],
    children: [
      {
        id: ContentType.UX_PART,
        title: "UX 업무 프로세스",
        icon: Users,
        description: "Creative Solution Center UX Team & Process",
        subSections: [
          {
            title: "UX파트 소개",
            content: "저희는 크리에이티브 솔루션 센터 소속으로 UX의 혁신을 이끌고 있습니다!",
            keywords: ["ux", "기획", "팀소개", "솔루션"]
          },

          {
            title: "1. 프로젝트 진행 프로세스 (Workflow)",
            content: [
                "**① RFP 분석**\n클라이언트 요구사항을 정제하고 프로젝트 범위·목표·리스크를 파악합니다.",
                "**② WBS 작성**\n전체 일정을 세부 업무 단위로 분할하여 협업팀(클라이언트/기획/디자인/개발/운영)과 공유합니다.",
                "**③ 벤치마킹**\nGlobal Top 100 기업 중심으로 동종·이종 시장을 분석해 프로젝트 방향성을 도출합니다.",
                "**④ User Flow 설계**\n전체 페이지 구조와 기능 흐름을 작성하여 디자인/개발 공수를 가늠합니다.",
                "**⑤ 화면 설계 (IA & Wireframe)**\n핵심 화면부터 우선 설계하며 디바이스별(PC/Tablet/Mobile) 구조를 결정합니다.",
                "**⑥ 디자인**\n메인 페이지와 핵심 Feature 중심으로 컨셉을 확정하고 폰트·그리드·UI 컴포넌트·가이드를 포함한 전체 UI를 완성합니다.",
                "**⑦ 개발 전달**\nAnnotation 포함된 화면 설계서/디자인 파일을 개발팀에 전달하고 공통 규칙(반응형·상태별·예외 처리)을 명확히 정의합니다.",
                "**⑧ QA & QC**\n디바이스/브라우저 기반 전체 플로우를 테스트하며 오류, 인터랙션, 예외 지점, UX 불일치를 점검합니다.",
                "**⑨ 최종 산출물 전달**\n요구사항 정의서, 회의록, 디자인 파일, 완료보고서 등 모든 산출물을 정리하여 클라이언트에게 제공하고 프로젝트를 마무리합니다."
            ],
            keywords: ["일하는법", "프로세스", "절차", "순서", "워크플로우", "기획서", "스토리보드", "sb", "ia", "벤치마킹", "qa", "rfp", "개발전달"]
          },
          {
            title: "2. 주요 산출물 (Deliverables)",
            content: [
                "**① WBS (Work Breakdown Structure)**\n프로젝트 전체 작업 구조를 세분화한 문서\n일정 공유, 리소스 산정, 우선순위 관리의 기준",
                "**② 요구사항 정의서 (Requirement Document)**\n프로젝트 목적, 기능 범위, 비기능 요구사항 포함\n모든 단계에서 “합의된 기준점” 역할",
                "**③ 화면명세서 (Screen Specification)**\n화면 구성, 기능 설명, 예외 처리, 동작 흐름을 상세히 기재",
                "**④ 회의록 (Meeting Minutes)**\n논의 내용, 결정 사항, 후속 조치를 명확히 기록\n변경 이력 및 책임 소재를 추적하는 공식 문서",
                "**⑤ 화면 디자인 (Figma Original + PNG)**\n메뉴별 최종 화면 디자인\n레이아웃, 스타일, 컴포넌트가 반영된 원본 산출물",
                "**⑥ 화면 설계서 (Wireframe + Annotation)**\n화면 단위 기능·위치·행동을 기획 관점에서 정리\n개발·QA 기준 문서로 활용",
                "**⑦ 디자인 가이드**\n브랜드·UI 시스템·반응형 기준 등 시각적 명세"
            ],
            keywords: ["문서", "산출물", "결과물", "파일", "피그마", "figma", "wbs", "일정표", "명세서", "화면설계서"]
          }
        ]
      }
    ]
  },
  {
    id: ContentType.IT_SETUP,
    title: "업무 시작 세팅",
    icon: Wifi,
    description: "무선네트워크 연결과 이메일 설정하기",
    subSections: [
      {
        title: "무선 인터넷 설정하기",
        content: [
            "다음 과정에 따라 무선 인터넷을 연결해주세요.",
            "1. `시스템 설정` > `Wi-Fi` > ‘FRUM’ 네트워크 연결",
            "2. 암호 입력: imagination_composer_2018"
        ],
        codeBlock: "imagination_composer_2018",
        imagePlaceholder: "https://s.mj.run/_p_io4VsXxk",
        keywords: ["와이파이", "wifi", "비밀번호", "무선", "인터넷", "비번", "pw", "password", "연결", "접속"]
      },
      {
        title: "프럼 서버 접속하기",
        content: [
            "프럼에서 제작되는 모든 산출물은 서버에 저장하며 관련 리소스를 확인할 수 있습니다.",
            "1. Finder에서 Command + K 단축키를 누른 후 `afp://air.frum.co.kr` 주소를 입력해 주세요.",
            "![Server Address](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/47b39e7f0ae783f5f387bdea4888f0b9750b5e1fa6f9dd08dbeb458f2c24d451.png)",
            "2. 원하는 폴더에 접속해 주세요.",
            "![Folder Access](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/07dd9d1f7844a58b39b6c94038d3e4fd94f75928c78bf5a3ea4c2ac4ecf4f103.png)",
            "프로젝트에 사용되는 폴더는 종료된 프로젝트를 아카이빙하는 Project_Archive, 진행 중인 프로젝트 자료를 정리하는 Project_Ongoing 입니다."
        ],
        codeBlock: "afp://air.frum.co.kr",
        keywords: ["서버", "nas", "접속", "주소", "파일", "공유", "아카이브", "폴더", "백업", "자료", "저장소"]
      },
      {
        title: "메일 서명 만들기",
        content: [
            "발급받은 회사 메일 계정으로 로그인 후 다음 과정에 따라 서명을 만들어주세요.",
            "1. [Gmail](https://mail.google.com/) 접속하여 로그인하기",
            "2. **설정** 아이콘 선택 > **모든 설정 보기** 선택",
            "![Settings Icon](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/fc08a6a80f435207881c1679fac997f83388525c2bc5bc4e57b31db3d3f6b51f.png)",
            "3. 서명 항목 텍스트필드에 아래 내용을 복사해 입력해주세요.",
            "[`서명 템플릿 문서 바로가기`](https://docs.google.com/document/d/1nFBXteCI4ZUzkaKYsMgZ5dKH2QgMb-G34xoHjhtgc0g/edit?tab=t.0)",
            "직급/직책, 영문 이름, 휴대폰 번호는 변경하여 입력해주세요.",
            "👉 **직급별 영문 표기법**\n사원: Associate UX Consultant\n선임: UX Consultant\n책임: Sr. UX Consultant\n수석: Chief UX Consultant",
            "![Signature Example](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/b5c191d2a7647ce4bcef2bd40dc2d624434bf5776f0ca1e244074aca7c76175c.png)",
            "4. **변경사항 저장** 버튼을 눌러 저장해주세요."
        ],
        keywords: ["서명", "이메일", "메일", "sign", "명함", "직급", "영문", "지메일", "gmail"]
      }
    ]
  },
  {
    id: ContentType.WELFARE,
    title: "복지 소개",
    icon: Coffee,
    description: "프럼의 복리후생 제도 및 조직 문화 안내",
    subSections: [
      {
        title: "1. 경조 지원 제도",
        content: [
            "**1) 경조 휴가**",
            "아래 경우에 따라 유급 경조 휴가를 제공합니다.",
            "- 본인 결혼: 5일",
            "- 부모(배우자 포함) 회갑·칠순: 1일",
            "- 자녀 결혼: 1일",
            "- 형제자매 결혼: 1일",
            "- 부모(배우자 포함), 배우자, 자녀 사망: 5일",
            "- 조부모, 형제자매 사망: 1일",
            "- 본인 및 배우자 직계족손의 경사·흉사: 1일",
            "- 회사가 필요하다고 인정하는 기타 사유",
            "\n",
            "**2) 경조금 지급**",
            "경조 발생 시 아래 기준에 따라 경조금을 지원합니다.",
            "- 본인 결혼: 100만원",
            "- 본인 부모, 처부모, 배우자, 자녀 사망: 100만원",
            "- 조부모 사망: 30만원"
        ],
        keywords: ["경조사", "결혼", "장례", "사망", "휴가", "지원금", "돈", "부조", "화환", "경조금"]
      },
      {
        title: "2. 장기근속 보상",
        content: [
            "**근속 장려금 및 특별 휴가**",
            "입사일 기준 만 연차에 도달한 월 말에 장려금을 지급하며, 휴가는 해당 연도 안에 사용합니다.",
            "- 3년: 50만원",
            "- 5년: 200만원 + 유급휴가 2주",
            "- 10년: 500만원 + 유급휴가 4주",
            "- 15년: 700만원 + 유급휴가 4주"
        ],
        keywords: ["장기근속", "근속", "포상", "보너스", "안식월", "리프레시", "3년", "5년", "10년"]
      },
      {
        title: "3. 추천 채용 리워드",
        content: [
            "**임직원 추천 보상금**",
            "추천한 인재가 입사 후 6개월 이상 근무 시, 추천자에게 아래와 같이 지급합니다.",
            "- 사원·선임: 50만원",
            "- 책임·수석: 70만원",
            "- 임원: 100만원",
            "👉 ※ 추천자가 신규 입사자의 입사일 기준 6개월 이내 퇴사 시 지급되지 않습니다."
        ],
        keywords: ["채용", "추천", "인재", "보상금", "리워드", "소개"]
      },
      {
        title: "4. 조직 문화 프로그램",
        content: [
            "**1) 프럼 다이닝 (Froom Dining)**",
            "2개월마다 랜덤으로 1인당 최대 10만원의 팀 식사비를 지원합니다.",
            "1. 2개월마다 새로운 조 편성",
            "2. 각 조는 랜덤으로 선정된 조장이 리드",
            "3. 식당·일정 조율",
            "4. 해당 날 카드 수령 → 결제 → 영수증 제출",
            "👉 법인카드 1매 운영 → 타 조와 일정 중복 주의",
            "[자세히 보기](https://docs.google.com/spreadsheets/d/1UVeggMBHTAObqB-F-3Koenxb8oP-87YD-KPK1yg8si4/edit?gid=1304888920#gid=1304888920)",
            "\n",
            "**2) 해피아워 (Happy Hour)**",
            "격주 금요일 오후 진행되는 사내 리프레시 프로그램입니다.",
            "1. 사원·선임 주도 준비",
            "2. 2층 레인보우룸에서 전직원이 함께 참여",
            "3. 간식, 네트워킹, 가벼운 휴식 시간"
        ],
        keywords: ["회식", "점심", "다이닝", "밥", "식사", "해피아워", "간식", "금요일", "문화", "친목"]
      },
      {
        title: "5. 근무 지원 제도",
        content: [
            "**야근 식대 & 택시비 지원**",
            "야근 식대: 1인 15,000원",
            "택시비: 오후 11시 이후 퇴근 시 거리 제한 없이 지원",
            "\n",
            "**청구 방법 (Spendit 앱 사용)**",
            "1. Spendit 가입 → 앱 다운로드",
            "2. 매달 말일에 1개월분 청구",
            "3. Spendit · 지출 > 셀프 > 금액·상호·날짜 등 입력 후 저장",
            "4. 영수증 또는 카드 승인내역 화면 첨부",
            "5. 폴리시는 오한샘 수석에게 요청",
            "6. 보고서 생성 후 제출 (보고서명 예시: 폴리시명-YYYYMMDD-이름)",
            "\n",
            "**관련 가이드**",
            "[`지출 등록 방법(카드 승인 내역)`](https://help.spendit.kr/hc/ko)",
            "[`지출 등록 방법(셀프 등록)`](https://help.spendit.kr/hc/ko)",
            "[`참석자 등록 방법`](https://help.spendit.kr/hc/ko)",
            "[`보고서 작성 및 제출`](https://help.spendit.kr/hc/ko)"
        ],
        keywords: ["야근", "식대", "저녁", "택시", "교통비", "스펜딧", "spendit", "영수증", "청구", "지출", "법인카드", "비용"]
      }
    ]
  },
  {
    id: ContentType.COMMUTE,
    title: "업무 및 휴게시간",
    icon: Clock,
    description: "근무 시간 및 사무실 이용 가이드",
    subSections: [
      {
        title: "업무 시간",
        content: [
            "오전 9:00 - 오후 6:00",
            "업무시간은 프로젝트에 따라 유동적으로 변경되기도 합니다."
        ],
        keywords: ["출근", "퇴근", "시간", "근무", "9시", "6시", "유연"]
      },
      {
        title: "점심 시간",
        content: [
            "오후 12:00 - 오후 1:00",
            "불가피한 업무 및 개인 일정이 있다면 자율적으로 점심 시간을 가질 수 있습니다."
        ],
        keywords: ["점심", "식사", "휴게", "밥", "12시"]
      },
      {
        title: "첫 출근자일때",
        content: [
            "1. 출입 단말기 [세트/경비] 해제 > 지문 인식",
            "2. 이중문 도어락 잠금 해제\n* 은색 바 > 임의 2개 숫자 터치 > 비밀번호 터치 > 은색바 > 잠금 해제",
            "3. 이중문 고정장치 잠금 해제\n* 이중문 왼쪽, 짧은 고정문 측면의 은색 레버 위/아래로 움직여 잠금 해제",
            "4. 출입단말기 지문 인식하여 출근",
            "5. 유리문 옆 스위치 중 가장 위에 있는 스위치 눌러 전체 조명 켜기",
            "6. 탕비실 뒤쪽 에어컨/보일러 스위치 ON"
        ],
        keywords: ["문열기", "오픈", "보안", "지문", "경비", "해제", "도어락", "비밀번호"]
      },
      {
        title: "마지막 퇴근자일때",
        content: [
            "1. 냉/난방기 OFF",
            "2. 모든 창문 닫고 잠금",
            "3. 유리문 옆 스위치 중 가장 위에 있는 스위치 눌러 전체 조명 끄기",
            "4. 이중문 고정장치 잠금\n* 이중문 왼쪽, 짧은 고정문 측면의 은색 레버 위/아래로 움직여 잠금",
            "5. 이중문 도어락 잠금\n* 이중문을 닫으면 자동 잠김",
            "6. 출입단말기 [세트/해제] > 지문 인식 눌러 세트"
        ],
        keywords: ["문잠그기", "마감", "퇴근", "소등", "잠금", "보안", "세트"]
      },
      {
        title: "연차쓰기",
        content: [
            "**연차 종류**",
            "1. 연차: 1일",
            "2. 병가: 1일",
            "3. 오전 반차: 오후 2:00 까지 근무",
            "4. 오후 반차: 오후 2:00 부터 근무",
            "5. 공가: 예비군, 건강검진 등",
            "\n",
            "**연차 사용 방법**",
            "1. 시프티 앱 접속",
            "2. 휴가 메뉴 > 화면 우측 하단 종이비행기 버튼 선택 > 휴가 생성 > 휴가 유형 선택",
            "3. 휴가 사용일자 선택 > 다음 버튼 선택 > 사유 작성 > 보내기 버튼 선택\n* 사유 예시) 건강검진, 예비군, 여름휴가, 겨울휴가, 휴가, 개인사유, 병가 등"
        ],
        keywords: ["휴가", "연차", "반차", "병가", "공가", "예비군", "건강검진", "시프티", "shiftee", "신청", "결재"]
      }
    ]
  },
  {
    id: ContentType.TOOLS,
    title: "업무를 도와주는 툴",
    icon: Laptop,
    description: "업무에 도움이 되는 앱을 다운로드하세요.",
    subSections: [
      {
        title: "Tool List",
        content: `| Name | Type | Comment | Download |
|---|---|---|---|
| Figma | UX | 모든 UX 작업은 Figma를 통해 진행합니다. | [Download](https://www.figma.com/downloads/) |
| Adobe | UX | Creative Cloud를 통해 필요한 툴을 다운로드합니다. | [Download](https://creativecloud.adobe.com/apps/all/desktop) |
| Keka | Zip | Mac에서 파일 압축 시 윈도우 호환성을 위해 사용합니다. | [Download](https://www.keka.io/en/) |
| Slack | 소통 | UX파트의 모든 커뮤니케이션은 Slack을 통해 진행합니다. | [Download](https://slack.com/download) |
| Spendit | 비용관리 | 프럼의 비용 및 지출 관리는 Spendit을 사용합니다. | [Download](https://www.spendit.kr/) |
| Microsoft | 소통 | 클라이언트와의 온라인 미팅 시 사용되는 툴입니다. | [Download](https://www.microsoft.com/ko-kr/microsoft-teams/download-app) |
| Midjourney | UX | 생성형 AI로 에셋을 만들어 시안에 활용합니다. | [Login](https://www.midjourney.com/) |`,
        keywords: ["툴", "앱", "프로그램", "소프트웨어", "설치", "다운로드", "피그마", "슬랙", "어도비", "스펜딧"]
      },
      {
        title: "팀단위로 구독하는 모든 프로그램은 아래 계정으로 로그인 가능합니다. (Figma 제외)",
        content: [
          "👉 해당 계정으로 구독 중인 앱: `midjourney`",
          "- ID: appfrum.test@gmail.com",
          "- PW: 팀원에게 문의"
        ],
        codeBlock: "ID: appfrum.test@gmail.com\nPW: 팀원에게 문의",
        keywords: ["계정", "아이디", "비밀번호", "구독", "공용", "로그인", "미드저니"]
      }
    ]
  },
  {
    id: ContentType.OFFICE_GUIDE,
    title: "기타",
    icon: KeyRound,
    description: "기타 업무 매뉴얼",
    subSections: [
      {
        title: "퀵 보내기",
        content: [
            "1. 퀵으로 서류 및 택배를 보내야 하는 경우, 회사와 제휴된 업체에 연락하여 발송합니다. (1599-7678)",
            "2. 프럼 3층, 오토바이 or 다마스 1대가 필요하다고 가이드를 주세요.\n(오토바이와 다마스의 가격이 다릅니다.)",
            "3. 퀵 보낼 주소 및 받는사람 성함을 알려주세요.",
            "4. 퀵 보낼 물건에 포스트잇으로 아래 정보를 기입해 부착해 주세요",
            "- 주소",
            "- 수신자 성함",
            "- 수신자 전화번호"
        ],
        keywords: ["퀵", "배송", "택배", "우편", "다마스", "오토바이", "운송"]
      }
    ]
  },
  {
    id: ContentType.FAQ,
    title: "FAQ",
    icon: HelpCircle, // 위에서 import에 HelpCircle을 추가했는지 확인하세요!
    description: "자주 묻는 질문과 답변",
    subSections: [
      {
        title: "와이파이 비밀번호 확인",
        content: "사내 와이파이 비밀번호는 `imagination_composer_2018` 입니다. 보안을 위해 외부 유출에 주의해 주세요.",
        keywords: ["와이파이", "wifi", "비밀번호", "무선", "인터넷", "비번", "pw", "password"]
      },
      {
        title: "서버 접속 방법 (NAS)",
        content: "Finder에서 `Command + K`를 누른 후 `afp://air.frum.co.kr` 주소를 입력하여 접속합니다. 아카이빙은 Project_Archive, 진행 중인 프로젝트는 Project_Ongoing 폴더를 이용하세요.",
        keywords: ["서버", "nas", "접속", "주소", "파일", "공유", "아카이브", "폴더"]
      },
      {
        title: "휴가 신청 방법",
        content: "'시프티(Shiftee)' 모바일 앱 또는 웹사이트의 [휴가] 메뉴에서 (+) 버튼을 눌러 신청할 수 있습니다. 사유 작성 후 승인 요청을 보내주세요.",
        keywords: ["휴가", "연차", "반차", "시프티", "shiftee", "신청", "결재"]
      },
      {
        title: "야근 식대 및 택시비 지원",
        content: "야근 식대는 1인당 15,000원까지 지원되며, 택시비는 오후 11시 이후 퇴근 시 거리 제한 없이 지원됩니다. Spendit 앱으로 청구하세요.",
        keywords: ["야근", "식대", "택시비", "교통비", "저녁", "지원", "비용", "청구", "스펜딧"]
      },
      {
        title: "지출 결의 및 영수증 처리",
        content: "법인카드 사용 후 Spendit 앱에서 [지출] > [셀프] 메뉴를 통해 영수증을 첨부하고 내역을 입력하여 결재를 올립니다. 폴리시는 담당자에게 문의하세요.",
        keywords: ["지출", "결의", "영수증", "법인카드", "비용", "청구", "spendit", "카드", "결제"]
      }
    ]
  },
  {
    id: ContentType.GUIDE_EDIT,
    title: "온보딩 가이드 수정 방법",
    icon: Settings,
    description: "온보딩 가이드 수정 및 배포 가이드",
    subSections: [
      {
        title: "① 레포지토리 클론",
        content: [
            "아래 절차를 따라 하면 누구나 온보딩 가이드를 수정하고 자동으로 배포할 수 있습니다.",
            "**터미널에서 아래 명령어 실행:**",
            "```\ngit clone https://github.com/pbgyoeng-tech/frum-guide\ncd frum-guide\nnpm install\nnpm run dev\n```",
            "웹 브라우저에서 `http://localhost:5173` (또는 표시된 URL) 로 접속하면 로컬 개발 화면을 확인할 수 있습니다."
        ]
      },
      {
        title: "② 수정할 파일 편집",
        content: [
            "주로 수정하는 위치는 아래와 같습니다:",
            "- `App.tsx`",
            "- `components/`",
            "- `constants.ts`",
            "- `index.html`",
            "원하는 문구, 이미지, 스타일을 자유롭게 수정하면 됩니다."
        ]
      },
      {
        title: "③ 브랜치 생성",
        content: [
            "새 기능 또는 내용 수정을 위한 브랜치를 만듭니다:",
            "```\ngit checkout -b feat/update-content\n```",
            "브랜치 이름은 자유롭게 변경 가능합니다."
        ]
      },
      {
        title: "④ 변경사항 커밋 & 푸시",
        content: [
            "변경 사항을 저장하고 원격 저장소에 올립니다.",
            "```\ngit add .\ngit commit -m \"Update onboarding content\"\ngit push origin feat/update-content\n```",
            "푸시(Push) 후 GitHub에서 자동으로 Pull Request(PR) 생성 안내 버튼이 보입니다."
        ]
      },
      {
        title: "⑤ Pull Request(PR) 생성",
        content: [
            "GitHub에서 PR을 생성하고 내용을 확인합니다.",
            "- 제목 예: Update onboarding guide content",
            "- 설명 예: “온보딩 가이드의 Welcome 문구 개선”"
        ]
      },
      {
        title: "⑥ PR을 main 브랜치에 Merge",
        content: [
            "**main 브랜치에 보호 규칙이 있는 경우**\n→ 리뷰(Approve)를 받은 뒤 merge 가능합니다.",
            "**보호 규칙이 없다면**\n→ 바로 merge 가능합니다.",
            "merge가 완료되면 코드가 main 브랜치에 반영됩니다."
        ]
      },
      {
        title: "⑦ Vercel 자동 배포",
        content: [
            "main 브랜치가 업데이트되면 Vercel이 자동으로 새 버전을 배포합니다.",
            "- 배포 완료 상태: **Ready** 로 표시",
            "- 실제 반영 URL: https://frum-guide.vercel.app",
            "배포 완료 후 새로고침하면 변경된 온보딩 가이드를 확인할 수 있습니다."
        ]
      }
    ]
  }
];
