import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface ConfessionAppointment {
  id?: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  date: string;
  time: string;
  priest: string;
  priestEn: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimeSlot {
  id?: string;
  date: string;
  time: string;
  priest: string;
  priestEn: string;
  available: boolean;
  maxAppointments: number;
  currentAppointments: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class ConfessionService {
  private appointmentsCollection = 'confessionAppointments';
  private timeSlotsCollection = 'confessionTimeSlots';

  // Time Slots Management
  async createTimeSlot(slotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Database connection not available');
      }

      // Check if slot already exists
      const existingSlots = await this.getTimeSlotsByDateAndTime(slotData.date, slotData.time, slotData.priest);
      if (existingSlots.length > 0) {
        throw new Error('Time slot already exists for this priest at this time');
      }

      console.log('Creating time slot:', slotData);

      const docRef = await addDoc(collection(db, this.timeSlotsCollection), {
        ...slotData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('Time slot created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }
  }

  async updateTimeSlot(id: string, updates: Partial<TimeSlot>): Promise<void> {
    try {
      await updateDoc(doc(db, this.timeSlotsCollection, id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }
  }

  async deleteTimeSlot(id: string): Promise<void> {
    try {
      // Check if there are any appointments for this slot
      const appointments = await this.getAppointmentsBySlotId(id);
      if (appointments.length > 0) {
        throw new Error('Cannot delete time slot with existing appointments');
      }
      
      await deleteDoc(doc(db, this.timeSlotsCollection, id));
    } catch (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  }

  async getAllTimeSlots(): Promise<TimeSlot[]> {
    try {
      // Simplified query without orderBy to avoid index requirements
      const querySnapshot = await getDocs(collection(db, this.timeSlotsCollection));
      const slots = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimeSlot));

      // Sort in JavaScript
      return slots.sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return a.time.localeCompare(b.time);
      });
    } catch (error) {
      console.error('Error getting time slots:', error);
      throw error;
    }
  }

  async getAvailableTimeSlots(): Promise<TimeSlot[]> {
    try {
      // Check if Firebase is properly initialized
      if (!db) {
        console.error('Firebase not initialized');
        throw new Error('Database connection not available');
      }

      // Simplified query to avoid index requirements
      const querySnapshot = await getDocs(collection(db, this.timeSlotsCollection));
      const slots = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimeSlot));

      console.log('Retrieved slots from Firebase:', slots.length);

      // Filter and sort in JavaScript instead of Firestore
      const availableSlots = slots
        .filter(slot => {
          // Ensure slot has required properties
          if (!slot.date || !slot.time || typeof slot.available !== 'boolean') {
            console.warn('Invalid slot data:', slot);
            return false;
          }
          return slot.available && slot.currentAppointments < slot.maxAppointments;
        })
        .sort((a, b) => {
          if (a.date !== b.date) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return a.time.localeCompare(b.time);
        });

      console.log('Filtered available slots:', availableSlots.length);
      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        throw new Error(`Failed to load appointments: ${error.message}`);
      } else {
        throw new Error('Failed to load appointments: Unknown error');
      }
    }
  }

  private async getTimeSlotsByDateAndTime(date: string, time: string, priest: string): Promise<TimeSlot[]> {
    try {
      // Get all time slots and filter in JavaScript to avoid index requirements
      const querySnapshot = await getDocs(collection(db, this.timeSlotsCollection));
      const slots = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimeSlot));

      return slots.filter(slot => 
        slot.date === date && 
        slot.time === time && 
        slot.priest === priest
      );
    } catch (error) {
      console.error('Error getting time slots by date and time:', error);
      throw error;
    }
  }

  // Appointments Management
  async bookAppointment(appointmentData: Omit<ConfessionAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Find the matching time slot
      const timeSlots = await this.getTimeSlotsByDateAndTime(
        appointmentData.date, 
        appointmentData.time, 
        appointmentData.priest
      );

      if (timeSlots.length === 0) {
        throw new Error('No available time slot found');
      }

      const timeSlot = timeSlots[0];

      // Check if slot is available and not fully booked
      if (!timeSlot.available || timeSlot.currentAppointments >= timeSlot.maxAppointments) {
        throw new Error('Time slot is not available or fully booked');
      }

      // Create the appointment
      const docRef = await addDoc(collection(db, this.appointmentsCollection), {
        ...appointmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update the time slot's current appointments count
      await this.updateTimeSlot(timeSlot.id!, {
        currentAppointments: timeSlot.currentAppointments + 1,
        available: timeSlot.currentAppointments + 1 < timeSlot.maxAppointments
      });

      return docRef.id;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(id: string, status: ConfessionAppointment['status']): Promise<void> {
    try {
      const appointment = await this.getAppointmentById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      await updateDoc(doc(db, this.appointmentsCollection, id), {
        status,
        updatedAt: Timestamp.now()
      });

      // If cancelling, free up the time slot
      if (status === 'cancelled' && appointment.status !== 'cancelled') {
        const timeSlots = await this.getTimeSlotsByDateAndTime(
          appointment.date,
          appointment.time,
          appointment.priest
        );

        if (timeSlots.length > 0) {
          const timeSlot = timeSlots[0];
          await this.updateTimeSlot(timeSlot.id!, {
            currentAppointments: Math.max(0, timeSlot.currentAppointments - 1),
            available: true
          });
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      const appointment = await this.getAppointmentById(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Free up the time slot if appointment was not cancelled
      if (appointment.status !== 'cancelled') {
        const timeSlots = await this.getTimeSlotsByDateAndTime(
          appointment.date,
          appointment.time,
          appointment.priest
        );

        if (timeSlots.length > 0) {
          const timeSlot = timeSlots[0];
          await this.updateTimeSlot(timeSlot.id!, {
            currentAppointments: Math.max(0, timeSlot.currentAppointments - 1),
            available: true
          });
        }
      }

      await deleteDoc(doc(db, this.appointmentsCollection, id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async getAllAppointments(): Promise<ConfessionAppointment[]> {
    try {
      const q = query(
        collection(db, this.appointmentsCollection),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConfessionAppointment));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<ConfessionAppointment | null> {
    try {
      const docRef = doc(db, this.appointmentsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ConfessionAppointment;
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      throw error;
    }
  }

  private async getAppointmentsBySlotId(slotId: string): Promise<ConfessionAppointment[]> {
    try {
      // This would need to be implemented based on how you want to link appointments to slots
      // For now, we'll use date, time, and priest to find appointments
      const timeSlot = await this.getTimeSlotById(slotId);
      if (!timeSlot) return [];

      const q = query(
        collection(db, this.appointmentsCollection),
        where('date', '==', timeSlot.date),
        where('time', '==', timeSlot.time),
        where('priest', '==', timeSlot.priest)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConfessionAppointment));
    } catch (error) {
      console.error('Error getting appointments by slot ID:', error);
      throw error;
    }
  }

  private async getTimeSlotById(id: string): Promise<TimeSlot | null> {
    try {
      const docRef = doc(db, this.timeSlotsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as TimeSlot;
    } catch (error) {
      console.error('Error getting time slot by ID:', error);
      throw error;
    }
  }

  // Real-time listeners
  onAppointmentsChange(callback: (appointments: ConfessionAppointment[]) => void) {
    const q = query(
      collection(db, this.appointmentsCollection),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConfessionAppointment));
      callback(appointments);
    });
  }

  onTimeSlotsChange(callback: (timeSlots: TimeSlot[]) => void) {
    // Simplified query to avoid indexing requirements
    const collectionRef = collection(db, this.timeSlotsCollection);
    
    return onSnapshot(collectionRef, (querySnapshot) => {
      const timeSlots = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimeSlot));
      
      // Sort in JavaScript instead of Firestore
      const sortedTimeSlots = timeSlots.sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return a.time.localeCompare(b.time);
      });
      
      callback(sortedTimeSlots);
    });
  }

  // User-facing methods
  async getUserAppointments(userPhone: string): Promise<ConfessionAppointment[]> {
    try {
      const q = query(
        collection(db, this.appointmentsCollection),
        where('userPhone', '==', userPhone),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConfessionAppointment));
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  }

  async canUserBook(userPhone: string, date: string): Promise<boolean> {
    try {
      // Check if user already has an appointment on this date
      const q = query(
        collection(db, this.appointmentsCollection),
        where('userPhone', '==', userPhone),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user can book:', error);
      throw error;
    }
  }
}

export const confessionService = new ConfessionService();
export default confessionService;