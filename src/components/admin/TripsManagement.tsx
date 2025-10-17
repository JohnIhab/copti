import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X, Loader, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { tripsService, Trip } from '../../services/tripsService';

const TripsManagement: React.FC = () => {
  useLanguage();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
  title: '',
  titleEn: '',
  destination: '',
  date: '',
  duration: '',
  category: 'adults',
  categoryEn: 'Adults',
  description: '',
  image: '',
  capacity: 0,
  cost: 0
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState('');

  const uploadImage = async (file: File) => {
    try {
      setImageUploading(true);
      setImageUploadError('');
      setImageUploadProgress(0);

      const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME as string;
      const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
      const resourceType = 'image';
      if (!cloudName || !preset) {
        const missing = !cloudName ? 'VITE_CLOUDINARY_CLOUD_NAME' : 'VITE_CLOUDINARY_UPLOAD_PRESET';
        const msg = `المتغير ${missing} غير مضبوط. الرجاء ضبط إعدادات Cloudinary في ملف البيئة.`;
        setImageUploading(false);
        setImageUploadError(msg);
        toast.error(msg);
        return null;
      }

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent: any) => {
          const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setImageUploadProgress(percent);
        }
      });

      setImageUploadProgress(100);
      setImageUploading(false);
      return res.data.secure_url as string;
    } catch (error: any) {
      setImageUploading(false);
      setImageUploadProgress(0);
      let msg = 'فشل رفع الصورة';
      // Try to extract Cloudinary error details
      if (error?.response?.data) {
        console.error('Cloudinary response data:', error.response.data);
        msg = error.response.data?.error?.message || JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }
      setImageUploadError(msg);
      console.error('image upload error:', error);
      toast.error(`فشل رفع الصورة: ${msg}`);
      return null;
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await tripsService.getTrips();
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const tripData = {
        ...formData,
        capacity: Number(formData.capacity),
        cost: Number(formData.cost)
      };
      
      if (editingTrip && editingTrip.id) {
        await tripsService.updateTrip(editingTrip.id, tripData);
      } else {
        await tripsService.addTrip(tripData);
      }
      
      await loadTrips();
      setShowAddForm(false);
      setEditingTrip(null);
      resetForm();
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      destination: '',
      date: '',
      duration: '',
      category: 'adults',
      categoryEn: 'Adults',
      description: '',
      image: '',
      capacity: 0,
      cost: 0
    });
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      titleEn: trip.titleEn,
      destination: trip.destination,
      date: trip.date,
      duration: trip.duration,
      category: trip.category,
      categoryEn: trip.categoryEn,
      description: trip.description,
      image: trip.image,
      capacity: trip.capacity,
      cost: trip.cost
    });
    setShowAddForm(true);
  };

  const handleDelete = async (tripId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
      try {
        await tripsService.deleteTrip(tripId);
        await loadTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 tab-content mt-10" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الرحلات</h2>
        <button 
          onClick={() => {
            setEditingTrip(null);
            resetForm();
            setShowAddForm(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة رحلة جديدة</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الرحلة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">مدة الرحلة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الوجهة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">السعة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">التكلفة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{trip.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{trip.duration} يوم</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{trip.destination}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{new Date(trip.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{trip.capacity}</td>
                  <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-medium">{trip.cost} ج.م</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleEdit(trip)} 
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => trip.id && handleDelete(trip.id)} 
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="block sm:hidden p-2 space-y-4">
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">لا توجد رحلات مسجلة</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
                <div className="font-bold text-base text-gray-900 dark:text-white">{trip.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{trip.duration}</div>
                <div className="text-sm text-gray-900 dark:text-white">{trip.destination}</div>
                <div className="text-sm text-gray-900 dark:text-white">{new Date(trip.date).toLocaleDateString('ar-EG')}</div>
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                  <span>السعة:</span>
                  <span className="font-bold">{trip.registered}/{trip.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>التكلفة:</span>
                  <span>{trip.cost} ج.م</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(trip)} className="flex-1 flex items-center justify-center p-2 text-green-600 hover:text-white hover:bg-green-600 dark:text-green-400 dark:hover:text-white dark:hover:bg-green-500 rounded-lg transition-all duration-200 hover:shadow-lg" title="تعديل"><Edit className="h-4 w-4 mr-1" />تعديل</button>
                  <button onClick={() => trip.id && handleDelete(trip.id)} className="flex-1 flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 rounded-lg transition-all duration-200 hover:shadow-lg" title="حذف"><Trash2 className="h-4 w-4 mr-1" />حذف</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" dir="rtl"  style={{ transform: 'translateX(-5rem)' }}>
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{editingTrip ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}</h3>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTrip(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان بالعربية
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="أدخل عنوان الرحلة بالعربية"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العنوان بالإنجليزية
                  </label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    placeholder="Enter trip title in English"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوجهة بالعربية
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="أدخل وجهة الرحلة بالعربية"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* الوجهة بالإنجليزية removed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ الرحلة
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الفئة المستهدفة
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="adults">البالغين</option>
                    <option value="youth">الشباب</option>
                    <option value="children">الأطفال</option>
                    <option value="families">العائلات</option>
                    <option value="seniors">كبار السن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    مدة الرحلة بالعربية
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="مثال: يوم واحد، يومان"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                {/* مدة الرحلة بالإنجليزية removed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعة القصوى
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="عدد المشاركين المسموح"
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    التكلفة (جنيه مصري)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="تكلفة الرحلة"
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="أدخل رابط صورة الرحلة"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="mt-2 flex items-center space-x-3 space-x-reverse">
                  <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                    رفع صورة
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            setFormData(prev => ({ ...prev, image: url }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {imageUploading && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">جاري الرفع {imageUploadProgress}%</div>
                  )}
                  {imageUploadError && (
                    <div className="text-sm text-red-500">{imageUploadError}</div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الرحلة بالعربية
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="اكتب وصفاً تفصيلياً للرحلة بالعربية"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* وصف الرحلة بالإنجليزية removed */}
              
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTrip(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center space-x-2 space-x-reverse shadow-lg transition-colors"
                >
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>
                    {submitting 
                      ? 'جاري الحفظ...' 
                      : (editingTrip 
                          ? 'تحديث الرحلة'
                          : 'حفظ الرحلة'
                        )
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsManagement;
