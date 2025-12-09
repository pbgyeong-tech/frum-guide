import { 
  Home, 
  Wifi, 
  Users, 
  Coffee, 
  Laptop, 
  Building2,
  Clock,
  KeyRound,
  HelpCircle,
  Briefcase,
  Settings,
  CreditCard
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
    id: ContentType.COMPANY,
    title: "회사 소개",
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
            "• 라운지: 프러머 모두가 자유롭게 앉아 쉴 수 있는 공간입니다.",
            "• 회의실: 층별 회의실에서 자유롭게 회의를 진행할 수 있으며, 점심시간에는 식사 공간으로도 이용됩니다.",
            "  - 3F Cloud, 2F Hill: 회의실 옆 창고에서 음료, 휴지, 물티슈, 마스크 등의 물품을 이용할 수 있습니다.",
            "  - 2F Rainbow: 가장 큰 회의실로, 프러머와 함께하는 행사나 모임이 진행되는 공간입니다.",
            "• 탕비실: 커피머신, 정수기, 전자레인지, 비상약 등을 이용할 수 있는 공간이 있으며, 2층 탕비실에는 매달 간식이 제공됩니다.",
            "  - 탕비실 캐비넷에 커피 원두와 상비약이 구비되어 있습니다.",
            "  - 각 층 싱크대에는 커피 찌꺼기 및 음식물 찌꺼기 전용 통이 마련되어 있습니다.",
            "• 화장실: 세면대 아래에 양치도구 및 파우치를 보관할 수 있는 공간이 있습니다.",
            "• 인쇄실: 인쇄, 파쇄 및 노트, 펜, 테이프, 칼 등의 사무용품을 이용할 수 있는 공간입니다.",
            "  - 인쇄실 상단 캐비넷에 사무용품이 구비되어 있습니다.",
            "  - 3F 인쇄실 옆 실외기실에서 냉/난방을 On/Off할 수 있습니다."
        ],
        keywords: ["회의실", "화장실", "탕비실", "간식", "커피", "프린트", "인쇄", "위치", "자리", "약", "비상약", "전자레인지", "라운지", "클라우드", "레인보우"]
      }
    ]
  },
  {
    id: ContentType.IT_SETUP,
    title: "업무 시작 가이드",
    icon: Wifi,
    description: "무선네트워크 연결과 이메일 설정",
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
            "![Signature Example](https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/b5c191d2a7647ce4bcef2bd40dc2d624434bf5776f0ca1e244074aca7c76175c.png)",
            "4. **변경사항 저장** 버튼을 눌러 저장해주세요."
        ],
        disclaimer: "**직급별 영문 표기법**\n사원: Associate UX Consultant\n선임: UX Consultant\n책임: Sr. UX Consultant\n수석: Chief UX Consultant",
        keywords: ["서명", "이메일", "메일", "sign", "명함", "직급", "영문", "지메일", "gmail"]
      }
    ]
  },
  {
    id: ContentType.WELFARE,
    title: "복지 & 혜택",
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
            "- 임원: 100만원"
        ],
        disclaimer: "※ 추천자가 신규 입사자의 입사일 기준 6개월 이내 퇴사 시 지급되지 않습니다.",
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
            "[자세히 보기](https://docs.google.com/spreadsheets/d/1UVeggMBHTAObqB-F-3Koenxb8oP-87YD-KPK1yg8si4/edit?gid=1304888920#gid=1304888920)",
            "\n",
            "**2) 해피아워 (Happy Hour)**",
            "격주 금요일 오후 진행되는 사내 리프레시 프로그램입니다.",
            "1. 사원·선임 주도 준비",
            "2. 2층 레인보우룸에서 전직원이 함께 참여",
            "3. 간식, 네트워킹, 가벼운 휴식 시간"
        ],
        disclaimer: "법인카드 1매 운영 → 타 조와 일정 중복 주의",
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
    id: ContentType.CULTURE,
    title: "일하는 문화",
    icon: Users,
    description: "프럼의 조직 문화 프로그램",
    subSections: [
      {
        title: "4. 조직 문화 프로그램",
        content: [
            "**1) 프럼 다이닝 (Froom Dining)**",
            "2개월마다 랜덤으로 1인당 최대 10만원의 팀 식사비를 지원합니다.",
            "1. 2개월마다 새로운 조 편성",
            "2. 각 조는 랜덤으로 선정된 조장이 리드",
            "3. 식당·일정 조율",
            "4. 해당 날 카드 수령 → 결제 → 영수증 제출",
            "[자세히 보기](https://docs.google.com/spreadsheets/d/1UVeggMBHTAObqB-F-3Koenxb8oP-87YD-KPK1yg8si4/edit?gid=1304888920#gid=1304888920)",
            "\n",
            "**2) 해피아워 (Happy Hour)**",
            "격주 금요일 오후 진행되는 사내 리프레시 프로그램입니다.",
            "1. 사원·선임 주도 준비",
            "2. 2층 레인보우룸에서 전직원이 함께 참여",
            "3. 간식, 네트워킹, 가벼운 휴식 시간"
        ],
        disclaimer: "법인카드 1매 운영 → 타 조와 일정 중복 주의",
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
    title: "근무 제도",
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
    id: ContentType.EXPENSE,
    title: "비용 처리 안내",
    icon: CreditCard,
    description: "경비 처리 및 법인카드 사용 가이드",
    subSections: [
      {
        uuid: "expense-1",
        title: "1. 법인카드 사용 규정",
        content: [
          "**1) 식대 한도**",
          "- 점심 식대: 1인 12,000원",
          "- 야근 식대: 1인 15,000원 (오후 7시 이후 사용)",
          "- 회식비: 인당 50,000원 (사전 품의 필요)",
          "\n",
          "**2) 사용 제한**",
          "- 유흥업소, 골프장, 노래방 등 업무와 무관한 업종 사용 금지",
          "- 심야 시간(23시~06시) 및 휴일 사용 시 사유서 제출 필수",
          "- 상품권 구매 금지"
        ],
        keywords: ["법인카드", "한도", "식대", "야근", "주말", "규정", "회식", "제한"]
      },
      {
        uuid: "expense-2",
        title: "2. 지출 결의 프로세스 (Spendit)",
        content: [
          "**1) 영수증 제출 기한**",
          "- 법인카드 사용 내역은 사용일 기준 5일 이내 Spendit 앱에 등록해야 합니다.",
          "- 매월 말일 17:00까지 해당 월의 모든 지출 내역 제출을 완료해주세요.",
          "\n",
          "**2) 등록 방법**",
          "1. Spendit 앱 실행 > '지출' 탭 선택",
          "2. 카드 사용 내역 선택 (자동 연동됨)",
          "3. 적요(사용 목적) 및 참석자 상세 기입",
          "4. '제출' 버튼 클릭하여 결재 상신"
        ],
        disclaimer: "영수증 실물은 별도 보관할 필요 없이, 앱 내 사진 첨부로 갈음합니다.",
        keywords: ["지출결의", "스펜딧", "Spendit", "영수증", "마감", "결재", "경비"]
      }
    ]
  },
  {
    id: ContentType.TOOLS,
    title: "업무 도구",
    icon: Laptop,
    description: "업무에 도움이 되는 앱 다운로드",
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
          "- ID: appfrum.test@gmail.com",
          "- PW: 팀원에게 문의"
        ],
        codeBlock: "ID: appfrum.test@gmail.com\nPW: 팀원에게 문의",
        disclaimer: "해당 계정으로 구독 중인 앱: `midjourney`",
        keywords: ["계정", "아이디", "비밀번호", "구독", "공용", "로그인", "미드저니"]
      }
    ]
  },
  {
    id: ContentType.OFFICE_GUIDE,
    title: "기타 안내",
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
    icon: HelpCircle,
    description: "자주 묻는 질문을 확인해보세요",
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
  }
];