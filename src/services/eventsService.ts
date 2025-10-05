import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from './firebase';
import { db, storage } from './firebase';

export interface Event {
  id?: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  featured: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface EventFormData {
  title: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  locationEn: string;
  category: string;
  description: string;
  descriptionEn: string;
  capacity: number;
  featured: boolean;
  image?: File | null;
}

const EVENTS_COLLECTION = 'events';
const IMAGES_PATH = 'events';

// Helper function to upload image
export const uploadEventImage = async (file: File, eventId: string): Promise<string> => {
  try {
    const imageRef = ref(storage, `${IMAGES_PATH}/${eventId}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

// Helper function to delete image
export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  try {
    if (imageUrl && imageUrl.includes('firebase')) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for image deletion as it's not critical
  }
};

// Get all events
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to Date strings if needed
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('Failed to fetch events');
  }
};

// Get events with real-time updates
export const subscribeToEvents = (callback: (events: Event[]) => void): (() => void) => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data
        } as Event);
      });
      callback(events);
    }, (error) => {
      console.error('Error in events subscription:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up events subscription:', error);
    return () => {};
  }
};

// Get event by ID
export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return {
        id: eventSnap.id,
        ...eventSnap.data()
      } as Event;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('Failed to fetch event');
  }
};

// Add new event
export const addEvent = async (eventData: EventFormData): Promise<string> => {
  try {
    const now = Timestamp.now();
    
    // Prepare event data
    const newEventData = {
      title: eventData.title.trim(),
      titleEn: eventData.titleEn.trim(),
      date: eventData.date,
      time: eventData.time,
      location: eventData.location.trim(),
      locationEn: eventData.locationEn.trim(),
      category: eventData.category,
      categoryEn: getCategoryEnglishName(eventData.category),
      description: eventData.description.trim(),
      descriptionEn: eventData.descriptionEn.trim(),
      capacity: eventData.capacity,
      registered: 0,
      featured: eventData.featured,
      image: '/Images/hero.jpg', // Default image
      createdAt: now,
      updatedAt: now
    };
    
    // Add event to Firestore
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEventData);
    
    // Upload image if provided
    if (eventData.image) {
      try {
        const imageUrl = await uploadEventImage(eventData.image, docRef.id);
        await updateDoc(docRef, { image: imageUrl });
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        // Event is created but image upload failed
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw new Error('Failed to add event');
  }
};

// Update event
export const updateEvent = async (id: string, eventData: Partial<EventFormData>, newImage?: File): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    
    // Prepare update data
    const updateData: any = {
      ...eventData,
      updatedAt: Timestamp.now()
    };
    
    // Update category English name if category changed
    if (eventData.category) {
      updateData.categoryEn = getCategoryEnglishName(eventData.category);
    }
    
    // Handle image update
    if (newImage) {
      try {
        // Get current event to delete old image
        const currentEvent = await getEventById(id);
        if (currentEvent?.image) {
          await deleteEventImage(currentEvent.image);
        }
        
        // Upload new image
        const imageUrl = await uploadEventImage(newImage, id);
        updateData.image = imageUrl;
      } catch (imageError) {
        console.error('Error updating image:', imageError);
        // Continue with other updates even if image upload fails
      }
    }
    
    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
};

// Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    // Get event data to delete associated image
    const event = await getEventById(id);
    
    // Delete event document
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    
    // Delete associated image
    if (event?.image) {
      await deleteEventImage(event.image);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
};

// Get events by category
export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error getting events by category:', error);
    throw new Error('Failed to fetch events by category');
  }
};

// Get featured events
export const getFeaturedEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
      eventsRef,
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as Event);
    });
    
    return events;
  } catch (error) {
    console.error('Error getting featured events:', error);
    throw new Error('Failed to fetch featured events');
  }
};

// Helper function to get category English name
const getCategoryEnglishName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'general': 'General',
    'conference': 'Conference',
    'workshop': 'Workshop',
    'service': 'Service',
    'youth': 'Youth',
    'children': 'Children',
    'prayer': 'Prayer',
    'bible-study': 'Bible Study',
    'celebration': 'Celebration',
    'seminar': 'Seminar',
    'festival': 'Festival'
  };
  
  return categoryMap[category] || 'General';
};

// Event categories
export const eventCategories = [
  { value: 'general', label: 'عام', labelEn: 'General' },
  { value: 'conference', label: 'مؤتمر', labelEn: 'Conference' },
  { value: 'workshop', label: 'ورشة عمل', labelEn: 'Workshop' },
  { value: 'service', label: 'خدمة', labelEn: 'Service' },
  { value: 'youth', label: 'شباب', labelEn: 'Youth' },
  { value: 'children', label: 'أطفال', labelEn: 'Children' },
  { value: 'prayer', label: 'صلاة', labelEn: 'Prayer' },
  { value: 'bible-study', label: 'دراسة كتابية', labelEn: 'Bible Study' },
  { value: 'celebration', label: 'احتفال', labelEn: 'Celebration' },
  { value: 'seminar', label: 'ندوة', labelEn: 'Seminar' },
  { value: 'festival', label: 'مهرجان', labelEn: 'Festival' }
];