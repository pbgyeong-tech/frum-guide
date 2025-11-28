
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { SectionData } from '../types';
import { HANDBOOK_CONTENT } from '../constants';

const COLLECTION_NAME = 'content';

// Firestore는 함수(아이콘 컴포넌트 등)를 저장할 수 없으므로 제거 후 저장
const sanitizeForDB = (section: SectionData): any => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, ...rest } = section;
  // 하위 항목이 있다면 재귀적으로 아이콘 제거
  if (rest.children) {
    rest.children = rest.children.map(child => sanitizeForDB(child));
  }
  return rest;
};

// Firestore에서 불러온 데이터에 로컬 아이콘을 다시 연결
const restoreFromDB = (data: any): SectionData => {
  const localSection = findLocalSection(data.id, HANDBOOK_CONTENT);
  const icon = localSection?.icon || HANDBOOK_CONTENT[0].icon; // 아이콘이 없으면 기본값 사용

  const restored: SectionData = { ...data, icon };
  
  if (restored.children) {
    restored.children = restored.children.map((child: any) => restoreFromDB(child));
  }
  return restored;
};

// ID로 로컬 상수를 찾는 헬퍼 함수
const findLocalSection = (id: string, list: SectionData[]): SectionData | undefined => {
  for (const item of list) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findLocalSection(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

// [READ] 모든 콘텐츠 불러오기
export const getAllContent = async (): Promise<SectionData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const data: SectionData[] = [];
    querySnapshot.forEach((doc) => {
      data.push(restoreFromDB(doc.data()));
    });
    return data;
  } catch (error) {
    console.error("Error getting documents from Firebase: ", error);
    return [];
  }
};

// [UPDATE/CREATE/DELETE] 특정 섹션의 콘텐츠 저장하기
// 삭제나 수정도 결국 배열 전체를 다시 저장하는 방식(setDoc)을 사용합니다.
export const saveContent = async (content: SectionData): Promise<void> => {
  try {
    const dataToSave = sanitizeForDB(content);
    // 문서를 덮어씁니다 (ID 기준)
    await setDoc(doc(db, COLLECTION_NAME, content.id), dataToSave);
    console.log(`Content saved for ${content.id}`);
  } catch (error) {
    console.error("Error saving document to Firebase: ", error);
    throw error;
  }
};

// [INIT] 초기 데이터 시딩 (DB가 비어있을 경우에만 실행)
export const seedDB = async (): Promise<SectionData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    if (querySnapshot.empty) {
      console.log("Database empty. Seeding initial data...");
      const batch = writeBatch(db);
      
      for (const section of HANDBOOK_CONTENT) {
        const docRef = doc(db, COLLECTION_NAME, section.id);
        batch.set(docRef, sanitizeForDB(section));
      }
      
      await batch.commit();
      return HANDBOOK_CONTENT;
    } else {
      // 이미 데이터가 있으면 DB 데이터 반환
      const data: SectionData[] = [];
      querySnapshot.forEach((doc) => {
        data.push(restoreFromDB(doc.data()));
      });
      return data;
    }
  } catch (error) {
    console.error("DB Connection Failed (Check Firestore Rules):", error);
    // 에러 발생 시 로컬 데이터 반환하여 앱이 멈추지 않게 함
    return HANDBOOK_CONTENT;
  }
};
