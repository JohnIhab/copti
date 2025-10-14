import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { uploadEventImage } from '../../services/eventsService';
import ConfirmDialog from '../ConfirmDialog';
import { db } from '../../services/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  serverTimestamp 
} from 'firebase/firestore';

interface Meeting {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  locationEn: string;
  type: string;
  typeEn: string;
  description: string;
  descriptionEn: string;
  organizer: string;
  organizerEn: string;
  maxAttendees: number;
  currentAttendees: number;
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

interface MeetingFormData {
  title: string;
  titleEn: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  locationEn: string;
  type: string;
  description: string;
  descriptionEn: string;
  organizer: string;
  organizerEn: string;
  maxAttendees: number;
  isRecurring: boolean;
  recurrenceType: 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  image?: File | null;
}

const MeetingsManagement: React.FC = () => {
  const { language } = useLanguage();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal and form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    titleEn: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    locationEn: '',
    type: 'general',
    description: '',
    descriptionEn: '',
    organizer: '',
    organizerEn: '',
    maxAttendees: 20,
    isRecurring: false,
    recurrenceType: 'weekly',
    status: 'scheduled'
  });
  const [meetingImageFile, setMeetingImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState('');
  
  const handleMeetingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'ar' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
        return;
      }
    }
    setMeetingImageFile(file);
  };

  const meetingTypes = [
    { value: 'general', label: 'اجتماع عام', labelEn: 'General Meeting' },
    { value: 'prayer', label: 'اجتماع صلاة', labelEn: 'Prayer Meeting' },
    { value: 'bible-study', label: 'دراسة كتابية', labelEn: 'Bible Study' },
    { value: 'youth', label: 'اجتماع شباب', labelEn: 'Youth Meeting' },
    { value: 'children', label: 'اجتماع أطفال', labelEn: 'Children Meeting' },
    { value: 'worship', label: 'اجتماع تسبيح', labelEn: 'Worship Meeting' },
    { value: 'leadership', label: 'اجتماع قيادة', labelEn: 'Leadership Meeting' },
    { value: 'committee', label: 'اجتماع لجنة', labelEn: 'Committee Meeting' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'مجدول', labelEn: 'Scheduled' },
    { value: 'ongoing', label: 'جاري', labelEn: 'Ongoing' },
    { value: 'completed', label: 'مكتمل', labelEn: 'Completed' },
    { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled' }
  ];

  // Load meetings from Firebase
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsRef = collection(db, 'meetings');
      const q = query(meetingsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const meetingsData: Meeting[] = [];
      querySnapshot.forEach((doc) => {
        meetingsData.push({
          id: doc.id,
          ...doc.data()
        } as Meeting);
      });
      
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحميل الاجتماعات'
          : 'Error loading meetings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleInputChange = (field: keyof MeetingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      locationEn: '',
      type: 'general',
      description: '',
      descriptionEn: '',
      organizer: '',
      organizerEn: '',
      maxAttendees: 20,
      isRecurring: false,
      recurrenceType: 'weekly',
      status: 'scheduled'
    });
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim() || !formData.titleEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال عنوان الاجتماع باللغتين العربية والإنجليزية'
          : 'Please enter meeting title in both Arabic and English'
      );
      return false;
    }

    if (!formData.date || !formData.time) {
      toast.error(
        language === 'ar' 
          ? 'يرجى تحديد تاريخ ووقت الاجتماع'
          : 'Please specify meeting date and time'
      );
      return false;
    }

    if (!formData.endTime) {
      toast.error(
        language === 'ar' 
          ? 'يرجى تحديد وقت انتهاء الاجتماع'
          : 'Please specify meeting end time'
      );
      return false;
    }

    if (!formData.location.trim() || !formData.locationEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال مكان الاجتماع باللغتين'
          : 'Please enter meeting location in both languages'
      );
      return false;
    }

    if (!formData.organizer.trim() || !formData.organizerEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال اسم المنظم باللغتين'
          : 'Please enter organizer name in both languages'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const meetingData: any = {
        title: formData.title.trim(),
        titleEn: formData.titleEn.trim(),
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        location: formData.location.trim(),
        locationEn: formData.locationEn.trim(),
        type: formData.type,
        typeEn: meetingTypes.find(type => type.value === formData.type)?.labelEn || 'General Meeting',
        description: formData.description.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        organizer: formData.organizer.trim(),
        organizerEn: formData.organizerEn.trim(),
        maxAttendees: formData.maxAttendees,
        currentAttendees: 0,
        isRecurring: formData.isRecurring,
        recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
        status: formData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // If an image file is selected, upload it to Cloudinary first
      if (meetingImageFile) {
        try {
          setImageUploading(true);
          setImageUploadError('');
          setImageUploadProgress(0);
          const imageUrl = await uploadEventImage(meetingImageFile);
          meetingData['image'] = imageUrl;
          setImageUploading(false);
          setImageUploadProgress(100);
        } catch (imgErr: any) {
          console.error('Meeting image upload failed:', imgErr);
          setImageUploading(false);
          setImageUploadError(imgErr?.message || 'فشل رفع الصورة');
          toast.error(imageUploadError || 'فشل رفع الصورة');
        }
      }

      if (editingMeeting) {
        // Update existing meeting
        const meetingRef = doc(db, 'meetings', editingMeeting.id);
        await updateDoc(meetingRef, {
          ...meetingData,
          updatedAt: serverTimestamp()
        });
        
        toast.success(
          language === 'ar' 
            ? 'تم تحديث الاجتماع بنجاح'
            : 'Meeting updated successfully'
        );
        setShowEditModal(false);
        setEditingMeeting(null);
      } else {
  // Add new meeting
  await addDoc(collection(db, 'meetings'), meetingData);
        
        toast.success(
          language === 'ar' 
            ? 'تم إضافة الاجتماع بنجاح'
            : 'Meeting added successfully'
        );
        setShowAddModal(false);
      }
      
      resetForm();
      loadMeetings(); // Reload meetings
      
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في حفظ الاجتماع'
          : 'Error saving meeting'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      titleEn: meeting.titleEn,
      date: meeting.date,
      time: meeting.time,
      endTime: meeting.endTime,
      location: meeting.location,
      locationEn: meeting.locationEn,
      type: meeting.type,
      description: meeting.description,
      descriptionEn: meeting.descriptionEn,
      organizer: meeting.organizer,
      organizerEn: meeting.organizerEn,
      maxAttendees: meeting.maxAttendees,
      isRecurring: meeting.isRecurring,
      recurrenceType: meeting.recurrenceType || 'weekly',
      status: meeting.status
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!meetingToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'meetings', meetingToDelete.id));
      
      toast.success(
        language === 'ar' 
          ? 'تم حذف الاجتماع بنجاح'
          : 'Meeting deleted successfully'
      );
      
      setShowDeleteConfirm(false);
      setMeetingToDelete(null);
      loadMeetings(); // Reload meetings
      
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في حذف الاجتماع'
          : 'Error deleting meeting'
      );
    }
  };

  const openDeleteConfirm = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setShowDeleteConfirm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إدارة الاجتماعات' : 'Meetings Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' 
              ? 'إضافة وتحرير وحذف الاجتماعات' 
              : 'Add, edit, and delete meetings'
            }
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 ml-2" />
          {language === 'ar' ? 'اجتماع جديد' : 'New Meeting'}
        </button>
      </div>

      {/* Meetings Table */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {meetings.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full"></div>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6 relative z-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {language === 'ar' ? 'لا توجد اجتماعات' : 'No meetings found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {language === 'ar' 
                ? 'ابدأ بإضافة اجتماع جديد لتنظيم أنشطة الكنيسة' 
                : 'Start by adding a new meeting to organize church activities'
              }
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 ml-2" />
              {language === 'ar' ? 'إضافة أول اجتماع' : 'Add First Meeting'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{language === 'ar' ? 'العنوان' : 'Title'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'المكان' : 'Location'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'المنظم' : 'Organizer'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الحضور' : 'Attendees'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {meetings.map((meeting, index) => (
                  <tr 
                    key={meeting.id} 
                    className={`
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 
                      dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 
                      transition-all duration-200 
                      ${index % 2 === 0 ? 'bg-gray-50/30 dark:bg-gray-700/30' : 'bg-white dark:bg-gray-800'}
                    `}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">
                          {language === 'ar' ? meeting.title : meeting.titleEn}
                        </div>
                        {meeting.isRecurring && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1.5 animate-pulse"></div>
                            {language === 'ar' ? 'متكرر' : 'Recurring'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {language === 'ar' 
                          ? meetingTypes.find(t => t.value === meeting.type)?.label
                          : meetingTypes.find(t => t.value === meeting.type)?.labelEn
                        }
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(meeting.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {formatTime(meeting.time)} - {formatTime(meeting.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {language === 'ar' ? meeting.location : meeting.locationEn}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {language === 'ar' ? meeting.organizer : meeting.organizerEn}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {meeting.currentAttendees}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {meeting.maxAttendees}
                          </span>
                        </div>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                            style={{ 
                              width: `${Math.min((meeting.currentAttendees / meeting.maxAttendees) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`
                        inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold
                        ${getStatusColor(meeting.status)} 
                        shadow-sm border border-opacity-20
                      `}>
                        <div className={`
                          w-2 h-2 rounded-full mr-2
                          ${meeting.status === 'scheduled' ? 'bg-blue-500' : ''}
                          ${meeting.status === 'ongoing' ? 'bg-green-500 animate-pulse' : ''}
                          ${meeting.status === 'completed' ? 'bg-gray-500' : ''}
                          ${meeting.status === 'cancelled' ? 'bg-red-500' : ''}
                        `}></div>
                        {language === 'ar' 
                          ? statusOptions.find(s => s.value === meeting.status)?.label
                          : statusOptions.find(s => s.value === meeting.status)?.labelEn
                        }
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="group relative p-2 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-110"
                          title={language === 'ar' ? 'تحرير' : 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                          <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(meeting)}
                          className="group relative p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-110"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="h-4 w-4" />
                          <div className="absolute inset-0 rounded-lg bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Meeting Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMeeting
                  ? (language === 'ar' ? 'تحرير الاجتماع' : 'Edit Meeting')
                  : (language === 'ar' ? 'اجتماع جديد' : 'New Meeting')
                }
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingMeeting(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان (إنجليزي) *' : 'Title (English) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Date and Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'التاريخ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'وقت البداية *' : 'Start Time *'}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'وقت النهاية *' : 'End Time *'}
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المكان (عربي) *' : 'Location (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المكان (إنجليزي) *' : 'Location (English) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.locationEn}
                    onChange={(e) => handleInputChange('locationEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'نوع الاجتماع' : 'Meeting Type'}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {meetingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {language === 'ar' ? type.label : type.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {language === 'ar' ? status.label : status.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organizer Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المنظم (عربي) *' : 'Organizer (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => handleInputChange('organizer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المنظم (إنجليزي) *' : 'Organizer (English) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.organizerEn}
                    onChange={(e) => handleInputChange('organizerEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الحد الأقصى للحضور' : 'Maximum Attendees'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'اجتماع متكرر' : 'Recurring Meeting'}
                  </label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'نوع التكرار' : 'Recurrence Type'}
                    </label>
                    <select
                      value={formData.recurrenceType}
                      onChange={(e) => handleInputChange('recurrenceType', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
                      <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
                      <option value="yearly">{language === 'ar' ? 'سنوي' : 'Yearly'}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'صورة الاجتماع' : 'Meeting Image'}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"></path></svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{language === 'ar' ? 'انقر لرفع صورة' : 'Click to upload'}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleMeetingImageChange}
                    />
                  </label>
                </div>

                {(meetingImageFile || (editingMeeting && (editingMeeting as any).image)) && (
                  <div className="mt-2 flex items-center space-x-4">
                    {meetingImageFile ? (
                      <img src={URL.createObjectURL(meetingImageFile)} alt="preview" className="h-20 w-32 object-cover rounded" />
                    ) : editingMeeting && (editingMeeting as any).image ? (
                      <img src={(editingMeeting as any).image} alt="current" className="h-20 w-32 object-cover rounded" />
                    ) : null}
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {meetingImageFile ? meetingImageFile.name : editingMeeting && (editingMeeting as any).image ? (language === 'ar' ? 'الصورة الحالية' : 'Current image') : ''}
                    </div>
                  </div>
                )}

                {imageUploading && (
                  <div className="mt-2 text-sm text-gray-600">{language === 'ar' ? 'جاري رفع الصورة' : 'Uploading...'} {imageUploadProgress}%</div>
                )}
                {imageUploadError && (
                  <div className="mt-2 text-sm text-red-500">{imageUploadError}</div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingMeeting(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      {editingMeeting
                        ? (language === 'ar' ? 'تحديث الاجتماع' : 'Update Meeting')
                        : (language === 'ar' ? 'إضافة الاجتماع' : 'Add Meeting')
                      }
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMeetingToDelete(null);
        }}
        onConfirm={handleDelete}
        title={language === 'ar' ? 'حذف الاجتماع' : 'Delete Meeting'}
        message={
          language === 'ar'
            ? `هل أنت متأكد من حذف اجتماع "${meetingToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the meeting "${meetingToDelete?.titleEn}"? This action cannot be undone.`
        }
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
      />
    </div>
  );
};

export default MeetingsManagement;
