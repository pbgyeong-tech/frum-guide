import { db } from './firebase';
import { SectionData, ContentType, EditLog, SubSection, ContentSnapshot } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const COLLECTION_NAME = 'content'; 
const LOG_COLLECTION_NAME = 'edit_logs';

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const ensureUUID = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => ensureUUID(item));
  }
  if (data !== null && typeof data === 'object') {
    const newData = { ...data };
    if ('title' in newData && 'content' in newData && !newData.uuid) {
      newData.uuid = generateUUID();
    }
    Object.keys(newData).forEach(key => {
       if (typeof newData[key] === 'object') {
         newData[key] = ensureUUID(newData[key]);
       }
    });
    return newData;
  }
  return data;
};

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

const sanitizeForDB = (section: SectionData): any => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, ...rest } = section;

  if (rest.children) {
    rest.children = rest.children.map(child => sanitizeForDB(child));
  }

  const withUUID = ensureUUID(rest);
  return removeUndefined(withUUID);
};

const restoreFromDB = (data: any, originalSection?: SectionData): SectionData => {
  const icon = originalSection?.icon || HANDBOOK_CONTENT[0].icon;
  const dataWithUUID = ensureUUID(data);

  const restored: SectionData = { 
    ...originalSection, 
    ...dataWithUUID,    
    icon 
  };

  if (restored.children) {
    restored.children = restored.children.map((child: any) => restoreFromDB(child));
  }

  return restored;
};

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

export const saveContent = async (content: SectionData): Promise<void> => {
  try {
    if (!content.id) throw new Error("Section ID is missing");
    const dataToSave = sanitizeForDB(content);
    await db.collection(COLLECTION_NAME).doc(content.id).set(dataToSave, { merge: true });
    console.log(`[DB] Content saved for document ID: ${content.id}`);
  } catch (error) {
    console.error(`[DB] Error saving document ${content.id}: `, error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    console.log(`Document ${id} successfully deleted!`);
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
};

// [LOG] 편집 로그 저장 (날짜 포맷 포함)
export const addEditLog = async (log: Omit<EditLog, 'id'>) => {
  try {
    const readableDate = new Date(log.timestamp).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const logWithDate = {
      ...log,
      formatted_date: readableDate
    };

    // 1. undefined 값 제거 (기본 JS 객체만 처리)
    const cleanLog = removeUndefined(logWithDate);

    // 2. 서버 타임스탬프 추가 (removeUndefined 이후에 추가하여 객체 깨짐 방지)
    // Firestore의 serverTimestamp()는 특수 객체(Sentinel)라 가공하면 안 됩니다.
    cleanLog.server_timestamp = firebase.firestore.FieldValue.serverTimestamp();

    // 3. 저장 및 Document Reference 획득
    const docRef = await db.collection(LOG_COLLECTION_NAME).add(cleanLog);
    
    // 4. 생성된 문서 ID를 콘솔에 출력 (디버깅용)
    console.log(`✅ Edit log saved successfully! Doc ID: ${docRef.id}, Time: ${readableDate}`);

  } catch (e) {
    console.error("❌ Failed to add edit log", e);
  }
};

export const seedDB = async (): Promise<SectionData[]> => {
  try {
    const querySnapshot = await db.collection(COLLECTION_NAME).get();
    const dbMap = new Map<string, SectionData>();

    querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
      dbMap.set(doc.id, doc.data() as SectionData);
    });

    console.log(`[DB] Loaded ${dbMap.size} documents from Firestore.`);

    const mergedData = HANDBOOK_CONTENT.map(localSection => {
      const dbData = dbMap.get(localSection.id);

      if (dbData) {
        return restoreFromDB(dbData, localSection);
      } else {
        const withUUID = ensureUUID(localSection);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { icon, ...rest } = withUUID;
        return { ...localSection, ...rest };
      }
    });

    return mergedData;

  } catch (error) {
    console.error("[DB] Connection Failed or Error:", error);
    return HANDBOOK_CONTENT.map(s => ensureUUID(s));
  }
};

export const resetToDefault = async (sectionId: ContentType): Promise<void> => {
  try {
    const originalSection = findLocalSection(sectionId, HANDBOOK_CONTENT);
    if (!originalSection) throw new Error("Original section data not found");

    const cleanData = sanitizeForDB(originalSection);
    await db.collection(COLLECTION_NAME).doc(sectionId).set(cleanData);

    console.log(`Reset completed for ${sectionId}`);
  } catch (error) {
    console.error("Error resetting document:", error);
    throw error;
  }
};