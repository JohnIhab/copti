import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Star, Eye, Edit, Trash2, X, Save, Upload, Table, Grid, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import {
  Event,
  EventFormData,
  subscribeToEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  eventCategories
} from '../../services/eventsService';

const EventsManagement: React.FC = () => {
  const { language } = useLanguage();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal and form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    titleEn: '',
    date: '',
    time: '',
    location: '',
    locationEn: '',
    category: 'general',
    description: '',
    descriptionEn: '',
    capacity: 50,
    featured: false,
    image: null
  });

  // Load events on component mount
  useEffect(() => {
    const unsubscribe = subscribeToEvents((eventsData) => {
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(
          language === 'ar' 
            ? 'يرجى اختيار ملف صورة صالح'
            : 'Please select a valid image file'
        );
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          language === 'ar' 
            ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
            : 'Image size must be less than 5MB'
        );
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      date: '',
      time: '',
      location: '',
      locationEn: '',
      category: 'general',
      description: '',
      descriptionEn: '',
      capacity: 50,
      featured: false,
      image: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.titleEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال عنوان الفعالية باللغتين العربية والإنجليزية'
          : 'Please enter event title in both Arabic and English'
      );
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error(
        language === 'ar' 
          ? 'يرجى تحديد تاريخ ووقت الفعالية'
          : 'Please specify event date and time'
      );
      return;
    }

    if (!formData.location.trim() || !formData.locationEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال موقع الفعالية باللغتين'
          : 'Please enter event location in both languages'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await addEvent(formData);
      
      // Show success message
      toast.success(
        language === 'ar' 
          ? 'تم إضافة الفعالية بنجاح'
          : 'Event added successfully'
      );

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);

    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء إضافة الفعالية'
          : 'Error occurred while adding event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      titleEn: event.titleEn,
      date: event.date,
      time: event.time,
      location: event.location,
      locationEn: event.locationEn,
      category: event.category,
      description: event.description,
      descriptionEn: event.descriptionEn,
      capacity: event.capacity,
      featured: event.featured,
      image: null
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;

    // Same validation as add
    if (!formData.title.trim() || !formData.titleEn.trim()) {
      toast.error(
        language === 'ar' 
          ? 'يرجى إدخال عنوان الفعالية باللغتين العربية والإنجليزية'
          : 'Please enter event title in both Arabic and English'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEvent(editingEvent.id!, formData, formData.image || undefined);
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديث الفعالية بنجاح'
          : 'Event updated successfully'
      );

      resetForm();
      setShowEditModal(false);
      setEditingEvent(null);

    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تحديث الفعالية'
          : 'Error occurred while updating event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm(
      language === 'ar' 
        ? `هل أنت متأكد من حذف الفعالية "${event.title}"؟`
        : `Are you sure you want to delete the event "${event.titleEn}"?`
    )) {
      try {
        await deleteEvent(event.id!);
        toast.success(
          language === 'ar' 
            ? 'تم حذف الفعالية بنجاح'
            : 'Event deleted successfully'
        );
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(
          language === 'ar' 
            ? 'حدث خطأ أثناء حذف الفعالية'
            : 'Error occurred while deleting event'
        );
      }
    }
  };

  return (
    <div className="space-y-8 tab-content mt-10">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة الفعاليات' : 'Events Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة وتنظيم جميع فعاليات الكنيسة' : 'Manage and organize all church events'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={language === 'ar' ? 'عرض البطاقات' : 'Grid View'}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={language === 'ar' ? 'عرض الجدول' : 'Table View'}
              >
                <Table className="h-4 w-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="floating-btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Events Grid/Table */}
      {!loading && (
        <>
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'الفعالية' : 'Event'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'الموقع' : 'Location'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'الفئة' : 'Category'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'المشاركين' : 'Participants'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {language === 'ar' ? 'لا توجد فعاليات' : 'No Events Found'}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'ابدأ بإضافة فعالية جديدة' : 'Start by adding a new event'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={event.image} 
                                alt={language === 'ar' ? event.title : event.titleEn}
                                className="h-12 w-12 rounded-lg object-cover mr-3 rtl:ml-3 rtl:mr-0"
                                onError={(e) => {
                                  e.currentTarget.src = '/Images/hero.jpg';
                                }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                  {language === 'ar' ? event.title : event.titleEn}
                                  {event.featured && (
                                    <Star className="h-4 w-4 text-yellow-500 ml-2 rtl:mr-2 rtl:ml-0" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {(language === 'ar' ? event.description : event.descriptionEn).substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0 text-gray-400" />
                                {event.date}
                              </div>
                              <div className="flex items-center mt-1">
                                <Clock className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0 text-gray-400" />
                                {event.time}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0 text-gray-400" />
                              {language === 'ar' ? event.location : event.locationEn}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                              {language === 'ar' ? event.category : event.categoryEn}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0 text-gray-400" />
                              <span>{event.registered}/{event.capacity}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.registered >= event.capacity
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : event.registered / event.capacity > 0.8
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {event.registered >= event.capacity
                                ? (language === 'ar' ? 'مكتمل' : 'Full')
                                : event.registered / event.capacity > 0.8
                                ? (language === 'ar' ? 'شبه مكتمل' : 'Almost Full')
                                : (language === 'ar' ? 'متاح' : 'Available')
                              }
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <button 
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title={language === 'ar' ? 'عرض' : 'View'}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(event)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title={language === 'ar' ? 'تعديل' : 'Edit'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(event)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={language === 'ar' ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'لا توجد فعاليات' : 'No Events Found'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'ابدأ بإضافة فعالية جديدة' : 'Start by adding a new event'}
                  </p>
                </div>
              ) : (
                events.map((event) => (
          <div key={event.id} className="admin-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img 
                src={event.image} 
                alt={language === 'ar' ? event.title : event.titleEn}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/Images/hero.jpg';
                }}
              />
              {event.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? event.title : event.titleEn}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {language === 'ar' ? event.description : event.descriptionEn}
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{event.date} - {event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? event.location : event.locationEn}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{event.registered}/{event.capacity} {language === 'ar' ? 'مشارك' : 'participants'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {language === 'ar' ? event.category : event.categoryEn}
                </span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(event)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title={language === 'ar' ? 'تعديل' : 'Edit'}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        ))
      )}
        </>
  )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
                    required
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل العنوان بالإنجليزية' : 'Enter title in English'}
                    required
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'التاريخ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوقت *' : 'Time *'}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'السعة' : 'Capacity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الموقع (عربي) *' : 'Location (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل الموقع بالعربية' : 'Enter location in Arabic'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الموقع (إنجليزي) *' : 'Location (English) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.locationEn}
                    onChange={(e) => handleInputChange('locationEn', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل الموقع بالإنجليزية' : 'Enter location in English'}
                    required
                  />
                </div>
              </div>

              {/* Category and Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {eventCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {language === 'ar' ? category.label : category.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="mr-2 rtl:ml-2 rtl:mr-0 block text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'فعالية مميزة' : 'Featured Event'}
                  </label>
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وصف الفعالية بالعربية' : 'Enter event description in Arabic'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وصف الفعالية بالإنجليزية' : 'Enter event description in English'}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'صورة الفعالية' : 'Event Image'}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          {language === 'ar' ? 'انقر لرفع صورة' : 'Click to upload'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG {language === 'ar' ? 'أو' : 'or'} GIF ({language === 'ar' ? 'الحد الأقصى' : 'MAX'} 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {formData.image && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {language === 'ar' ? 'تم اختيار الصورة:' : 'Selected image:'} {formData.image.name}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{language === 'ar' ? 'حفظ الفعالية' : 'Save Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'تعديل الفعالية' : 'Edit Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
                    required
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل العنوان بالإنجليزية' : 'Enter title in English'}
                    required
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'التاريخ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوقت *' : 'Time *'}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'السعة' : 'Capacity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الموقع (عربي) *' : 'Location (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل الموقع بالعربية' : 'Enter location in Arabic'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الموقع (إنجليزي) *' : 'Location (English) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.locationEn}
                    onChange={(e) => handleInputChange('locationEn', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل الموقع بالإنجليزية' : 'Enter location in English'}
                    required
                  />
                </div>
              </div>

              {/* Category and Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {eventCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {language === 'ar' ? category.label : category.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featuredEdit"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featuredEdit" className="mr-2 rtl:ml-2 rtl:mr-0 block text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'فعالية مميزة' : 'Featured Event'}
                  </label>
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وصف الفعالية بالعربية' : 'Enter event description in Arabic'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وصف الفعالية بالإنجليزية' : 'Enter event description in English'}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'تحديث صورة الفعالية' : 'Update Event Image'}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          {language === 'ar' ? 'انقر لرفع صورة جديدة' : 'Click to upload new image'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG {language === 'ar' ? 'أو' : 'or'} GIF ({language === 'ar' ? 'الحد الأقصى' : 'MAX'} 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {formData.image && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {language === 'ar' ? 'تم اختيار الصورة:' : 'Selected image:'} {formData.image.name}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{language === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{language === 'ar' ? 'تحديث الفعالية' : 'Update Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default EventsManagement;