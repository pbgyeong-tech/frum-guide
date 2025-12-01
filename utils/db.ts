import { db } from './firebase';
import { collection, getDocs, doc, setDoc, writeBatch, deleteDoc, addDoc } from 'firebase/firestore';
import { SectionData, ContentType, EditLog, SubSection, ContentSnapshot } from '../types';
import { HANDBOOK_CONTENT } from '../constants';

const COLLECTION_NAME = 'content';
const LOG_COLLECTION_NAME = 'edit_logs';

// Simple UUID generator fallback
const generateUUID = () => {
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
    if ('title' in newData && 'content' in newData && !newData.uuid) {
      newData.uuid = generateUUID();
    }

    // Recursively check properties
    Object.keys(newData).forEach(key => {
       if (typeof newData[key] === 'object') {
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
const restoreFromDB = (data: any): SectionData => {
  const localSection = findLocalSection(data.id, HANDBOOK_CONTENT);
  const icon = localSection?.icon || HANDBOOK_CONTENT[0].icon;

  // 데이터 로드 시에도 UUID가 혹시 없으면 부여 (방어 코드)
  const dataWithUUID = ensureUUID(data);

  const restored: SectionData = { ...dataWithUUID, icon };
  
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

// [UPDATE/CREATE] 특정 섹션의 콘텐츠 저장하기
export const saveContent = async (content: SectionData): Promise<void> => {
  try {
    const dataToSave = sanitizeForDB(content);
    await setDoc(doc(db, COLLECTION_NAME, content.id), dataToSave);
    console.log(`Content saved for ${content.id}`);
  } catch (error) {
    console.error("Error saving document to Firebase: ", error);
    throw error;
  }
};

// [DELETE] 전체 섹션 문서 삭제하기
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log(`Document ${id} successfully deleted!`);
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};

// [LOG] 편집 로그 저장
export const addEditLog = async (log: Omit<EditLog, 'id'>) => {
  try {
    // Note: We use the generic log object here, which now includes the 'details' object 
    // with before/after state as defined in types.ts.
    // Firestore handles nested objects automatically.
    const cleanLog = removeUndefined(log);
    await addDoc(collection(db, LOG_COLLECTION_NAME), cleanLog);
    console.log("Edit log saved");
  } catch (e) {
    console.error("Failed to add edit log", e);
  }
};

// [RESET] 초기 데이터로 강제 복구
export const resetToDefault = async (sectionId: ContentType): Promise<void> => {
  try {
    const originalSection = findLocalSection(sectionId, HANDBOOK_CONTENT);
    if (!originalSection) throw new Error("Original section data not found");
    
    // Sanitize and ensure UUIDs are fresh or consistent
    const cleanData = sanitizeForDB(originalSection);
    
    // Overwrite the document completely
    await setDoc(doc(db, COLLECTION_NAME, sectionId), cleanData);
    console.log(`Reset completed for ${sectionId}`);
  } catch (error) {
    console.error("Error resetting document:", error);
    throw error;
  }
};

// [INIT] 초기 데이터 시딩
export const seedDB = async (): Promise<SectionData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    // Only seed if strictly empty (no documents at all)
    if (querySnapshot.empty) {
      console.log("Database empty. Seeding initial data...");
      const batch = writeBatch(db);
      
      for (const section of HANDBOOK_CONTENT) {
        const docRef = doc(db, COLLECTION_NAME, section.id);
        const cleanData = sanitizeForDB(section); // UUID injected here
        batch.set(docRef, cleanData);
      }
      
      await batch.commit();
      
      // Return seeded data (with generated UUIDs)
      return HANDBOOK_CONTENT.map(section => {
        const withUUID = ensureUUID(section);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { icon, ...rest } = withUUID;
        return { ...section, ...rest };
      });
    } else {
      // Data exists, return the fetched data directly
      const data: SectionData[] = [];
      querySnapshot.forEach((doc) => {
        data.push(restoreFromDB(doc.data()));
      });
      return data;
    }
  } catch (error) {
    console.error("DB Connection Failed (Check Firestore Rules):", error);
    // Return local content for fallback display only. 
    // Since auto-save is removed from ContentRenderer, this will NOT overwrite DB.
    return HANDBOOK_CONTENT.map(s => {
       const withUUID = ensureUUID(s);
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const { icon, ...rest } = withUUID;
       return { ...s, ...rest };
    });
  }
};