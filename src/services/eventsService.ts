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
  onSnapshot
} from './firebase';
import { db } from './firebase';

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
// Using Cloudinary for image hosting; no local images path required here.

// Helper function to upload image
export const uploadEventImage = async (file: File): Promise<string> => {
  try {
    // Use Cloudinary unsigned upload from client
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME as string;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
    if (!cloudName || !preset) {
      throw new Error('Cloudinary upload not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);
    // Optionally include context/public_id/folder
    const res = await fetch(url, { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const errMsg = body?.error?.message || res.statusText;
      throw new Error(`Cloudinary upload failed: ${errMsg}`);
    }
    const data = await res.json();
    return data.secure_url as string;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Helper function to delete image
export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  try {
    // For Firebase-stored images we used to delete via storage reference.
    // Cloudinary image deletion requires an authenticated server-side request (signed).
    // So when using Cloudinary client-side uploads we cannot safely delete images from the client.
    // Log and skip deletion for Cloudinary URLs.
    if (!imageUrl) return;
    if (imageUrl.includes('firebase')) {
      // If in future you still have firebase URLs, deletion logic can be re-added here with storage access.
      console.warn('Firebase image deletion requested but storage deletion code was removed.');
    } else if (imageUrl.includes('cloudinary.com')) {
      console.warn('Cloudinary image detected. Deletion must be done server-side with API key/secret. Skipping.');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
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
        const imageUrl = await uploadEventImage(eventData.image);
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
        const imageUrl = await uploadEventImage(newImage);
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