import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, X, ChevronRight, ChevronLeft, Save, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMeetings } from '../../contexts/MeetingsContext';
import { toast } from 'react-toastify';
import ConfirmDialog from '../ConfirmDialog';

interface MeetingFormData {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  time: string;
  day: string;
  dayEn: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  capacity: number;
}

interface FormStep {
  id: number;
  title: string;
  titleEn: string;
  fields: string[];
}

const MeetingsManagement: React.FC = () => {
  const { language } = useLanguage();
  const { meetings, addMeeting, updateMeeting, deleteMeeting, loading, error } = useMeetings();
  
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MeetingFormData>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState<MeetingFormData>({
    title: '',
    titleEn: '',
    subtitle: '',
    subtitleEn: '',
    time: '',
    day: '',
    dayEn: '',
    location: '',
    locationEn: '',
    category: 'الشباب',
    categoryEn: 'Youth',
    capacity: 50
  });

  const formSteps: FormStep[] = [
    {
      id: 1,
      title: 'المعلومات الأساسية',
      titleEn: 'Basic Information',
      fields: ['title', 'titleEn', 'subtitle', 'subtitleEn']
    },
    {
      id: 2,
      title: 'التوقيت والمكان',
      titleEn: 'Time & Location',
      fields: ['day', 'time', 'location', 'locationEn']
    },
    {
      id: 3,
      title: 'التفاصيل النهائية',
      titleEn: 'Final Details',
      fields: ['category', 'capacity']
    }
  ];

  const categories = [
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' },
    { key: 'ladies', label: 'السيدات', labelEn: 'Ladies' },
    { key: 'men', label: 'الرجال', labelEn: 'Men' },
    { key: 'general', label: 'عام', labelEn: 'General' }
  ];

  const days = [
    { key: 'sunday', label: 'الأحد', labelEn: 'Sunday' },
    { key: 'monday', label: 'الاثنين', labelEn: 'Monday' },
    { key: 'tuesday', label: 'الثلاثاء', labelEn: 'Tuesday' },
    { key: 'wednesday', label: 'الأربعاء', labelEn: 'Wednesday' },
    { key: 'thursday', label: 'الخميس', labelEn: 'Thursday' },
    { key: 'friday', label: 'الجمعة', labelEn: 'Friday' },
    { key: 'saturday', label: 'السبت', labelEn: 'Saturday' }
  ];

  // Validation function for current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    const currentFields = formSteps[step - 1]?.fields || [];

    currentFields.forEach(field => {
      const value = meetingForm[field as keyof MeetingFormData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field] = language === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
    });

    // Special validation for capacity
    if (currentFields.includes('capacity') && meetingForm.capacity < 1) {
      errors.capacity = language === 'ar' ? 'يجب أن يكون العدد أكثر من صفر' : 'Capacity must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Reset form and state
  const resetForm = () => {
    setMeetingForm({
      title: '',
      titleEn: '',
      subtitle: '',
      subtitleEn: '',
      time: '',
      day: '',
      dayEn: '',
      location: '',
      locationEn: '',
      category: 'الشباب',
      categoryEn: 'Youth',
      capacity: 50
    });
    setCurrentStep(1);
    setFormErrors({});
    setIsPreviewMode(false);
    setShowMeetingForm(false);
  };

  // Edit meeting functions
  const handleEditMeeting = (meeting: any) => {
    setEditingMeeting(meeting.id);
    
    // Convert category key to label for editing
    const categoryData = categories.find(c => c.key === meeting.category);
    
    setEditForm({
      title: meeting.title,
      titleEn: meeting.titleEn,
      subtitle: meeting.subtitle,
      subtitleEn: meeting.subtitleEn,
      time: meeting.time,
      day: meeting.day,
      dayEn: meeting.dayEn,
      location: meeting.location,
      locationEn: meeting.locationEn,
      category: categoryData?.label || meeting.category,
      categoryEn: categoryData?.labelEn || meeting.categoryEn,
      capacity: meeting.capacity
    });
  };

  const handleSaveEdit = async (meetingId: string) => {
    try {
      // Convert category label back to key for storage
      const categoryKey = categories.find(c => 
        c.label === editForm.category || c.labelEn === editForm.categoryEn
      )?.key || 'youth';
      
      const updateData = {
        ...editForm,
        category: categoryKey
      };
      
      await updateMeeting(meetingId, updateData);
      setEditingMeeting(null);
      setEditForm({});
      toast.success(
        language === 'ar' ? 'تم تحديث الاجتماع بنجاح!' : 'Meeting updated successfully!'
      );
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error(
        language === 'ar' ? 'فشل في تحديث الاجتماع' : 'Failed to update meeting'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingMeeting(null);
    setEditForm({});
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validate all steps before submission
    let allValid = true;
    for (let i = 1; i <= formSteps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    
    if (!allValid) return;
    
    setSubmitting(true);
    
    try {
      // Convert category label back to key for storage
      const categoryKey = categories.find(c => 
        c.label === meetingForm.category || c.labelEn === meetingForm.categoryEn
      )?.key || 'youth';
      
      const newMeeting = {
        ...meetingForm,
        category: categoryKey,
        description: meetingForm.subtitle,
        descriptionEn: meetingForm.subtitleEn
      };
      
      await addMeeting(newMeeting);
      resetForm();
      toast.success(
        language === 'ar' ? 'تم إضافة الاجتماع بنجاح!' : 'Meeting added successfully!'
      );
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast.error(
        language === 'ar' ? 'فشل في إضافة الاجتماع' : 'Failed to add meeting'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Smart Input Component
  const SmartInput: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    options?: Array<{key: string; label: string; labelEn: string}>;
  }> = ({ label, type = 'text', value, onChange, placeholder, required, error, options }) => {
    const inputClasses = `w-full px-4 py-3 border rounded-xl transition-colors duration-200 form-input-smooth
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none
                         ${error 
                           ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                           : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                         }`;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClasses}
            required={required}
          >
            <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
            {options.map((option) => (
              <option key={option.key} value={language === 'ar' ? option.label : option.labelEn}>
                {language === 'ar' ? option.label : option.labelEn}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
            placeholder={placeholder}
            className={inputClasses}
            required={required}
            min={type === 'number' ? 1 : undefined}
          />
        )}
        
        {error && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  // Step indicator component
  const StepIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-8">
      {formSteps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center space-x-2 rtl:space-x-reverse ${
            currentStep === step.id ? 'text-blue-600' : 
            currentStep > step.id ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              currentStep === step.id ? 'bg-blue-600 text-white scale-110' :
              currentStep > step.id ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {language === 'ar' ? step.title : step.titleEn}
            </span>
          </div>
          {index < formSteps.length - 1 && (
            <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const handleDeleteMeeting = async (id: string) => {
    setMeetingToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    
    try {
      await deleteMeeting(meetingToDelete);
      toast.success(
        language === 'ar' ? 'تم حذف الاجتماع بنجاح!' : 'Meeting deleted successfully!'
      );
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error(
        language === 'ar' ? 'فشل في حذف الاجتماع' : 'Failed to delete meeting'
      );
    } finally {
      setShowConfirmDialog(false);
      setMeetingToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إدارة الاجتماعات' : 'Meetings Management'}
          </h2>
          <button 
            onClick={() => setShowMeetingForm(!showMeetingForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting'}</span>
          </button>
        </div>

        {/* Enhanced Meeting Form */}
        {showMeetingForm && (
          <div className="mb-8 relative">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              {/* Header with sparkles */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {language === 'ar' ? 'إضافة اجتماع جديد' : 'Add New Meeting'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {language === 'ar' ? 'املأ البيانات بعناية لإنشاء اجتماع مثالي' : 'Fill in the details carefully to create the perfect meeting'}
                    </p>
                  </div>
                </div>
                
                {/* Preview Toggle */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-all duration-300 ${
                      isPreviewMode 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{isPreviewMode ? (language === 'ar' ? 'إخفاء المعاينة' : 'Hide Preview') : (language === 'ar' ? 'معاينة' : 'Preview')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Step Indicator */}
              <StepIndicator />

              {/* Form Content */}
              <form onSubmit={handleMeetingSubmit} className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {language === 'ar' ? 'ابدأ بإدخال العنوان والوصف' : 'Start by entering the title and description'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SmartInput
                        label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                        value={meetingForm.title}
                        onChange={(value) => setMeetingForm({...meetingForm, title: value as string})}
                        placeholder={language === 'ar' ? 'أدخل عنوان الاجتماع' : 'Enter meeting title'}
                        required
                        error={formErrors.title}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                        value={meetingForm.titleEn}
                        onChange={(value) => setMeetingForm({...meetingForm, titleEn: value as string})}
                        placeholder="Enter meeting title in English"
                        required
                        error={formErrors.titleEn}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                        value={meetingForm.subtitle}
                        onChange={(value) => setMeetingForm({...meetingForm, subtitle: value as string})}
                        placeholder={language === 'ar' ? 'أدخل وصفاً مختصراً للاجتماع' : 'Enter a short description'}
                        error={formErrors.subtitle}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                        value={meetingForm.subtitleEn}
                        onChange={(value) => setMeetingForm({...meetingForm, subtitleEn: value as string})}
                        placeholder="Enter a short description in English"
                        error={formErrors.subtitleEn}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Time & Location */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? 'التوقيت والمكان' : 'Time & Location'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {language === 'ar' ? 'حدد موعد ومكان الاجتماع' : 'Set the meeting schedule and location'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SmartInput
                        label={language === 'ar' ? 'اليوم' : 'Day'}
                        value={meetingForm.day}
                        onChange={(value) => {
                          const selectedDay = days.find(d => d.label === value || d.labelEn === value);
                          setMeetingForm({
                            ...meetingForm, 
                            day: selectedDay?.label || value as string,
                            dayEn: selectedDay?.labelEn || value as string
                          });
                        }}
                        options={days}
                        required
                        error={formErrors.day}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'الوقت' : 'Time'}
                        value={meetingForm.time}
                        onChange={(value) => setMeetingForm({...meetingForm, time: value as string})}
                        placeholder={language === 'ar' ? 'مثال: 10:00 AM' : 'Example: 10:00 AM'}
                        required
                        error={formErrors.time}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'المكان (عربي)' : 'Location (Arabic)'}
                        value={meetingForm.location}
                        onChange={(value) => setMeetingForm({...meetingForm, location: value as string})}
                        placeholder={language === 'ar' ? 'أدخل مكان الاجتماع' : 'Enter meeting location'}
                        required
                        error={formErrors.location}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'المكان (إنجليزي)' : 'Location (English)'}
                        value={meetingForm.locationEn}
                        onChange={(value) => setMeetingForm({...meetingForm, locationEn: value as string})}
                        placeholder="Enter meeting location in English"
                        required
                        error={formErrors.locationEn}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Final Details */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? 'التفاصيل النهائية' : 'Final Details'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {language === 'ar' ? 'اختر الفئة المستهدفة وحدد عدد المقاعد' : 'Choose target category and set capacity'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SmartInput
                        label={language === 'ar' ? 'الفئة المستهدفة' : 'Target Category'}
                        value={language === 'ar' ? meetingForm.category : meetingForm.categoryEn}
                        onChange={(value) => {
                          const selectedCategory = categories.find(c => 
                            (language === 'ar' ? c.label === value : c.labelEn === value)
                          );
                          if (selectedCategory) {
                            setMeetingForm({
                              ...meetingForm, 
                              category: selectedCategory.label,
                              categoryEn: selectedCategory.labelEn
                            });
                          }
                        }}
                        options={categories}
                        required
                        error={formErrors.category}
                      />
                      
                      <SmartInput
                        label={language === 'ar' ? 'عدد المقاعد' : 'Capacity'}
                        type="number"
                        value={meetingForm.capacity}
                        onChange={(value) => setMeetingForm({...meetingForm, capacity: value as number})}
                        placeholder={language === 'ar' ? 'أدخل عدد المقاعد' : 'Enter capacity'}
                        required
                        error={formErrors.capacity}
                      />
                    </div>
                  </div>
                )}

                {/* Form Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <ChevronLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        <span>{language === 'ar' ? 'السابق' : 'Previous'}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    
                    {currentStep < formSteps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
                        <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {submitting 
                            ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                            : (language === 'ar' ? 'حفظ الاجتماع' : 'Save Meeting')
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
              
              {/* Preview Section */}
              {isPreviewMode && currentStep === formSteps.length && (
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                    <Eye className="h-5 w-5" />
                    <span>{language === 'ar' ? 'معاينة الاجتماع' : 'Meeting Preview'}</span>
                  </h5>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h6 className="font-bold text-gray-900 dark:text-white mb-2">
                      {language === 'ar' ? meetingForm.title : meetingForm.titleEn}
                    </h6>
                    {(meetingForm.subtitle || meetingForm.subtitleEn) && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {language === 'ar' ? meetingForm.subtitle : meetingForm.subtitleEn}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="h-4 w-4" />
                        <span>{language === 'ar' ? meetingForm.day : meetingForm.dayEn} - {meetingForm.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MapPin className="h-4 w-4" />
                        <span>{language === 'ar' ? meetingForm.location : meetingForm.locationEn}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Users className="h-4 w-4" />
                        <span>{meetingForm.capacity} {language === 'ar' ? 'مقعد' : 'seats'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الاجتماعات الحالية' : 'Current Meetings'}
          </h3>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {language === 'ar' ? 'حدث خطأ في تحميل الاجتماعات' : 'Error loading meetings'}
              </p>
            </div>
          )}
          
          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                {language === 'ar' ? 'جاري تحميل الاجتماعات...' : 'Loading meetings...'}
              </p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'لا توجد اجتماعات حالياً' : 'No meetings available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="group relative">
                  {/* Enhanced Meeting Card */}
                  <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden meeting-card">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full translate-y-4 -translate-x-4"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shadow-sm">
                        {language === 'ar' ? categories.find(c => c.key === meeting.category)?.label : categories.find(c => c.key === meeting.category)?.labelEn}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEditMeeting(meeting)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-blue-600 hover:text-blue-700"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-red-600 hover:text-red-700"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="relative pt-8">
                      {editingMeeting === meeting.id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full px-3 py-2 text-lg font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors duration-200 form-input-smooth"
                            placeholder={language === 'ar' ? 'عنوان الاجتماع' : 'Meeting Title'}
                          />
                          <input
                            type="text"
                            value={editForm.titleEn || ''}
                            onChange={(e) => setEditForm({...editForm, titleEn: e.target.value})}
                            className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                            placeholder="Meeting Title (English)"
                          />
                          <input
                            type="text"
                            value={editForm.time || ''}
                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                            className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                            placeholder={language === 'ar' ? 'الوقت' : 'Time'}
                          />
                          <input
                            type="text"
                            value={editForm.location || ''}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                            placeholder={language === 'ar' ? 'المكان' : 'Location'}
                          />
                          <input
                            type="number"
                            value={editForm.capacity || ''}
                            onChange={(e) => setEditForm({...editForm, capacity: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                            placeholder={language === 'ar' ? 'العدد الأقصى' : 'Capacity'}
                          />
                          <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                            <button
                              onClick={() => handleSaveEdit(meeting.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                            >
                              <Save className="h-4 w-4" />
                              <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                            >
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                            {language === 'ar' ? meeting.title : meeting.titleEn}
                          </h4>
                          
                          {meeting.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {language === 'ar' ? meeting.subtitle : meeting.subtitleEn}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium">{language === 'ar' ? meeting.day : meeting.dayEn}</p>
                                <p className="text-xs text-gray-500">{meeting.time}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{language === 'ar' ? meeting.location : meeting.locationEn}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="font-medium">{meeting.registered || 0} / {meeting.capacity}</p>
                                <p className="text-xs text-gray-500">{language === 'ar' ? 'مشارك' : 'participants'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>{language === 'ar' ? 'معدل التسجيل' : 'Registration Rate'}</span>
                              <span>{Math.round(((meeting.registered || 0) / meeting.capacity) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(((meeting.registered || 0) / meeting.capacity) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setMeetingToDelete(null);
        }}
        onConfirm={confirmDeleteMeeting}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الاجتماع؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this meeting? This action cannot be undone.'}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
      />
    </div>
  );
};

export default MeetingsManagement;