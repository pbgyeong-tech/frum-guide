import { db } from './firebase';
import { SectionData, ContentType, EditLog, SubSection, ContentSnapshot } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const COLLECTION_NAME = 'content'; // "handbook" 대신 기존 컬렉션명 유지하되 로직 강화
const LOG_COLLECTION_NAME = 'edit_logs';

// Simple UUID generator fallback
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper: Ensure every subsection has a UUID
const ensureUUID = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => ensureUUID(item));
  }
  if (data !== null && typeof data === 'object') {
    const newData = { ...data };
    
    // If it's a subsection object (has title/content), ensure UUID
    if ('title' in newData && 'content' in newData) {
       if (!newData.uuid) {
         newData.uuid = generateUUID();
       }
    }

    // Recursively check properties
    Object.keys(newData).forEach(key => {
       if (typeof newData[key] === 'object' && newData[key] !== null) {
         newData[key] = ensureUUID(newData[key]);
       }
    });
    return newData;
  }
  return data;
};

// Helper: 객체에서 undefined 값을 재귀적으로 제거 (Firestore 에러 방지)
const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => removeUndefined(v));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefined(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

// Firestore는 함수(아이콘 컴포넌트 등)를 저장할 수 없으므로 제거 후 저장
const sanitizeForDB = (section: SectionData): any => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, ...rest } = section;
  
  // 하위 항목이 있다면 재귀적으로 아이콘 제거
  if (rest.children) {
    rest.children = rest.children.map(child => sanitizeForDB(child));
  }
  
  // UUID 보장 및 undefined 제거
  const withUUID = ensureUUID(rest);
  return removeUndefined(withUUID);
};

// Firestore에서 불러온 데이터에 로컬 아이콘을 다시 연결
const restoreFromDB = (data: any, originalSection?: SectionData): SectionData => {
  const icon = originalSection?.icon || HANDBOOK_CONTENT[0].icon;

  // 데이터 로드 시에도 UUID가 혹시 없으면 부여 (방어 코드)
  const dataWithUUID = ensureUUID(data);

  // 로컬 구조(icon 등)와 DB 데이터를 병합
  const restored: SectionData = { 
    ...originalSection, // 로컬 상수(아이콘 등) 우선 적용
    ...dataWithUUID,    // DB 데이터(내용) 덮어쓰기
    icon 
  };
  
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

// [UPDATE/CREATE] 특정 섹션의 콘텐츠 저장하기
// section.id를 Firestore Document ID로 사용하여 명확히 매핑
export const saveContent = async (content: SectionData): Promise<void> => {
  try {
    if (!content.id) throw new Error("Section ID is missing");

    const dataToSave = sanitizeForDB(content);
    // Use section.id as the Document ID. Merge true to update safely.
    await db.collection(COLLECTION_NAME).doc(content.id).set(dataToSave, { merge: true });
    
    console.log(`[DB] Content saved for document ID: ${content.id}`);
  } catch (error) {
    console.error(`[DB] Error saving document ${content.id}: `, error);
    throw error;
  }
};

// [DELETE] 전체 섹션 문서 삭제하기
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    console.log(`Document ${id} successfully deleted!`);
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};

// [LOG] 편집 로그 저장
export const addEditLog = async (log: Omit<EditLog, 'id'>) => {
  try {
    const cleanLog = removeUndefined(log);
    await db.collection(LOG_COLLECTION_NAME).add(cleanLog);
    console.log("Edit log saved");
  } catch (e) {
    console.error("Failed to add edit log", e);
  }
};

// [INIT] 데이터 로드 및 초기화 (Seed + Fetch)
// 로컬 상수를 기반으로 DB 데이터를 병합하여 반환
export const seedDB = async (): Promise<SectionData[]> => {
  try {
    // 1. Get all documents from Firestore
    const querySnapshot = await db.collection(COLLECTION_NAME).get();
    
    // 2. Create a Map for O(1) lookup
    const dbMap = new Map<string, SectionData>();
    querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
      // Document ID is the key
      dbMap.set(doc.id, doc.data() as SectionData);
    });

    console.log(`[DB] Loaded ${dbMap.size} documents from Firestore.`);

    // 3. Merge Local Constants with DB Data
    const mergedData = HANDBOOK_CONTENT.map(localSection => {
      const dbData = dbMap.get(localSection.id);
      let result;

      if (dbData) {
        // If DB has data, use it (restoring icons from local)
        result = restoreFromDB(dbData, localSection);
      } else {
        // If DB missing, use local
        result = { ...localSection };
      }
      
      // Ensure UUIDs exist on the final merged result
      return ensureUUID(result);
    });

    return mergedData;
  } catch (error) {
    console.error("[DB] Connection Failed or Error:", error);
    // Fallback to local
    return HANDBOOK_CONTENT.map(s => ensureUUID(s));
  }
};

// [RESET] 초기 데이터로 강제 복구
export const resetToDefault = async (sectionId: ContentType): Promise<void> => {
  try {
    const originalSection = findLocalSection(sectionId, HANDBOOK_CONTENT);
    if (!originalSection) throw new Error("Original section data not found");
    
    // Sanitize and ensure UUIDs are fresh
    const cleanData = sanitizeForDB(originalSection);
    
    // Overwrite the document completely using ID
    await db.collection(COLLECTION_NAME).doc(sectionId).set(cleanData);
    console.log(`Reset completed for ${sectionId}`);
  } catch (error) {
    console.error("Error resetting document:", error);
    throw error;
  }
};