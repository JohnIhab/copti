import { collection, addDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface TripPayment {
  id?: string;
  name: string;
  phone: string;
  tripIds: string[];
  total: number;
  createdAt: Date;
}

const COLLECTION_NAME = 'tripPayments';

export const tripPaymentsService = {
  async addPayment(payment: Omit<TripPayment, 'id' | 'createdAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...payment,
      createdAt: now
    });
    return docRef.id;
  },

  async getPayments(): Promise<TripPayment[]> {
    const q = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
    }) as TripPayment);
  }
};
