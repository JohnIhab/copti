import React, { useState } from 'react';
import { Plus, Heart, Eye, Edit, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

interface DonationType {
  id: string;
  key: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  amount: number;
  target: number;
  isActive: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

interface NewDonationForm {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  target: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const DonationsManagement: React.FC = () => {
  const { language } = useLanguage();
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationType | null>(null);
  
  const [newDonationForm, setNewDonationForm] = useState<NewDonationForm>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    color: 'bg-blue-500',
    target: '',
    category: 'general',
    priority: 'medium'
  });
  
  const [donations, setDonations] = useState<DonationType[]>([
    {
      id: '1',
      key: 'general',
      title: 'تبرع عام',
      titleEn: 'General Donation',
      description: 'للمساهمة في أنشطة الكنيسة العامة',
      descriptionEn: 'To contribute to general church activities',
      color: 'bg-red-500',
      amount: 15000,
      target: 50000,
      isActive: true,
      category: 'general',
      priority: 'high',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      key: 'building',
      title: 'صندوق البناء',
      titleEn: 'Building Fund',
      description: 'للمساهمة في مشاريع البناء والتطوير',
      descriptionEn: 'To contribute to building and development projects',
      color: 'bg-blue-500',
      amount: 75000,
      target: 200000,
      isActive: true,
      category: 'building',
      priority: 'high',
      createdAt: new Date('2024-02-01')
    }
  ]);

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
    // Simple validation for demo
    return newDonationForm.title.trim() !== '' && newDonationForm.titleEn.trim() !== '';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDonation: DonationType = {
        id: Date.now().toString(),
        key: newDonationForm.title.toLowerCase().replace(/\s+/g, '_'),
        title: newDonationForm.title,
        titleEn: newDonationForm.titleEn,
        description: newDonationForm.description,
        descriptionEn: newDonationForm.descriptionEn,
        color: newDonationForm.color,
        amount: 0,
        target: parseFloat(newDonationForm.target),
        isActive: true,
        category: newDonationForm.category,
        priority: newDonationForm.priority,
        createdAt: new Date()
      };

      setDonations(prev => [...prev, newDonation]);
      
      toast.success(
        language === 'ar' 
          ? 'تم إضافة الصندوق بنجاح!' 
          : 'Donation box added successfully!'
      );

      handleCloseForm();

    } catch (error) {
      console.error('Error adding donation box:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء إضافة الصندوق. يرجى المحاولة مرة أخرى.' 
          : 'An error occurred while adding the donation box. Please try again.'
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
      target: '',
      category: 'general',
      priority: 'medium'
    });
  };

  // Handle details dialog
  const handleShowDetails = (donation: DonationType) => {
    setSelectedDonation(donation);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedDonation(null);
  };

  return (
    <div className="space-y-8 tab-content">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                        {selectedDonation.amount.toLocaleString()}
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
                        {(selectedDonation.target - selectedDonation.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'ج.م' : 'EGP'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>{language === 'ar' ? 'معدل الإنجاز' : 'Progress'}</span>
                    <span>{((selectedDonation.amount / selectedDonation.target) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className={`${selectedDonation.color} h-4 rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min((selectedDonation.amount / selectedDonation.target) * 100, 100)}%` }}
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
                
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  <Edit className="h-4 w-4" />
                  <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donations.map((donation) => {
          const percentage = (donation.amount / donation.target) * 100;
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
                    {donation.amount.toLocaleString()} / {donation.target.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
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
                    {language === 'ar' ? 'المطلوب:' : 'Target:'} {(donation.target - donation.amount).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="flex space-x-2 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => handleShowDetails(donation)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse transform hover:scale-105"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                  </button>
                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
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