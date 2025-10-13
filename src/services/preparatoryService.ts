import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "preparatory_service";

// Convert 2D array to array of row objects for Firestore
function arrayToRowObjects(data: any[][]) {
  return data.map((row) => {
    const obj: Record<string, any> = {};
    row.forEach((cell, idx) => {
      obj[`col${idx}`] = cell;
    });
    return obj;
  });
}

export async function savePreparatoryServiceData(data: any[][]) {
  const rowObjects = arrayToRowObjects(data);
  return await addDoc(collection(db, COLLECTION_NAME), {
    data: rowObjects,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPreparatoryServiceData() {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  let docs: any[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  docs = docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return docs[0] || null;
}

export async function updatePreparatoryServiceData(id: string, data: any[][]) {
  const rowObjects = arrayToRowObjects(data);
  return await updateDoc(doc(db, COLLECTION_NAME, id), {
    data: rowObjects,
    updatedAt: new Date().toISOString(),
  });
}
