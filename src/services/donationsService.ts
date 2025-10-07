import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { donationBoxesService } from './donationBoxesService';

export interface Donation {
  id: string;
  donorName: string;
  donorPhone: string;
  amount: number;
  donationType: string;
  donationTypeTitle: string;
  donationTypeTitleEn: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'vodafone_cash' | 'bank_transfer' | 'cash' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateDonationData {
  donorName: string;
  donorPhone: string;
  amount: number;
  donationType: string;
  donationTypeTitle: string;
  donationTypeTitleEn: string;
  paymentMethod?: string;
  notes?: string;
}

const COLLECTION_NAME = 'donations';

export const donationsService = {
  // Add a new donation
  async addDonation(donationData: CreateDonationData): Promise<string> {
    try {
      const now = new Date();
      
      const newDonation = {
        donorName: donationData.donorName.trim(),
        donorPhone: donationData.donorPhone.trim(),
        amount: Number(donationData.amount),
        donationType: donationData.donationType,
        donationTypeTitle: donationData.donationTypeTitle,
        donationTypeTitleEn: donationData.donationTypeTitleEn,
        status: 'pending' as const,
        paymentMethod: donationData.paymentMethod || 'other',
        notes: donationData.notes || '',
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDonation);
      return docRef.id;
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  },

  // Get all donations
  async getDonations(): Promise<Donation[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined
      } as Donation));
    } catch (error) {
      console.error('Error getting donations:', error);
      throw error;
    }
  },

  // Get donations by status
  async getDonationsByStatus(status: Donation['status']): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined
      } as Donation));
    } catch (error) {
      console.error('Error getting donations by status:', error);
      throw error;
    }
  },

  // Get donations by type
  async getDonationsByType(donationType: string): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('donationType', '==', donationType),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined
      } as Donation));
    } catch (error) {
      console.error('Error getting donations by type:', error);
      throw error;
    }
  },

  // Update donation status
  async updateDonationStatus(donationId: string, status: Donation['status'], paymentMethod?: string): Promise<void> {
    try {
      const now = new Date();
      const updateData: any = {
        status,
        updatedAt: Timestamp.fromDate(now)
      };

      if (status === 'completed') {
        updateData.completedAt = Timestamp.fromDate(now);
      }

      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const donationRef = doc(db, COLLECTION_NAME, donationId);
      await updateDoc(donationRef, updateData);

      // If the donation is completed, update the donation box amount
      if (status === 'completed') {
        const donations = await this.getDonations();
        const donation = donations.find(d => d.id === donationId);
        if (donation) {
          await donationBoxesService.updateBoxAmount(donation.donationType, donation.amount);
        }
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }
  },

  // Update donation
  async updateDonation(donationId: string, updates: Partial<Donation>): Promise<void> {
    try {
      const now = new Date();
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(now)
      };

      const donationRef = doc(db, COLLECTION_NAME, donationId);
      await updateDoc(donationRef, updateData);
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  },

  // Delete donation
  async deleteDonation(donationId: string): Promise<void> {
    try {
      const donationRef = doc(db, COLLECTION_NAME, donationId);
      await deleteDoc(donationRef);
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  },

  // Get donation statistics
  async getDonationStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    totalAmount: number;
    completedAmount: number;
  }> {
    try {
      const donations = await this.getDonations();
      
      const stats = {
        total: donations.length,
        pending: donations.filter(d => d.status === 'pending').length,
        completed: donations.filter(d => d.status === 'completed').length,
        cancelled: donations.filter(d => d.status === 'cancelled').length,
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        completedAmount: donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0)
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting donation stats:', error);
      throw error;
    }
  }
};

export default donationsService;