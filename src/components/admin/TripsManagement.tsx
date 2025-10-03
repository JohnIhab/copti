import React, { useState } from 'react';
import { Plus, MapPin, Calendar, Clock, Users, Eye, Edit, Trash2, X, Upload, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Trip {
  id: number;
  title: string;
  titleEn: string;
  destination: string;
  destinationEn: string;
  date: string;
  duration: string;
  durationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  cost: number;
}

const TripsManagement: React.FC = () => {
  const { language } = useLanguage();
  
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 1,
      title: 'رحلة دير الأنبا بيشوي',
      titleEn: 'St. Bishoy Monastery Trip',
      destination: 'وادي النطرون',
      destinationEn: 'Wadi El Natrun',
      date: '2025-02-20',
      duration: 'يوم واحد',
      durationEn: 'One Day',
      category: 'adults',
      categoryEn: 'Adults',
      description: 'رحلة روحية لدير الأنبا بيشوي العامر بوادي النطرون',
      descriptionEn: 'Spiritual trip to St. Bishoy Monastery in Wadi El Natrun',
      image: '/Images/trips/monastery-trip.jpg',
      capacity: 50,
      registered: 35,
      cost: 300
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    destination: '',
    destinationEn: '',
    date: '',
    duration: '',
    durationEn: '',
    category: 'adults',
    categoryEn: 'Adults',
    description: '',
    descriptionEn: '',
    image: '',
    capacity: 0,
    cost: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrip: Trip = {
      id: trips.length + 1,
      ...formData,
      capacity: Number(formData.capacity),
      cost: Number(formData.cost),
      registered: 0
    };
    
    setTrips(prev => [...prev, newTrip]);
    setShowAddForm(false);
    setFormData({
      title: '',
      titleEn: '',
      destination: '',
      destinationEn: '',
      date: '',
      duration: '',
      durationEn: '',
      category: 'adults',
      categoryEn: 'Adults',
      description: '',
      descriptionEn: '',
      image: '',
      capacity: 0,
      cost: 0
    });
  };

  const categoryOptions = [
    { value: 'adults', labelAr: 'البالغين', labelEn: 'Adults' },
    { value: 'youth', labelAr: 'الشباب', labelEn: 'Youth' },
    { value: 'children', labelAr: 'الأطفال', labelEn: 'Children' },
    { value: 'families', labelAr: 'العائلات', labelEn: 'Families' },
    { value: 'seniors', labelAr: 'كبار السن', labelEn: 'Seniors' }
  ];

  return (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة الرحلات' : 'Trips Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'تنظيم وإدارة الرحلات الروحية والترفيهية' : 'Organize and manage spiritual and recreational trips'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button 
              onClick={() => setShowAddForm(true)}
              className="floating-btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة رحلة جديدة' : 'Add New Trip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Trip Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'إضافة رحلة جديدة' : 'Add New Trip'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Arabic Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان بالعربية' : 'Title in Arabic'}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل عنوان الرحلة بالعربية' : 'Enter trip title in Arabic'}
                  />
                </div>

                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان بالإنجليزية' : 'Title in English'}
                  </label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل عنوان الرحلة بالإنجليزية' : 'Enter trip title in English'}
                  />
                </div>

                {/* Arabic Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوجهة بالعربية' : 'Destination in Arabic'}
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وجهة الرحلة بالعربية' : 'Enter destination in Arabic'}
                  />
                </div>

                {/* English Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الوجهة بالإنجليزية' : 'Destination in English'}
                  </label>
                  <input
                    type="text"
                    name="destinationEn"
                    value={formData.destinationEn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل وجهة الرحلة بالإنجليزية' : 'Enter destination in English'}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'تاريخ الرحلة' : 'Trip Date'}
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

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة المستهدفة' : 'Target Category'}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {language === 'ar' ? option.labelAr : option.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'مدة الرحلة بالعربية' : 'Duration in Arabic'}
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'مثال: يوم واحد، يومان' : 'Example: يوم واحد، يومان'}
                  />
                </div>

                {/* Duration English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'مدة الرحلة بالإنجليزية' : 'Duration in English'}
                  </label>
                  <input
                    type="text"
                    name="durationEn"
                    value={formData.durationEn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'Example: One Day, Two Days' : 'Example: One Day, Two Days'}
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'السعة القصوى' : 'Maximum Capacity'}
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'عدد المشاركين المسموح' : 'Number of allowed participants'}
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'التكلفة (جنيه مصري)' : 'Cost (EGP)'}
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'ar' ? 'تكلفة الرحلة' : 'Trip cost'}
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                  </label>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={language === 'ar' ? 'أدخل رابط صورة الرحلة' : 'Enter trip image URL'}
                    />
                    <button
                      type="button"
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{language === 'ar' ? 'رفع' : 'Upload'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'وصف الرحلة بالعربية' : 'Description in Arabic'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={language === 'ar' ? 'اكتب وصفاً تفصيلياً للرحلة بالعربية' : 'Write a detailed description in Arabic'}
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'وصف الرحلة بالإنجليزية' : 'Description in English'}
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={language === 'ar' ? 'Write a detailed description in English' : 'Write a detailed description in English'}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{language === 'ar' ? 'حفظ الرحلة' : 'Save Trip'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="admin-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img 
                src={trip.image} 
                alt={language === 'ar' ? trip.title : trip.titleEn}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/Images/hero.jpg';
                }}
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {trip.cost} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? trip.title : trip.titleEn}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {language === 'ar' ? trip.description : trip.descriptionEn}
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? trip.destination : trip.destinationEn}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{trip.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? trip.duration : trip.durationEn}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{trip.registered}/{trip.capacity} {language === 'ar' ? 'مشارك' : 'participants'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                  {language === 'ar' ? trip.category : trip.categoryEn}
                </span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripsManagement;