import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAINTENANCE_DOC = 'maintenance';
const MAINTENANCE_COLLECTION = 'config';

export async function getMaintenanceMode(): Promise<boolean> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, MAINTENANCE_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return !!docSnap.data().enabled;
  }
  return false;
}

export async function setMaintenanceMode(enabled: boolean): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, MAINTENANCE_DOC);
  await setDoc(docRef, { enabled });
}
