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

export interface DonationBox {
  id: string;
  key: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  icon: string;
  target: number;
  currentAmount: number;
  isActive: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationBoxData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  icon: string;
  target: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const COLLECTION_NAME = 'donationBoxes';

// Helper function to sanitize Arabic text for key generation
const generateKeyFromTitle = (title: string): string => {
  return title.toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\w\s\u0600-\u06FF]/gi, '') // Keep Arabic characters
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length
};

export const donationBoxesService = {
  // Add a new donation box
  async addDonationBox(boxData: CreateDonationBoxData): Promise<string> {
    try {
      const now = new Date();
      
      // Generate key from title using helper function
      const key = generateKeyFromTitle(boxData.title);
      
      console.log('Creating donation box with data:', boxData);
      console.log('Generated key:', key);
      
      // Validate required fields
      if (!boxData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!boxData.titleEn?.trim()) {
        throw new Error('English title is required');
      }
      if (!boxData.target || boxData.target <= 0) {
        throw new Error('Valid target amount is required');
      }
      
      const newBox = {
        key,
        title: boxData.title.trim(),
        titleEn: boxData.titleEn.trim(),
        description: boxData.description?.trim() || '',
        descriptionEn: boxData.descriptionEn?.trim() || '',
        color: boxData.color || 'bg-blue-500',
        icon: boxData.icon || 'Heart',
        target: Number(boxData.target),
        currentAmount: 0,
        isActive: true,
        category: boxData.category || 'general',
        priority: boxData.priority || 'medium',
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      console.log('Prepared box data for Firestore:', newBox);
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newBox);
      console.log('Successfully created donation box with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding donation box:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      throw error;
    }
  },

  // Get all donation boxes
  async getDonationBoxes(): Promise<DonationBox[]> {
    try {
      console.log('بدء جلب صناديق التبرع من Firestore...');
      console.log('Collection name:', COLLECTION_NAME);
      console.log('Database instance:', db);
      
      let querySnapshot;
      
      try {
        // Try with ordering (requires indexes)
        console.log('محاولة الاستعلام مع الترتيب...');
        const q = query(
          collection(db, COLLECTION_NAME), 
          orderBy('priority', 'desc'),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
        console.log('نجح الاستعلام مع الترتيب');
      } catch (indexError) {
        console.warn('فشل الاستعلام مع الترتيب، محاولة بدون ترتيب:', indexError);
        // Fallback: simple query without ordering
        querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        console.log('نجح الاستعلام البسيط بدون ترتيب');
      }
      
      console.log('Query executed, processing results...');
      
      const boxes: DonationBox[] = [];
      querySnapshot.forEach((doc) => {
        console.log(`Processing document ID: ${doc.id}`);
        const data = doc.data();
        console.log('Document data:', data);
        
        const box: DonationBox = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DonationBox;
        
        boxes.push(box);
      });
      
      // Sort manually if we couldn't use orderBy
      boxes.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Descending priority
        }
        
        return b.createdAt.getTime() - a.createdAt.getTime(); // Descending date
      });
      
      console.log(`تم جلب ${boxes.length} صندوق بنجاح`);
      return boxes;
    } catch (error) {
      console.error('Error getting donation boxes:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          code: (error as any).code,
          stack: error.stack
        });
        
        // معالجة أخطاء محددة
        if (error.message.includes('permission-denied')) {
          throw new Error('ليس لديك صلاحية للوصول إلى صناديق التبرع. تحقق من قواعد Firestore.');
        } else if (error.message.includes('not-found')) {
          throw new Error('قاعدة البيانات أو المجموعة غير موجودة.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('خدمة Firestore غير متاحة حالياً. يرجى المحاولة لاحقاً.');
        }
      }
      
      throw error;
    }
  },

  // Get active donation boxes only
  async getActiveDonationBoxes(): Promise<DonationBox[]> {
    try {
      console.log('بدء جلب صناديق التبرع النشطة...');
      
      let querySnapshot;
      
      try {
        // Try with filtering and ordering
        console.log('محاولة الاستعلام مع التصفية والترتيب...');
        const q = query(
          collection(db, COLLECTION_NAME), 
          where('isActive', '==', true),
          orderBy('priority', 'desc'),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
        console.log('نجح الاستعلام مع التصفية والترتيب');
      } catch (indexError) {
        console.warn('فشل الاستعلام مع التصفية والترتيب، محاولة بدون ترتيب:', indexError);
        try {
          // Fallback: filter only without ordering
          const q = query(
            collection(db, COLLECTION_NAME), 
            where('isActive', '==', true)
          );
          querySnapshot = await getDocs(q);
          console.log('نجح الاستعلام مع التصفية فقط');
        } catch (filterError) {
          console.warn('فشل الاستعلام مع التصفية، محاولة بدون تصفية:', filterError);
          // Final fallback: get all and filter manually
          querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
          console.log('نجح الاستعلام البسيط، سيتم التصفية يدوياً');
        }
      }
      
      const boxes: DonationBox[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const box: DonationBox = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DonationBox;
        
        // Manual filtering if needed
        if (box.isActive) {
          boxes.push(box);
        }
      });
      
      // Sort manually
      boxes.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log(`تم جلب ${boxes.length} صندوق نشط`);
      return boxes;
    } catch (error) {
      console.error('Error getting active donation boxes:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('ليس لديك صلاحية للوصول إلى صناديق التبرع.');
        } else if (error.message.includes('not-found')) {
          throw new Error('مجموعة صناديق التبرع غير موجودة.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('خدمة قاعدة البيانات غير متاحة حالياً.');
        }
      }
      
      throw error;
    }
  },

  // Update donation box
  async updateDonationBox(boxId: string, updates: Partial<DonationBox>): Promise<void> {
    try {
      const now = new Date();
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(now)
      };

      // Remove readonly fields
      delete updateData.id;
      delete updateData.createdAt;

      const boxRef = doc(db, COLLECTION_NAME, boxId);
      await updateDoc(boxRef, updateData);
    } catch (error) {
      console.error('Error updating donation box:', error);
      throw error;
    }
  },

  // Toggle box active status
  async toggleBoxStatus(boxId: string, isActive: boolean): Promise<void> {
    try {
      const now = new Date();
      const boxRef = doc(db, COLLECTION_NAME, boxId);
      await updateDoc(boxRef, {
        isActive,
        updatedAt: Timestamp.fromDate(now)
      });
    } catch (error) {
      console.error('Error toggling box status:', error);
      throw error;
    }
  },

  // Delete donation box
  async deleteDonationBox(boxId: string): Promise<void> {
    try {
      const boxRef = doc(db, COLLECTION_NAME, boxId);
      await deleteDoc(boxRef);
    } catch (error) {
      console.error('Error deleting donation box:', error);
      throw error;
    }
  },

  // Update box current amount (when donations are made)
  async updateBoxAmount(boxKey: string, amount: number): Promise<void> {
    try {
      const boxes = await this.getDonationBoxes();
      const box = boxes.find(b => b.key === boxKey);
      
      if (box) {
        const newAmount = box.currentAmount + amount;
        await this.updateDonationBox(box.id, { currentAmount: newAmount });
      }
    } catch (error) {
      console.error('Error updating box amount:', error);
      throw error;
    }
  },

  // Get box statistics
  async getBoxStats(): Promise<{
    totalBoxes: number;
    activeBoxes: number;
    totalTarget: number;
    totalCurrentAmount: number;
    averageProgress: number;
  }> {
    try {
      const boxes = await this.getDonationBoxes();
      
      const stats = {
        totalBoxes: boxes.length,
        activeBoxes: boxes.filter(b => b.isActive).length,
        totalTarget: boxes.reduce((sum, b) => sum + b.target, 0),
        totalCurrentAmount: boxes.reduce((sum, b) => sum + b.currentAmount, 0),
        averageProgress: 0
      };
      
      if (stats.totalTarget > 0) {
        stats.averageProgress = (stats.totalCurrentAmount / stats.totalTarget) * 100;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting box stats:', error);
      throw error;
    }
  }
};

export default donationBoxesService;