import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "secondary_service";

function arrayToRowObjects(data: any[][]) {
  return data.map((row) => {
    const obj: Record<string, any> = {};
    row.forEach((cell, idx) => {
      obj[`col${idx}`] = cell;
    });
    return obj;
  });
}

export async function saveSecondaryServiceData(data: any[][]) {
  const rowObjects = arrayToRowObjects(data);
  return await addDoc(collection(db, COLLECTION_NAME), {
    data: rowObjects,
    updatedAt: new Date().toISOString(),
  });
}

export async function getSecondaryServiceData() {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  let docs: any[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  docs = docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return docs[0] || null;
}

export async function updateSecondaryServiceData(id: string, data: any[][]) {
  const rowObjects = arrayToRowObjects(data);
  return await updateDoc(doc(db, COLLECTION_NAME, id), {
    data: rowObjects,
    updatedAt: new Date().toISOString(),
  });
}
