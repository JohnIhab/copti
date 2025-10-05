import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Trip {
  id?: string;
  title: string;
  titleEn: string;
  destination: string;
  destinationEn: string;
  date: string;
  duration: string;
  durationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  cost: number;
  includes?: string[];
  includesEn?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'trips';

export const tripsService = {
  // Add a new trip
  async addTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'registered'>): Promise<string> {
    try {
      const now = new Date();
      const tripWithTimestamps = {
        ...tripData,
        registered: 0,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), tripWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  },

  // Get all trips
  async getTrips(): Promise<Trip[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Trip));
    } catch (error) {
      console.error('Error getting trips:', error);
      throw error;
    }
  },

  // Get trips by category
  async getTripsByCategory(category: string): Promise<Trip[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Trip));
    } catch (error) {
      console.error('Error getting trips by category:', error);
      throw error;
    }
  },

  // Update a trip
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(tripRef, updateData);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  // Delete a trip
  async deleteTrip(tripId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  },

  // Register for a trip (increment registered count)
  async registerForTrip(tripId: string): Promise<void> {
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId);
      // Note: In a real app, you'd want to use a transaction to ensure atomicity
      // and check capacity limits
      const trip = await this.getTrips();
      const currentTrip = trip.find(t => t.id === tripId);
      
      if (currentTrip && currentTrip.registered < currentTrip.capacity) {
        await updateDoc(tripRef, {
          registered: currentTrip.registered + 1,
          updatedAt: new Date()
        });
      } else {
        throw new Error('Trip is full or not found');
      }
    } catch (error) {
      console.error('Error registering for trip:', error);
      throw error;
    }
  }
};