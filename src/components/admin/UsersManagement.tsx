import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  UserCheck, 
  UserX,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usersService, User, CreateUserData, UpdateUserData } from '../../services/usersService';
import { auth, db } from '../../services/firebase';

const UsersManagement: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    securityNumber: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users from Firebase...');
      
      // Test Firebase connection
      try {
        const usersData = await usersService.getUsers();
        console.log('Users loaded successfully:', usersData.length);
        setUsers(usersData);
      } catch (firebaseError) {
        console.error('Firebase connection error:', firebaseError);
        toast.error(
          language === 'ar' 
            ? 'خطأ في الاتصال بقاعدة البيانات'
            : 'Database connection error'
        );
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تحميل المستخدمين'
          : 'Error loading users'
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      securityNumber: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const validateForm = async () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    } else {
      try {
        const emailExists = await usersService.emailExists(formData.email, editingUser?.id);
        if (emailExists) {
          errors.email = language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already exists';
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }

    if (!editingUser && !formData.password) {
      errors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }

    if (!formData.securityNumber.trim()) {
      errors.securityNumber = language === 'ar' ? 'الرقم الأمني مطلوب' : 'Security number is required';
    } else {
      try {
        const securityExists = await usersService.securityNumberExists(formData.securityNumber, editingUser?.id);
        if (securityExists) {
          errors.securityNumber = language === 'ar' ? 'الرقم الأمني مستخدم بالفعل' : 'Security number already exists';
        }
      } catch (error) {
        console.error('Error checking security number:', error);
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    console.log('=== STARTING USER SAVE ===');
    console.log('Form data:', formData);
    
    // Basic field validation
    if (!formData.name || !formData.email || (!editingUser && !formData.password) || !formData.securityNumber) {
      const missingFields = [];
      if (!formData.name) missingFields.push('Name');
      if (!formData.email) missingFields.push('Email');
      if (!editingUser && !formData.password) missingFields.push('Password');
      if (!formData.securityNumber) missingFields.push('Security Number');
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setSubmitting(true);
    try {
      console.log('=== ATTEMPTING TO SAVE USER ===');
      
      if (editingUser && editingUser.id) {
        console.log('Updating existing user...');
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          securityNumber: formData.securityNumber
        };
        
        await usersService.updateUser(editingUser.id, updateData);
        console.log('User updated successfully');
        toast.success(
          language === 'ar' 
            ? 'تم تحديث المستخدم بنجاح'
            : 'User updated successfully'
        );
      } else {
        console.log('Creating new user...');
        
        // Simple validation for email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Invalid email format');
        }
        
        // Simple password validation
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        const createData: CreateUserData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone?.trim() || '',
          securityNumber: formData.securityNumber.trim(),
          role: 'خادم' // Set role as خادم (servant/deacon)
        };
        
        console.log('Calling usersService.createUser with:', {
          name: createData.name,
          email: createData.email,
          hasPassword: !!createData.password,
          securityNumber: createData.securityNumber
        });
        
        const newUser = await usersService.createUser(createData);
        console.log('User created successfully:', newUser.id);
        toast.success(
          language === 'ar' 
            ? 'تم إضافة المستخدم بنجاح'
            : 'User added successfully'
        );
      }
      
      console.log('Reloading users...');
      await loadUsers();
      
      console.log('Closing modal...');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        securityNumber: ''
      });
      setFormErrors({});
      
      console.log('=== USER SAVE COMPLETED SUCCESSFULLY ===');
    } catch (error: any) {
      console.error('=== USER SAVE FAILED ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Firebase error: ${error.code}`;
      }
      
      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      console.log('=== USER SAVE PROCESS ENDED ===');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      phone: user.phone || '',
      securityNumber: user.securityNumber
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من حذف هذا المستخدم؟'
        : 'Are you sure you want to delete this user?'
    )) {
      try {
        await usersService.deleteUser(userId);
        await loadUsers(); // Reload users after deletion
        toast.success(
          language === 'ar' 
            ? 'تم حذف المستخدم بنجاح'
            : 'User deleted successfully'
        );
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(
          language === 'ar' 
            ? 'حدث خطأ أثناء حذف المستخدم'
            : 'Error deleting user'
        );
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      await usersService.updateUserStatus(userId, newStatus);
      await loadUsers(); // Reload users after status change
      toast.success(
        language === 'ar' 
          ? 'تم تحديث حالة المستخدم بنجاح'
          : 'User status updated successfully'
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تحديث حالة المستخدم'
          : 'Error updating user status'
      );
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'suspended': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return language === 'ar' ? 'لم يسجل دخول من قبل' : 'Never logged in';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return language === 'ar' ? 'منذ قليل' : 'Just now';
    if (diffInHours < 24) return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 admin-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? `إجمالي المستخدمين: ${users.length}` 
                  : `Total Users: ${users.length}`
                }
              </p>
            </div>
          </div>
          
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              try {
                console.log('=== TESTING FIREBASE CONNECTION ===');
                toast.info('Testing Firebase connection...');
                
                // Test 1: Check if Firebase is initialized
                console.log('Test 1: Checking Firebase initialization...');
                console.log('Auth:', auth);
                console.log('DB:', db);
                
                // Test 2: Try to read from Firestore
                console.log('Test 2: Testing Firestore read...');
                const users = await usersService.getUsers();
                console.log('✓ Firestore read successful, users count:', users.length);
                
                // Test 3: Test Auth connection (without creating a user)
                console.log('Test 3: Testing Auth connection...');
                console.log('Current user:', auth.currentUser);
                
                toast.success(`Firebase working! Found ${users.length} users`);
                console.log('=== FIREBASE TEST COMPLETED ===');
              } catch (error: any) {
                console.error('=== FIREBASE TEST FAILED ===');
                console.error('Error:', error);
                toast.error(`Firebase test failed: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >
            Test Firebase
          </button>
          
          <button
            onClick={async () => {
              try {
                console.log('=== TESTING SIMPLE USER CREATION ===');
                toast.info('Testing user creation with dummy data...');
                
                const testData = {
                  name: 'Test User ' + Date.now(),
                  email: `test${Date.now()}@example.com`,
                  password: 'test123456',
                  securityNumber: 'TEST' + Date.now()
                };
                
                console.log('Creating test user:', testData);
                const newUser = await usersService.createUser(testData);
                console.log('✓ Test user created:', newUser);
                
                toast.success('Test user created successfully!');
                await loadUsers(); // Refresh the list
              } catch (error: any) {
                console.error('=== TEST USER CREATION FAILED ===');
                console.error('Error:', error);
                toast.error(`Test creation failed: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
          >
            Test Create User
          </button>
          
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                      text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 admin-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 
                             text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث عن المستخدمين...' : 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 
                        rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
            <option value="suspended">{language === 'ar' ? 'معلق' : 'Suspended'}</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'المستخدمين النشطين' : 'Active Users'}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {users.filter(user => user.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'المستخدمين المعلقين' : 'Suspended Users'}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {users.filter(user => user.status === 'suspended').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden admin-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'المستخدم' : 'User'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الرقم الأمني' : 'Security Number'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}
                </th>
                <th className="px-6 py-4 text-left rtl:text-right text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {paginatedUsers.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                                      flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            {user.verified && (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                          {user.securityNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {language === 'ar' 
                          ? user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'معلق'
                          : user.status.charAt(0).toUpperCase() + user.status.slice(1)
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatLastLogin(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 
                                   rounded-lg transition-colors"
                          title={language === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {user.status !== 'suspended' ? (
                          <button
                            onClick={() => user.id && handleStatusChange(user.id, 'suspended')}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 
                                     rounded-lg transition-colors"
                            title={language === 'ar' ? 'تعليق' : 'Suspend'}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => user.id && handleStatusChange(user.id, 'active')}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 
                                     rounded-lg transition-colors"
                            title={language === 'ar' ? 'تفعيل' : 'Activate'}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => user.id && handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 
                                   rounded-lg transition-colors"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? `عرض ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredUsers.length)} من ${filteredUsers.length}`
                  : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredUsers.length)} of ${filteredUsers.length}`
                }
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 
                           rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 
                           rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingUser 
                    ? (language === 'ar' ? 'تعديل المستخدم' : 'Edit User')
                    : (language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User')
                  }
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.name 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.email 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'} {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.password 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={editingUser 
                      ? (language === 'ar' ? 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية' : 'Leave empty to keep current password')
                      : (language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password')
                    }
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                  )}
                </div>

                {/* Security Number Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الرقم الأمني' : 'Security Number'} *
                  </label>
                  <input
                    type="text"
                    name="securityNumber"
                    value={formData.securityNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.securityNumber 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'ar' ? 'أدخل الرقم الأمني الفريد' : 'Enter unique security number'}
                  />
                  {formErrors.securityNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.securityNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ar' 
                      ? 'رقم فريد يستخدم لتحديد هوية المستخدم' 
                      : 'Unique identifier for user authentication'
                    }
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? '+20 1234567890' : '+20 1234567890'}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 
                          flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 
                         border border-gray-300 dark:border-gray-500 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                         hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2 transition-all duration-200"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {submitting 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : editingUser 
                    ? (language === 'ar' ? 'تحديث المستخدم' : 'Update User')
                    : (language === 'ar' ? 'إضافة المستخدم' : 'Add User')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;