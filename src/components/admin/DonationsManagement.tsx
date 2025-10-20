import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import { Plus, Heart, Eye, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { donationBoxesService, type DonationBox, type CreateDonationBoxData } from '../../services/donationBoxesService';

// Using DonationBox interface from service

interface NewDonationForm {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  icon: string;
  target: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const DonationsManagement: React.FC = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationBox | null>(null);
  
  const [newDonationForm, setNewDonationForm] = useState<NewDonationForm>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    color: 'bg-blue-500',
    icon: 'Heart',
    target: '',
    category: 'general',
    priority: 'medium'
  });
  
  const [donations, setDonations] = useState<DonationBox[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  // Load donation boxes on component mount
  useEffect(() => {
    loadDonationBoxes();
  }, []);

  const loadDonationBoxes = async () => {
    try {
      console.log('بدء تحميل صناديق التبرع...');
      setLoading(true);
      
      // تحقق من حالة المصادقة
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        console.warn('لا يوجد مستخدم مسجل دخول');
        toast.warning(
          language === 'ar' 
            ? 'يجب تسجيل الدخول لعرض صناديق التبرع' 
            : 'Please login to view donation boxes'
        );
        setLoading(false);
        return;
      }
      
      console.log('محاولة جلب صناديق التبرع من Firestore...');
      const boxes = await donationBoxesService.getDonationBoxes();
      console.log(`تم جلب ${boxes.length} صندوق من قاعدة البيانات`);
      
      // If no boxes exist, create default ones
      if (boxes.length === 0) {
        console.log('لا توجد صناديق، سيتم إنشاء الصناديق الافتراضية...');
        await createDefaultBoxes();
        console.log('تم إنشاء الصناديق الافتراضية، جاري إعادة التحميل...');
        const newBoxes = await donationBoxesService.getDonationBoxes();
        console.log(`تم جلب ${newBoxes.length} صندوق بعد إنشاء الافتراضية`);
        setDonations(newBoxes);
      } else {
        setDonations(boxes);
      }
      
      console.log('تم تحميل صناديق التبرع بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل صناديق التبرع:', error);
      
      if (error instanceof Error) {
        console.error('تفاصيل الخطأ:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // معالجة أخطاء محددة
        if (error.message.includes('permission-denied') || error.message.includes('Permission denied')) {
          toast.error(
            language === 'ar' 
              ? 'ليس لديك صلاحية للوصول إلى صناديق التبرع. تحقق من قواعد Firestore.' 
              : 'You do not have permission to access donation boxes. Check Firestore rules.'
          );
        } else if (error.message.includes('network') || error.message.includes('offline')) {
          toast.error(
            language === 'ar' 
              ? 'مشكلة في الاتصال بالإنترنت. يرجى المحاولة مرة أخرى.' 
              : 'Network connection issue. Please try again.'
          );
        } else {
          toast.error(
            language === 'ar' 
              ? `خطأ في تحميل صناديق التبرع: ${error.message}` 
              : `Error loading donation boxes: ${error.message}`
          );
        }
      } else {
        toast.error(
          language === 'ar' 
            ? 'خطأ غير معروف في تحميل صناديق التبرع' 
            : 'Unknown error loading donation boxes'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBoxes = async () => {
    console.log('بدء إنشاء الصناديق الافتراضية...');
    
    const defaultBoxes = [
      {
        title: 'تبرع عام',
        titleEn: 'General Donation',
        description: 'للمساهمة في أنشطة الكنيسة العامة',
        descriptionEn: 'To contribute to general church activities',
        color: 'bg-red-500',
        icon: 'Heart',
        target: 50000,
        category: 'general',
        priority: 'high' as const
      },
      {
        title: 'صندوق البناء',
        titleEn: 'Building Fund',
        description: 'للمساهمة في مشاريع البناء والتطوير',
        descriptionEn: 'To contribute to building and development projects',
        color: 'bg-blue-500',
        icon: 'Users',
        target: 200000,
        category: 'building',
        priority: 'high' as const
      },
      {
        title: 'صندوق الفقراء',
        titleEn: 'Poor Fund',
        description: 'لمساعدة المحتاجين والأسر الفقيرة',
        descriptionEn: 'To help the needy and poor families',
        color: 'bg-green-500',
        icon: 'Gift',
        target: 30000,
        category: 'charity',
        priority: 'medium' as const
      }
    ];

    let successCount = 0;
    for (const [index, box] of defaultBoxes.entries()) {
      try {
        console.log(`إنشاء الصندوق ${index + 1}: ${box.title}`);
        const boxId = await donationBoxesService.addDonationBox(box);
        console.log(`تم إنشاء الصندوق بنجاح - ID: ${boxId}`);
        successCount++;
      } catch (error) {
        console.error(`خطأ في إنشاء الصندوق ${box.title}:`, error);
      }
    }
    
    console.log(`تم إنشاء ${successCount} صندوق من أصل ${defaultBoxes.length}`);
    
    if (successCount === 0) {
      throw new Error('فشل في إنشاء أي صندوق افتراضي');
    }
  };

  // Category options
  const categoryOptions = [
    { value: 'general', label: language === 'ar' ? 'عام' : 'General' },
    { value: 'building', label: language === 'ar' ? 'بناء' : 'Building' },
    { value: 'charity', label: language === 'ar' ? 'خيري' : 'Charity' },
    { value: 'education', label: language === 'ar' ? 'تعليمي' : 'Education' },
    { value: 'youth', label: language === 'ar' ? 'شباب' : 'Youth' },
    { value: 'children', label: language === 'ar' ? 'أطفال' : 'Children' },
    { value: 'maintenance', label: language === 'ar' ? 'صيانة' : 'Maintenance' },
    { value: 'mission', label: language === 'ar' ? 'رسالة' : 'Mission' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'high', label: language === 'ar' ? 'عالية' : 'High', color: 'text-red-600' },
    { value: 'medium', label: language === 'ar' ? 'متوسطة' : 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: language === 'ar' ? 'منخفضة' : 'Low', color: 'text-green-600' }
  ];

  // Helper function to get category label
  const getCategoryLabel = (categoryKey: string) => {
    const category = categoryOptions.find(c => c.value === categoryKey);
    return category ? category.label : categoryKey;
  };

  // Helper function to get priority label and color
  const getPriorityInfo = (priority: string) => {
    const priorityInfo = priorityOptions.find(p => p.value === priority);
    return priorityInfo || { label: priority, color: 'text-gray-600' };
  };

  // Form validation
  const validateForm = (): boolean => {
    console.log('Validating form with data:', newDonationForm);
    
    if (!newDonationForm.title.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال العنوان بالعربية' : 'Please enter Arabic title');
      return false;
    }
    
    if (!newDonationForm.titleEn.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال العنوان بالإنجليزية' : 'Please enter English title');
      return false;
    }
    
    if (!newDonationForm.description.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الوصف بالعربية' : 'Please enter Arabic description');
      return false;
    }
    
    if (!newDonationForm.descriptionEn.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الوصف بالإنجليزية' : 'Please enter English description');
      return false;
    }
    
    if (!newDonationForm.target || parseFloat(newDonationForm.target) <= 0) {
      toast.error(language === 'ar' ? 'يرجى إدخال مبلغ هدف صحيح' : 'Please enter a valid target amount');
      return false;
    }
    
    console.log('Form validation passed');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current user:', currentUser);
    console.log('Form data:', newDonationForm);
    
    // Check if user is authenticated
    if (!currentUser) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in first');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const boxData: CreateDonationBoxData = {
        title: newDonationForm.title,
        titleEn: newDonationForm.titleEn,
        description: newDonationForm.description,
        descriptionEn: newDonationForm.descriptionEn,
        color: newDonationForm.color,
        icon: newDonationForm.icon,
        target: parseFloat(newDonationForm.target),
        category: newDonationForm.category,
        priority: newDonationForm.priority
      };

      console.log('Calling donationBoxesService.addDonationBox with:', boxData);
      await donationBoxesService.addDonationBox(boxData);
      console.log('Successfully added donation box');
      
      console.log('Reloading donation boxes...');
      await loadDonationBoxes(); // Reload data
      console.log('Successfully reloaded donation boxes');
      
      toast.success(
        language === 'ar' 
          ? 'تم إضافة الصندوق بنجاح!' 
          : 'Donation box added successfully!'
      );

      handleCloseForm();

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast.error(
        language === 'ar' 
          ? `حدث خطأ أثناء إضافة الصندوق: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` 
          : `An error occurred while adding the donation box: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and close modal
  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewDonationForm({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      color: 'bg-blue-500',
      icon: 'Heart',
      target: '',
      category: 'general',
      priority: 'medium'
    });
  };

  // Handle details dialog
  const handleShowDetails = (donation: DonationBox) => {
    setSelectedDonation(donation);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedDonation(null);
  };

  // Selection handlers for bulk actions
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = donations.map(d => d.id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setShowDeleteConfirm(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' ? 'جاري تحميل صناديق التبرع...' : 'Loading donation boxes...'}
        </p>
      </div>
    );
  }

  // Show error state with retry button if donations is empty and there was an error
  if (!loading && donations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Heart className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد صناديق تبرع' : 'No donation boxes found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {language === 'ar' 
              ? 'يمكنك إضافة صندوق جديد أو إعادة المحاولة' 
              : 'You can add a new box or try again'
            }
          </p>
          <div className="flex space-x-4 rtl:space-x-reverse justify-center">
            <button
              onClick={loadDonationBoxes}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'إضافة صندوق' : 'Add Box'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 tab-content mt-10">
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            const results = await Promise.allSettled(selectedIds.map(id => donationBoxesService.deleteDonationBox(id)));
            const successes: string[] = [];
            const failures: { id: string; reason: any }[] = [];
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled') successes.push(selectedIds[idx]);
              else failures.push({ id: selectedIds[idx], reason: r.reason });
            });
            if (successes.length > 0) {
              toast.success(
                language === 'ar' ? `تم حذف ${successes.length} صندوق بنجاح` : `${successes.length} box(es) deleted successfully`
              );
            }
            if (failures.length > 0) {
              console.error('Bulk delete failures:', failures);
              toast.error(
                language === 'ar' ? `فشل في حذف ${failures.length} صندوق` : `Failed to delete ${failures.length} box(es)`
              );
            }
            setDonations(prev => prev.filter(d => !selectedIds.includes(d.id)));
            setSelectedIds([]);
            setSelectAll(false);
          } catch (error) {
            console.error('Error during bulk delete:', error);
            toast.error(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'An error occurred while deleting');
          } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
          }
        }}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
        message={language === 'ar'
          ? `هل أنت متأكد من حذف ${selectedIds.length} صندوق؟ هذا الإجراء لا يمكن التراجع عنه.`
          : `Are you sure you want to delete ${selectedIds.length} box(es)? This action cannot be undone.`}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
      />
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة التبرعات' : 'Donations Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'متابعة وإدارة جميع التبرعات والصناديق' : 'Track and manage all donations and funds'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={selectAll} onChange={handleToggleSelectAll} className="form-checkbox h-4 w-4" />
                  <span>{language === 'ar' ? 'تحديد الكل' : 'Select All'}</span>
                </label>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0 || isDeleting}
                  className={`px-4 py-2 rounded-lg text-white ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} flex items-center space-x-2 rtl:space-x-reverse`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}</span>
                </button>
              </div>
              <button 
                onClick={() => setShowAddForm(true)}
                className="floating-btn bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                <span>{language === 'ar' ? 'إضافة صندوق جديد' : 'Add New Fund'}</span>
              </button>
            </div>
        </div>
      </div>

      {/* Add New Donation Box Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {language === 'ar' ? 'إضافة صندوق تبرعات جديد' : 'Add New Donation Box'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === 'ar' ? 'قم بملء جميع البيانات المطلوبة' : 'Fill in all required information'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'} *
                  </label>
                  <input
                    type="text"
                    value={newDonationForm.title}
                    onChange={(e) => setNewDonationForm(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'مثل: صندوق الأيتام' : 'e.g: Orphans Fund'}
                    dir="rtl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'} *
                  </label>
                  <input
                    type="text"
                    value={newDonationForm.titleEn}
                    onChange={(e) => setNewDonationForm(prev => ({...prev, titleEn: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g: Orphans Fund"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'} *
                  </label>
                  <textarea
                    value={newDonationForm.description}
                    onChange={(e) => setNewDonationForm(prev => ({...prev, description: e.target.value}))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'وصف مختصر عن الهدف من الصندوق...' : 'Brief description...'}
                    dir="rtl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'} *
                  </label>
                  <textarea
                    value={newDonationForm.descriptionEn}
                    onChange={(e) => setNewDonationForm(prev => ({...prev, descriptionEn: e.target.value}))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of the fund purpose..."
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المبلغ المستهدف' : 'Target Amount'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={newDonationForm.target}
                    onChange={(e) => setNewDonationForm(prev => ({...prev, target: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10000"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'اللون' : 'Color'}
                    </label>
                    <select
                      value={newDonationForm.color}
                      onChange={(e) => setNewDonationForm(prev => ({...prev, color: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="bg-red-500">{language === 'ar' ? 'أحمر' : 'Red'}</option>
                      <option value="bg-blue-500">{language === 'ar' ? 'أزرق' : 'Blue'}</option>
                      <option value="bg-green-500">{language === 'ar' ? 'أخضر' : 'Green'}</option>
                      <option value="bg-yellow-500">{language === 'ar' ? 'أصفر' : 'Yellow'}</option>
                      <option value="bg-purple-500">{language === 'ar' ? 'بنفسجي' : 'Purple'}</option>
                      <option value="bg-pink-500">{language === 'ar' ? 'وردي' : 'Pink'}</option>
                      <option value="bg-indigo-500">{language === 'ar' ? 'نيلي' : 'Indigo'}</option>
                      <option value="bg-orange-500">{language === 'ar' ? 'برتقالي' : 'Orange'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الأيقونة' : 'Icon'}
                    </label>
                    <select
                      value={newDonationForm.icon}
                      onChange={(e) => setNewDonationForm(prev => ({...prev, icon: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Heart">{language === 'ar' ? 'قلب' : 'Heart'}</option>
                      <option value="Users">{language === 'ar' ? 'مجموعة' : 'Users'}</option>
                      <option value="Gift">{language === 'ar' ? 'هدية' : 'Gift'}</option>
                      <option value="Home">{language === 'ar' ? 'منزل' : 'Home'}</option>
                      <option value="BookOpen">{language === 'ar' ? 'كتاب' : 'Book'}</option>
                      <option value="Star">{language === 'ar' ? 'نجمة' : 'Star'}</option>
                      <option value="Shield">{language === 'ar' ? 'درع' : 'Shield'}</option>
                      <option value="Cross">{language === 'ar' ? 'صليب' : 'Cross'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <select
                      value={newDonationForm.category}
                      onChange={(e) => setNewDonationForm(prev => ({...prev, category: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <select
                      value={newDonationForm.priority}
                      onChange={(e) => setNewDonationForm(prev => ({...prev, priority: e.target.value as 'high' | 'medium' | 'low'}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>{language === 'ar' ? 'إضافة الصندوق' : 'Add Fund'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Dialog Modal */}
      {showDetailsDialog && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? selectedDonation.title : selectedDonation.titleEn}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'العنوان' : 'Title'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      {language === 'ar' ? selectedDonation.title : selectedDonation.titleEn}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الوصف' : 'Description'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      {language === 'ar' ? selectedDonation.description : selectedDonation.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                  {language === 'ar' ? 'المعلومات المالية' : 'Financial Information'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'المبلغ المحصل' : 'Amount Raised'}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedDonation.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'ج.م' : 'EGP'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'الهدف المالي' : 'Target Amount'}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedDonation.target.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'ج.م' : 'EGP'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'المبلغ المطلوب' : 'Remaining'}
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {(selectedDonation.target - selectedDonation.currentAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'ج.م' : 'EGP'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>{language === 'ar' ? 'معدل الإنجاز' : 'Progress'}</span>
                    <span>{((selectedDonation.currentAmount / selectedDonation.target) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className={`${selectedDonation.color} h-4 rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min((selectedDonation.currentAmount / selectedDonation.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  {language === 'ar' ? 'إعدادات الصندوق' : 'Fund Settings'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {getCategoryLabel(selectedDonation.category)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className={`font-medium ${getPriorityInfo(selectedDonation.priority).color}`}>
                        {getPriorityInfo(selectedDonation.priority).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                
                {/* Removed individual edit button as bulk actions are supported */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donations.map((donation) => {
          const percentage = (donation.currentAmount / donation.target) * 100;
          return (
            <div key={donation.key} className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? donation.title : donation.titleEn}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {language === 'ar' ? donation.description : donation.descriptionEn}
                  </p>
                </div>
                <div className={`${donation.color} p-3 rounded-xl`}>
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? 'المبلغ المحصل' : 'Amount Raised'}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {donation.currentAmount.toLocaleString()} / {donation.target.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`${donation.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {percentage.toFixed(1)}% {language === 'ar' ? 'مكتمل' : 'completed'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? 'المطلوب:' : 'Target:'} {(donation.target - donation.currentAmount).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="flex space-x-2 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700 items-center">
                  <label className="flex items-center mr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(donation.id)}
                      onChange={() => handleToggleSelect(donation.id)}
                      className="form-checkbox h-4 w-4"
                    />
                  </label>
                  <button 
                    onClick={() => handleShowDetails(donation)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse transform hover:scale-105"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                  </button>
                  {/* individual edit removed */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonationsManagement;