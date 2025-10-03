import React, { useState } from 'react';
import { Plus, Heart, Eye, Edit, X, Save, AlertCircle, DollarSign, Target, FileText, Palette } from 'lucide-react';
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
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

  // Available colors for donation boxes
  const colorOptions = [
    { value: 'bg-red-500', label: language === 'ar' ? 'أحمر' : 'Red', color: '#ef4444' },
    { value: 'bg-blue-500', label: language === 'ar' ? 'أزرق' : 'Blue', color: '#3b82f6' },
    { value: 'bg-green-500', label: language === 'ar' ? 'أخضر' : 'Green', color: '#10b981' },
    { value: 'bg-purple-500', label: language === 'ar' ? 'بنفسجي' : 'Purple', color: '#8b5cf6' },
    { value: 'bg-yellow-500', label: language === 'ar' ? 'أصفر' : 'Yellow', color: '#eab308' },
    { value: 'bg-pink-500', label: language === 'ar' ? 'وردي' : 'Pink', color: '#ec4899' },
    { value: 'bg-indigo-500', label: language === 'ar' ? 'نيلي' : 'Indigo', color: '#6366f1' },
    { value: 'bg-orange-500', label: language === 'ar' ? 'برتقالي' : 'Orange', color: '#f97316' }
  ];

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

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newDonationForm.title.trim()) {
      errors.title = language === 'ar' ? 'العنوان بالعربية مطلوب' : 'Arabic title is required';
    }

    if (!newDonationForm.titleEn.trim()) {
      errors.titleEn = language === 'ar' ? 'العنوان بالإنجليزية مطلوب' : 'English title is required';
    }

    if (!newDonationForm.description.trim()) {
      errors.description = language === 'ar' ? 'الوصف بالعربية مطلوب' : 'Arabic description is required';
    }

    if (!newDonationForm.descriptionEn.trim()) {
      errors.descriptionEn = language === 'ar' ? 'الوصف بالإنجليزية مطلوب' : 'English description is required';
    }

    if (!newDonationForm.target || parseFloat(newDonationForm.target) <= 0) {
      errors.target = language === 'ar' ? 'الهدف المالي يجب أن يكون أكبر من صفر' : 'Target amount must be greater than zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

      // Reset form
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
      setShowAddForm(false);
      setFormErrors({});

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

  // Handle form field changes
  const handleFormChange = (field: keyof NewDonationForm, value: string) => {
    setNewDonationForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
    setFormErrors({});
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

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'} *
                    </label>
                    <input
                      type="text"
                      value={newDonationForm.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                        ${formErrors.title ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder={language === 'ar' ? 'مثل: صندوق الأيتام' : 'e.g: Orphans Fund'}
                      dir="rtl"
                    />
                    {formErrors.title && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.title}
                      </div>
                    )}
                  </div>

                  {/* English Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'} *
                    </label>
                    <input
                      type="text"
                      value={newDonationForm.titleEn}
                      onChange={(e) => handleFormChange('titleEn', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                        ${formErrors.titleEn ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="e.g: Orphans Fund"
                      dir="ltr"
                    />
                    {formErrors.titleEn && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.titleEn}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Arabic Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'} *
                    </label>
                    <textarea
                      value={newDonationForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none
                        ${formErrors.description ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder={language === 'ar' ? 'وصف مختصر عن الهدف من الصندوق...' : 'Brief description of the fund purpose...'}
                      dir="rtl"
                    />
                    {formErrors.description && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.description}
                      </div>
                    )}
                  </div>

                  {/* English Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'} *
                    </label>
                    <textarea
                      value={newDonationForm.descriptionEn}
                      onChange={(e) => handleFormChange('descriptionEn', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none
                        ${formErrors.descriptionEn ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Brief description of the fund purpose..."
                      dir="ltr"
                    />
                    {formErrors.descriptionEn && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.descriptionEn}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {language === 'ar' ? 'إعدادات الصندوق' : 'Fund Configuration'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'المبلغ المستهدف' : 'Target Amount'} *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={newDonationForm.target}
                        onChange={(e) => handleFormChange('target', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors
                          ${formErrors.target ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="10000"
                      />
                    </div>
                    {formErrors.target && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.target}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <select
                      value={newDonationForm.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <select
                      value={newDonationForm.priority}
                      onChange={(e) => handleFormChange('priority', e.target.value as 'high' | 'medium' | 'low')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

              {/* Color Selection */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {language === 'ar' ? 'لون الصندوق' : 'Box Color'}
                  </h4>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFormChange('color', option.value)}
                      className={`relative p-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                        newDonationForm.color === option.value 
                          ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110' 
                          : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.label}
                    >
                      {newDonationForm.color === option.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                  {language === 'ar' ? 'اختر لوناً مميزاً للصندوق لسهولة التمييز' : 'Choose a distinctive color for easy identification'}
                </p>
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
                  className={`px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 shadow-lg hover:shadow-xl'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className={`${selectedDonation.color} p-3 rounded-xl`}>
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {language === 'ar' ? selectedDonation.title : selectedDonation.titleEn}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === 'ar' ? 'تفاصيل الصندوق الكاملة' : 'Complete Fund Details'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border" dir="rtl">
                      {selectedDonation.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border" dir="ltr">
                      {selectedDonation.titleEn}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border min-h-[80px]" dir="rtl">
                      {selectedDonation.description}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border min-h-[80px]" dir="ltr">
                      {selectedDonation.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {language === 'ar' ? 'المعلومات المالية' : 'Financial Information'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'المبلغ المحصل' : 'Amount Raised'}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedDonation.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'جنيه مصري' : 'EGP'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'الهدف المالي' : 'Target Amount'}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedDonation.target.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'جنيه مصري' : 'EGP'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
                      <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {language === 'ar' ? 'المبلغ المطلوب' : 'Remaining Amount'}
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {(selectedDonation.target - selectedDonation.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'جنيه مصري' : 'EGP'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>{language === 'ar' ? 'معدل الإنجاز' : 'Progress Rate'}</span>
                    <span>{((selectedDonation.amount / selectedDonation.target) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className={`${selectedDonation.color} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                      style={{ width: `${Math.min((selectedDonation.amount / selectedDonation.target) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {language === 'ar' ? 'إعدادات الصندوق' : 'Fund Configuration'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {getCategoryLabel(selectedDonation.category)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className={`font-medium ${getPriorityInfo(selectedDonation.priority).color}`}>
                        {getPriorityInfo(selectedDonation.priority).label}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className={`font-medium ${
                        selectedDonation.isActive 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedDonation.isActive 
                          ? (language === 'ar' ? 'نشط' : 'Active')
                          : (language === 'ar' ? 'غير نشط' : 'Inactive')
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
                    </label>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedDonation.createdAt.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Color Display */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'لون الصندوق' : 'Box Color'}
                  </label>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-12 h-12 ${selectedDonation.color} rounded-xl shadow-lg border-2 border-white dark:border-gray-600`}></div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border flex-1">
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {colorOptions.find(c => c.value === selectedDonation.color)?.label || selectedDonation.color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseDetails}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  <Edit className="h-4 w-4" />
                  <span>{language === 'ar' ? 'تعديل الصندوق' : 'Edit Fund'}</span>
                </button>
                
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                  <DollarSign className="h-4 w-4" />
                  <span>{language === 'ar' ? 'إضافة تبرع' : 'Add Donation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donations Grid */
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