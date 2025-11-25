
import { 
  Home, 
  Wifi, 
  Users, 
  Coffee, 
  Laptop, 
  Building2,
  Clock,
  KeyRound
} from 'lucide-react';
import { SectionData, ContentType } from './types';

export const COMPANY_NAME = "FRUM";

export const HANDBOOK_CONTENT: SectionData[] = [
  {
    id: ContentType.WELCOME,
    title: "Welcome",
    icon: Home,
    description: "",
    // Premium abstract dark neon fluid motion style (Futuristic/Tech/Luxury)
    heroVideo: "https://cdn.midjourney.com/video/efa8c7dd-863a-49ed-95b7-a04d94a5bd87/3.mp4",
    subSections: [
      {
        title: "Onboarding Strategy",
        content: "Frum의 여정에 합류하신 것을 환영합니다. 본 가이드는 새로운 구성원이 조직의 문화·업무 방식·협업 구조를 빠르게 이해하도록 돕는 Roadmap입니다."
      }
    ]
  },
  {
    id: ContentType.COMPANY,
    title: "회사소개",
    icon: Building2,
    description: "프럼의 비즈니스 영역과 사무실 안내",
    subSections: [
      {
        title: "회사 소개",
        imagePlaceholder: "https://www.frum.co.kr/_next/image?url=%2Fimages%2Fabout-frum.jpg&w=3840&q=75",
        content: [
            "안녕하세요. 👋",
            "프럼은 디지털 에이전시로 UX 컨설팅 및 마케팅, 콘텐츠 발행, 사이트 운영 작업을 진행합니다. 주요 클라이언트는 현대자동차그룹, 삼성, LG등이 있으며 모빌리티 관련 프로젝트가 많습니다.",
            "결과물은 반응형 웹으로 제작(PC, Tablet, Mobile)되는 경우가 많아 디바이스별 해상도에 대한 이해가 필요합니다.",
            "[프럼 웹사이트에서 자세히 알아보기 >](https://www.frum.co.kr/ko/about)"
        ]
      },
      {
        title: "프럼의 사업부를 소개할게요.",
        content: [
            "1. 경영 관리 그룹",
            "2. 크리에이티브 컨설팅 사업부",
            "3. 스페이스 마케팅 사업부",
            "4. 마케팅 & 캠페인 사업부",
            "5. 플랫폼 운영 사업부",
            "6. 크리에이티브 솔루션 센터 `UX팀 소속`",
            "7. 콘텐츠 솔루션 센터",
            "[프럼 웹사이트에서 자세히 알아보기 >](https://www.frum.co.kr/ko/services)"
        ]
      },
      {
        title: "사무실은 이렇게 구성되어 있어요.",
        content: [
            "- 2층: 마케팅 & 캠페인 사업부, 플랫폼 운영 사업부, 크리에이티브 솔루션 센터, 콘텐츠 솔루션 센터",
            "- 3층: 경영 관리 그룹, 크리에이티브 컨설팅 사업부, 스페이스 마케팅 사업부, 크리에이티브 솔루션 센터, 콘텐츠 솔루션 센터",
            "- 회의실: 층별 회의실에서 자유롭게 회의를 진행하며, 점심시간에는 회의실에서 식사를 합니다.",
            "- 탕비실: 커피머신, 정수기, 전자레인지, 비상약을 이용할 수 있으며 2층 탕비실에 매달 간식이 들어옵니다.",
            "- 화장실: 세면대 아래에 양치도구 및 파우치를 보관할 수 있는 공간이 있습니다.",
            "- 인쇄실: 인쇄, 파쇄 및 노트, 펜, 테이프, 칼 등의 사무용품을 이용할 수 있는 공간입니다."
        ]
      }
    ]
  },
  {
    id: ContentType.IT_SETUP,
    title: "Security & Access",
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
        imagePlaceholder: "https://s.mj.run/_p_io4VsXxk"
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
        codeBlock: "afp://air.frum.co.kr"
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
            "![Signature Template](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/b1d6838badd161abe8c5e10a1cc28f423047a6deeee85849631c6092374911ec.png)",
            "직급/직책, 영문 이름, 휴대폰 번호는 변경하여 입력해주세요.",
            "👉 **직급별 영문 표기법**\n사원: Associate UX Consultant\n선임: UX Consultant\n책임: Sr. UX Consultant\n수석: Chief UX Consultant",
            "![Signature Example](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/b5c191d2a7647ce4bcef2bd40dc2d624434bf5776f0ca1e244074aca7c76175c.png)",
            "4. **변경사항 저장** 버튼을 눌러 저장해주세요."
        ]
      }
    ]
  },
  {
    id: ContentType.UX_PART,
    title: "UX 파트소개",
    icon: Users,
    description: "Creative Solution Center UX Team & Process",
    subSections: [
      {
        title: "팀 소개",
        content: "저희는 크리에이티브 솔루션 센터 소속으로 UX의 혁신을 이끌고 있습니다!"
      },
      {
        title: "팀은 이렇게 구성되어 있어요",
        content: `| 이름 | 직급 | 이메일 |
|---|---|---|
| 최영진 | 책임 | yj.choi@frum.co.kr |
| 박보경 | 책임 | bg.park@frum.co.kr |
| 김초은 | 선임 | ce.kim@frum.co.kr |
| 허가람 | 선임 | gr.heo@frum.co.kr |
| 경유진 | 선임 | yj.kyoung@frum.co.kr |
| 김혜진 | 사원 | hj.kim@frum.co.kr |
| 장우조 | 사원 | wj.jang@frum.co.kr |`
      },
      {
        title: "1. 일하는 원칙 (Work Principles)",
        content: [
            "모든 프로젝트는 아래 네 가지 기준을 중심으로 운영됩니다.",
            "**① 문제를 정확히 정의하는 것부터 시작합니다.**\n무조건 디자인부터 하지 않습니다. RFP와 요구사항 분석 → 벤치마킹 → User Flow로 문제와 목표를 명확히 구조화한 후 다음 단계로 이동합니다.",
            "**② 근거 기반의 의사결정을 합니다.**\n벤치마킹은 Global Top 100을 중심으로 심층 분석하며, 기획·디자인·개발 모든 단계에서 “왜 이렇게 결정했는가”를 명확히 설명할 수 있도록 자료화합니다.",
            "**③ 팀 간 협업을 우선합니다.**\n기획–디자인–개발 전 과정이 분리되지 않도록 WBS, 화면 설계서, Annotation을 기준으로 동일한 정보를 공유하며 진행합니다.",
            "**④ 완성도와 일관성을 중요하게 생각합니다.**\n디자인 시스템, UI 에셋, QA/QC 체크리스트를 기반으로 최종 산출물의 일관성, 정확성, 브랜드 정합성을 가장 중요하게 봅니다."
        ]
      },
      {
        title: "2. 프로젝트 진행 프로세스 (Workflow)",
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
        ]
      },
      {
        title: "3. 주요 산출물 (Deliverables)",
        content: [
            "**① WBS (Work Breakdown Structure)**\n프로젝트 전체 작업 구조를 세분화한 문서\n일정 공유, 리소스 산정, 우선순위 관리의 기준",
            "**② 요구사항 정의서 (Requirement Document)**\n프로젝트 목적, 기능 범위, 비기능 요구사항 포함\n모든 단계에서 “합의된 기준점” 역할",
            "**③ 화면명세서 (Screen Specification)**\n화면 구성, 기능 설명, 예외 처리, 동작 흐름을 상세히 기재",
            "**④ 회의록 (Meeting Minutes)**\n논의 내용, 결정 사항, 후속 조치를 명확히 기록\n변경 이력 및 책임 소재를 추적하는 공식 문서",
            "**⑤ 화면 디자인 (Figma Original + PNG)**\n메뉴별 최종 화면 디자인\n레이아웃, 스타일, 컴포넌트가 반영된 원본 산출물",
            "**⑥ 화면 설계서 (Wireframe + Annotation)**\n화면 단위 기능·위치·행동을 기획 관점에서 정리\n개발·QA 기준 문서로 활용",
            "**⑦ 디자인 가이드**\n브랜드·UI 시스템·반응형 기준 등 시각적 명세"
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
      },
      {
        title: "점심 시간",
        content: [
            "오후 12:00 - 오후 1:00",
            "불가피한 업무 및 개인 일정이 있다면 자율적으로 점심 시간을 가질 수 있습니다."
        ]
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
        ]
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
        ]
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
        ]
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
| Midjourney | UX | 생성형 AI로 에셋을 만들어 시안에 활용합니다. | [Login](https://www.midjourney.com/) |`
      },
      {
        title: "팀단위로 구독하는 모든 프로그램은 아래 계정으로 로그인 가능합니다. (Figma 제외)",
        content: [
          "👉 해당 계정으로 구독 중인 앱: `midjourney`",
          "- ID: appfrum.test@gmail.com",
          "- PW: Frum123$"
        ],
        codeBlock: "ID: appfrum.test@gmail.com\nPW: Frum123$"
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
        ]
      }
    ]
  }
];
