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
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'admin' | 'moderator' | 'member' | 'خادم';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  lastLogin?: Date;
  avatar?: string;
  permissions: string[];
  verified: boolean;
  securityNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'moderator' | 'member' | 'خادم';
  securityNumber: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'moderator' | 'member' | 'خادم';
  securityNumber?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

class UsersService {
  private collectionName = 'users';

  // Get role-based permissions
  private getRolePermissions(role: User['role']): string[] {
    switch (role) {
      case 'admin':
        return ['manage_users', 'manage_content', 'view_analytics', 'manage_settings'];
      case 'moderator':
        return ['manage_content', 'moderate_comments', 'view_analytics'];
      case 'member':
        return ['view_content', 'create_comments'];
      case 'خادم':
        return ['view_content', 'create_comments', 'manage_events', 'assist_admin'];
      default:
        return ['view_content'];
    }
  }

  // Check if email exists
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const usersRef = collection(db, this.collectionName);
      const emailQuery = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(emailQuery);
      
      if (excludeUserId) {
        return snapshot.docs.some(doc => doc.id !== excludeUserId);
      }
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  // Check if security number exists
  async securityNumberExists(securityNumber: string, excludeUserId?: string): Promise<boolean> {
    try {
      const usersRef = collection(db, this.collectionName);
      const securityQuery = query(usersRef, where('securityNumber', '==', securityNumber));
      const snapshot = await getDocs(securityQuery);
      
      if (excludeUserId) {
        return snapshot.docs.some(doc => doc.id !== excludeUserId);
      }
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking security number existence:', error);
      throw error;
    }
  }

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    console.log('=== USERS SERVICE: createUser started ===');
    console.log('Input data:', {
      name: userData.name,
      email: userData.email,
      hasPassword: !!userData.password,
      securityNumber: userData.securityNumber,
      phone: userData.phone
    });

    try {
      // Step 1: Create user in Firebase Auth first
      console.log('Step 1: Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      console.log('✓ Firebase Auth user created with UID:', userCredential.user.uid);

      // Step 2: Update profile
      console.log('Step 2: Updating user profile...');
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });
      console.log('✓ User profile updated');

      // Step 3: Prepare user data for Firestore
      console.log('Step 3: Preparing Firestore data...');
      const now = new Date();
      const userRole = userData.role || 'خادم';
      
      const firestoreData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userRole,
        status: 'active',
        joinDate: Timestamp.fromDate(now),
        lastLogin: null,
        avatar: '',
        permissions: this.getRolePermissions(userRole),
        verified: true,
        securityNumber: userData.securityNumber,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        authUid: userCredential.user.uid
      };
      
      console.log('Firestore data prepared:', firestoreData);

      // Step 4: Add user to Firestore
      console.log('Step 4: Adding user to Firestore...');
      const docRef = await addDoc(collection(db, this.collectionName), firestoreData);
      console.log('✓ User added to Firestore with ID:', docRef.id);

      const returnUser: User = {
        id: docRef.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userRole,
        status: 'active',
        joinDate: now,
        lastLogin: undefined,
        avatar: '',
        permissions: this.getRolePermissions(userRole),
        verified: true,
        securityNumber: userData.securityNumber,
        createdAt: now,
        updatedAt: now
      };

      console.log('=== USERS SERVICE: createUser completed successfully ===');
      return returnUser;

    } catch (error: any) {
      console.error('=== USERS SERVICE: createUser FAILED ===');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      // If we created a Firebase Auth user but Firestore failed, we should clean up
      // But for now, let's just throw the error
      
      throw error;
    }
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, this.collectionName);
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || '',
          permissions: data.permissions || [],
          verified: data.verified || false,
          securityNumber: data.securityNumber,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, this.collectionName, userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        id: userDoc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        joinDate: data.joinDate?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
        avatar: data.avatar || '',
        permissions: data.permissions || [],
        verified: data.verified || false,
        securityNumber: data.securityNumber,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId: string, userData: UpdateUserData): Promise<void> {
    try {
      // Check if email already exists (excluding current user)
      if (userData.email) {
        const emailExists = await this.emailExists(userData.email, userId);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      // Check if security number already exists (excluding current user)
      if (userData.securityNumber) {
        const securityExists = await this.securityNumberExists(userData.securityNumber, userId);
        if (securityExists) {
          throw new Error('Security number already exists');
        }
      }

      const updateData: any = {
        ...userData,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Update permissions if role is changed
      if (userData.role) {
        updateData.permissions = this.getRolePermissions(userData.role);
      }

      await updateDoc(doc(db, this.collectionName, userId), updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, userId), {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, userId), {
        lastLogin: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const usersRef = collection(db, this.collectionName);
      const roleQuery = query(usersRef, where('role', '==', role));
      const snapshot = await getDocs(roleQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || '',
          permissions: data.permissions || [],
          verified: data.verified || false,
          securityNumber: data.securityNumber,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get users by status
  async getUsersByStatus(status: User['status']): Promise<User[]> {
    try {
      const usersRef = collection(db, this.collectionName);
      const statusQuery = query(usersRef, where('status', '==', status));
      const snapshot = await getDocs(statusQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar || '',
          permissions: data.permissions || [],
          verified: data.verified || false,
          securityNumber: data.securityNumber,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    } catch (error) {
      console.error('Error fetching users by status:', error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
export default usersService;