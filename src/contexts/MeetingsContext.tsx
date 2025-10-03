import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  orderBy, 
  query 
} from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Meeting {
  id: string;
  title: string;
  titleEn: string;
  subtitle?: string;
  subtitleEn?: string;
  time: string;
  day: string;
  dayEn: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  description?: string;
  descriptionEn?: string;
  capacity: number;
  registered: number;
  createdAt?: Date;
}

interface MeetingsContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'registered' | 'createdAt'>) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};

interface MeetingsProviderProps {
  children: ReactNode;
}

export const MeetingsProvider: React.FC<MeetingsProviderProps> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for meetings from Firestore
  useEffect(() => {
    const meetingsRef = collection(db, 'meetings');
    const q = query(meetingsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const meetingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as Meeting[];
        
        setMeetings(meetingsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
        setLoading(false);
        
        // Fallback to default meetings if Firebase fails
        setMeetings([
          {
            id: 'default-1',
            title: 'اجتماع الشباب',
            titleEn: 'Youth Meeting',
            subtitle: 'دراسة كتابية وشركة',
            subtitleEn: 'Bible Study and Fellowship',
            time: '7:00 PM',
            day: 'الجمعة',
            dayEn: 'Friday',
            location: 'قاعة الكنيسة الرئيسية',
            locationEn: 'Main Church Hall',
            category: 'youth',
            categoryEn: 'Youth',
            description: 'اجتماع أسبوعي للشباب مع دراسة كتابية وأنشطة روحية',
            descriptionEn: 'Weekly youth meeting with Bible study and spiritual activities',
            capacity: 100,
            registered: 75
          },
          {
            id: 'default-2',
            title: 'مدرسة الأحد للأطفال',
            titleEn: 'Sunday School for Children',
            subtitle: 'تعليم وأنشطة',
            subtitleEn: 'Teaching and Activities',
            time: '10:00 AM',
            day: 'الأحد',
            dayEn: 'Sunday',
            location: 'فصول مدرسة الأحد',
            locationEn: 'Sunday School Classrooms',
            category: 'children',
            categoryEn: 'Children',
            description: 'تعليم الأطفال قصص الكتاب المقدس والقيم المسيحية',
            descriptionEn: 'Teaching children Bible stories and Christian values',
            capacity: 80,
            registered: 65
          }
        ]);
      }
    );

    return () => unsubscribe();
  }, []);

  const addMeeting = async (newMeeting: Omit<Meeting, 'id' | 'registered' | 'createdAt'>) => {
    try {
      setError(null);
      const meetingData = {
        ...newMeeting,
        registered: 0,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'meetings'), meetingData);
    } catch (err) {
      console.error('Error adding meeting:', err);
      setError('Failed to add meeting');
      throw err;
    }
  };

  const updateMeeting = async (id: string, updatedMeeting: Partial<Meeting>) => {
    try {
      setError(null);
      const meetingRef = doc(db, 'meetings', id);
      await updateDoc(meetingRef, updatedMeeting);
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError('Failed to update meeting');
      throw err;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      setError(null);
      const meetingRef = doc(db, 'meetings', id);
      await deleteDoc(meetingRef);
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting');
      throw err;
    }
  };

  return (
    <MeetingsContext.Provider value={{
      meetings,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      loading,
      error
    }}>
      {children}
    </MeetingsContext.Provider>
  );
};