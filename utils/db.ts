
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { SectionData } from '../types';
import { HANDBOOK_CONTENT } from '../constants';

const COLLECTION_NAME = 'content';

// Helper to remove icon (function/component) before saving to Firestore
const sanitizeForDB = (section: SectionData): any => {
  const { icon, ...rest } = section;
  // If children exist, sanitize them too
  if (rest.children) {
    rest.children = rest.children.map(child => sanitizeForDB(child));
  }
  return rest;
};

// Helper to restore icon from local constants (matching by ID)
const restoreFromDB = (data: any): SectionData => {
  const localSection = findLocalSection(data.id, HANDBOOK_CONTENT);
  const icon = localSection?.icon || HANDBOOK_CONTENT[0].icon; // Fallback icon

  const restored: SectionData = { ...data, icon };
  
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

export const saveContent = async (content: SectionData): Promise<void> => {
  try {
    const dataToSave = sanitizeForDB(content);
    await setDoc(doc(db, COLLECTION_NAME, content.id), dataToSave);
  } catch (error) {
    console.error("Error saving document to Firebase: ", error);
    throw error;
  }
};

export const seedDB = async (): Promise<SectionData[]> => {
  // Check if DB is already populated
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  
  if (querySnapshot.empty) {
    console.log("Seeding Firebase Database...");
    const batch = writeBatch(db);
    
    for (const section of HANDBOOK_CONTENT) {
      const docRef = doc(db, COLLECTION_NAME, section.id);
      batch.set(docRef, sanitizeForDB(section));
    }
    
    await batch.commit();
    return HANDBOOK_CONTENT;
  } else {
    // Return existing data
    const data: SectionData[] = [];
    querySnapshot.forEach((doc) => {
      data.push(restoreFromDB(doc.data()));
    });
    return data;
  }
};
