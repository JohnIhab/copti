import React, { useState, useEffect, useMemo } from 'react';
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
  type: string;
  description: string;
  organizer: string;
  createdAt: any;
  updatedAt: any;
  // optional fields that may exist in documents
  image?: string;
  isRecurring?: boolean;
  locationEn?: string;
  organizerEn?: string;
}

interface MeetingFormData {
  title: string;
  titleEn: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  type: string;
  description: string;
  organizer: string;
  image?: File | null;
  // optional/extended form fields
  locationEn?: string;
  descriptionEn?: string;
  organizerEn?: string;
  maxAttendees?: number;
  isRecurring?: boolean;
  recurrenceType?: string;
  status?: string;
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
    type: '',
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
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Filter meetings by title (arabic or english)
  const filteredMeetings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return meetings;
    return meetings.filter(m => {
      const title = (m.title || '').toString().toLowerCase();
      const titleEn = (m.titleEn || '').toString().toLowerCase();
      return title.includes(q) || titleEn.includes(q);
    });
  }, [meetings, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / perPage));

  // Ensure currentPage is valid when filteredMeetings or totalPages change
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredMeetings.slice(start, start + perPage);
  }, [filteredMeetings, currentPage]);
  
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
      type: '',
      description: '',
      organizer: '',
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

      if (!formData.location.trim()) {
      toast.error(
        language === 'ar' 
           ? 'يرجى إدخال مكان الاجتماع'
          : 'Please enter meeting location in both languages'
        );
      return false;
    }

      if (!formData.organizer.trim()) {
      toast.error(
        language === 'ar' 
            ? 'يرجى إدخال اسم المنظم'
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
        type: formData.type,
        description: formData.description.trim(),
        organizer: formData.organizer.trim(),
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
          // Clear selected file after successful upload
          setMeetingImageFile(null);
        } catch (imgErr: any) {
          console.error('Meeting image upload failed:', imgErr);
          setImageUploading(false);
          const msg = imgErr?.message || (language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
          setImageUploadError(msg);
          toast.error(msg);
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
      type: meeting.type,
      description: meeting.description,
      organizer: meeting.organizer,
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
    <div className="space-y-6 mt-10">
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="search"
              placeholder={language === 'ar' ? 'ابحث بالعنوان...' : 'Search by title...'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" /></svg>
            </div>
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
      </div>

 

      {/* Meetings Table */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {meetings.length === 0 ? (
          <div className="text-center py-16 px-4 sm:px-6">
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
            {/* Table: only visible on desktop/tablet */}
            <div className="hidden sm:block">
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
                    {/* Removed Attendees and Status columns */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {paginatedMeetings.map((meeting, index) => (
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
                      <td className="px-6 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {meeting.type}
                        </span>
                      </td>
                      <td className="px-6 text-center dark:text-white" >
                        <span>{new Date(meeting.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span><br />
                        <span>{formatTime(meeting.time)} - {formatTime(meeting.endTime)}</span>
                      </td>
                      <td className="px-6 text-center dark:text-white">
                        <span>{language === 'ar' ? meeting.location : meeting.locationEn}</span>
                      </td>
                      <td className="px-6 text-center dark:text-white">
                        <span>{language === 'ar' ? meeting.organizer : meeting.organizerEn}</span>
                      </td>
                      {/* Removed Attendees and Status cells */}
                      <td className="px-6 text-center">
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all duration-200 hover:shadow-lg mr-2"
                          title={language === 'ar' ? 'تحرير' : 'Edit'}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(meeting)}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 rounded-lg transition-all duration-200 hover:shadow-lg"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards: only visible on mobile */}
            <div className="block sm:hidden space-y-4 p-2">
              {paginatedMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {language === 'ar' ? meeting.title : meeting.titleEn}
                    </div>
                    {/* Removed Status from mobile card */}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {meeting.type}
                    </span>
                    {/* Removed recurring indicator from mobile card */}
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <span>{language === 'ar' ? 'التاريخ:' : 'Date:'} {new Date(meeting.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{language === 'ar' ? 'الوقت:' : 'Time:'} {formatTime(meeting.time)} - {formatTime(meeting.endTime)}</span>
                    <span>{language === 'ar' ? 'المكان:' : 'Location:'} {meeting.location}</span>
                    <span>{language === 'ar' ? 'المنظم:' : 'Organizer:'} {meeting.organizer}</span>
                  </div>
                  {/* Removed attendees progress bar from mobile card */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="flex-1 flex items-center justify-center p-2 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white dark:hover:bg-blue-500 rounded-lg transition-all duration-200 hover:shadow-lg"
                      title={language === 'ar' ? 'تحرير' : 'Edit'}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {language === 'ar' ? 'تحرير' : 'Edit'}
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(meeting)}
                      className="flex-1 flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 rounded-lg transition-all duration-200 hover:shadow-lg"
                      title={language === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls (under the table) */}
      {filteredMeetings.length > perPage && (
        <div className="mt-4 flex items-center justify-center gap-3 dark:text-white">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {language === 'ar' ? 'السابق' : 'Prev'}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {/* Add/Edit Meeting Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              {/* Location Field (Arabic only) */}
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

              {/* Meeting Type as input text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'نوع الاجتماع' : 'Meeting Type'}
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Organizer (Arabic only) */}
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

              {/* ...existing code... */}

              {/* Description (Arabic only) */}
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
