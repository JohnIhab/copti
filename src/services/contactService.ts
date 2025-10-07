import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isAnswered: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const COLLECTION_NAME = 'contact_messages';

// Submit a new contact message
export const submitContactMessage = async (formData: ContactFormData): Promise<string> => {
  try {
    const messageData = {
      ...formData,
      timestamp: Timestamp.now(),
      isRead: false,
      isAnswered: false,
      priority: determinePriority(formData.subject)
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw new Error('Failed to submit message');
  }
};

// Get all contact messages
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as ContactMessage[];
  } catch (error) {
    console.error('Error getting contact messages:', error);
    throw new Error('Failed to fetch messages');
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(messageRef, {
      isRead: true
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw new Error('Failed to mark message as read');
  }
};

// Listen to contact messages in real-time
export const subscribeToContactMessages = (
  callback: (messages: ContactMessage[]) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })) as ContactMessage[];
    
    callback(messages);
  }, (error) => {
    console.error('Error listening to contact messages:', error);
  });
};

// Determine priority based on subject
const determinePriority = (subject: string): 'low' | 'medium' | 'high' => {
  const urgentSubjects = ['baptism', 'funeral', 'emergency'];
  const mediumSubjects = ['wedding', 'volunteer'];
  
  if (urgentSubjects.some(urgent => subject.toLowerCase().includes(urgent))) {
    return 'high';
  }
  
  if (mediumSubjects.some(medium => subject.toLowerCase().includes(medium))) {
    return 'medium';
  }
  
  return 'low';
};

// Get unread messages count
export const getUnreadMessagesCount = async (): Promise<number> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.filter(doc => !doc.data().isRead).length;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
};

// Mark message as answered
export const markMessageAsAnswered = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(messageRef, {
      isAnswered: true,
      isRead: true
    });
  } catch (error) {
    console.error('Error marking message as answered:', error);
    throw new Error('Failed to mark message as answered');
  }
};

// Delete a single message
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
};

// Bulk delete messages
export const bulkDeleteMessages = async (messageIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(db, COLLECTION_NAME, messageId);
      batch.delete(messageRef);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk deleting messages:', error);
    throw new Error('Failed to delete messages');
  }
};

// Mark multiple messages as read
export const bulkMarkAsRead = async (messageIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(db, COLLECTION_NAME, messageId);
      batch.update(messageRef, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk marking messages as read:', error);
    throw new Error('Failed to mark messages as read');
  }
};

// Mark multiple messages as answered
export const bulkMarkAsAnswered = async (messageIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(db, COLLECTION_NAME, messageId);
      batch.update(messageRef, { isAnswered: true, isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk marking messages as answered:', error);
    throw new Error('Failed to mark messages as answered');
  }
};