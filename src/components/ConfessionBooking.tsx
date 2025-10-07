import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import confessionService, { TimeSlot } from '../services/confessionService';

const ConfessionBooking: React.FC = () => {
  const { language } = useLanguage();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    userEmail: '',
    notes: ''
  });

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  useEffect(() => {
    if (availableSlots.length > 0) {
      gsap.fromTo('.slot-card',
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        }
      );
    }
  }, [availableSlots]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log('Starting to load available slots...');
      
      // Try to get slots from Firebase
      let slots = await confessionService.getAvailableTimeSlots();
      console.log('Loaded slots from service:', slots);
      
      // Filter out past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      console.log('Today\'s date for filtering:', today.toISOString().split('T')[0]);
      console.log('All slots before date filtering:', slots.map(s => ({ date: s.date, time: s.time, priest: s.priest })));
      
      const futureSlots = slots.filter(slot => {
        const slotDate = new Date(slot.date);
        const isInFuture = slotDate >= today;
        console.log(`Slot ${slot.date} is in future:`, isInFuture);
        return isInFuture;
      });
      
      console.log('Future slots after filtering:', futureSlots.length);
      console.log('Future slots details:', futureSlots.map(s => ({ date: s.date, time: s.time, priest: s.priest })));
      setAvailableSlots(futureSlots);
      
      if (futureSlots.length > 0) {
        toast.success(
          language === 'ar' 
            ? `تم تحميل ${futureSlots.length} موعد متاح`
            : `Loaded ${futureSlots.length} available appointments`
        );
      } else {
        console.log('No future slots available. Current date:', today.toISOString().split('T')[0]);
        console.log('Slots from Firebase:', slots.length);
        
        if (slots.length > 0) {
          toast.info(
            language === 'ar'
              ? `تم العثور على ${slots.length} مواعيد ولكنها في الماضي. يرجى إضافة مواعيد جديدة.`
              : `Found ${slots.length} appointments but they are in the past. Please add new appointments.`
          );
        }
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      
      // Fallback to hardcoded slots if Firebase fails
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      
      const fallbackSlots = [
        {
          id: 'fallback-1',
          date: tomorrow.toISOString().split('T')[0],
          time: '10:00 AM',
          priest: 'أبونا يوسف',
          priestEn: 'Father Youssef',
          available: true,
          maxAppointments: 1,
          currentAppointments: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        },
        {
          id: 'fallback-2',
          date: dayAfter.toISOString().split('T')[0],
          time: '2:00 PM',
          priest: 'أبونا مرقس',
          priestEn: 'Father Marcus',
          available: true,
          maxAppointments: 1,
          currentAppointments: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];
      
      setAvailableSlots(fallbackSlots);
      
      toast.error(
        language === 'ar' 
          ? `خطأ في التحميل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}. تم تحميل مواعيد تجريبية.`
          : `Loading error: ${error instanceof Error ? error.message : 'Unknown error'}. Loaded sample appointments.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !formData.userName || !formData.userPhone) {
      toast.error(
        language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة'
          : 'Please fill in all required fields'
      );
      return;
    }

    try {
      setBooking(true);

      // Check if user can book (no existing appointment on this date)
      const canBook = await confessionService.canUserBook(formData.userPhone, selectedSlot.date);
      if (!canBook) {
        toast.error(
          language === 'ar'
            ? 'لديك موعد بالفعل في هذا التاريخ'
            : 'You already have an appointment on this date'
        );
        return;
      }

      await confessionService.bookAppointment({
        userName: formData.userName,
        userPhone: formData.userPhone,
        userEmail: formData.userEmail,
        date: selectedSlot.date,
        time: selectedSlot.time,
        priest: selectedSlot.priest,
        priestEn: selectedSlot.priestEn,
        notes: formData.notes,
        status: 'pending'
      });

      toast.success(
        language === 'ar'
          ? 'تم حجز الموعد بنجاح! سيتم التأكيد قريباً.'
          : 'Appointment booked successfully! Confirmation will be sent soon.'
      );

      setShowBookingForm(false);
      setSelectedSlot(null);
      setFormData({
        userName: '',
        userPhone: '',
        userEmail: '',
        notes: ''
      });

      // Reload available slots
      loadAvailableSlots();
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error(
        error.message || 
        (language === 'ar'
          ? 'حدث خطأ أثناء حجز الموعد'
          : 'Error booking appointment')
      );
    } finally {
      setBooking(false);
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups: { [key: string]: TimeSlot[] }, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(availableSlots);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'حجز موعد اعتراف' : 'Book Confession Appointment'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'اختر الوقت والكاهن المناسب لك لحجز موعد الاعتراف'
              : 'Choose the time and priest that works best for you to book your confession appointment'
            }
          </p>
        </div>

        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No Available Appointments'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {language === 'ar'
                ? 'لا توجد مواعيد متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل مع الإدارة.'
                : 'No appointments are currently available. Please try again later or contact the administration.'
              }
            </p>
            <div className="flex justify-center">
              <button
                onClick={loadAvailableSlots}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'ar' ? 'إعادة تحميل' : 'Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 rtl:ml-3 rtl:mr-0 text-blue-600" />
                  {formatDate(date)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="slot-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(slot.time)}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          {language === 'ar' ? 'متاح' : 'Available'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">
                          {language === 'ar' ? slot.priest : slot.priestEn}
                        </p>
                        <p className="mt-1">
                          {language === 'ar' 
                            ? `${slot.maxAppointments - slot.currentAppointments} مقعد متاح`
                            : `${slot.maxAppointments - slot.currentAppointments} spot${slot.maxAppointments - slot.currentAppointments !== 1 ? 's' : ''} available`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingForm && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSlot(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Selected Slot Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {language === 'ar' ? 'تفاصيل الموعد' : 'Appointment Details'}
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedSlot.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(selectedSlot.time)}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <User className="w-4 h-4" />
                      <span>{language === 'ar' ? selectedSlot.priest : selectedSlot.priestEn}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.userName}
                        onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={formData.userPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, userPhone: e.target.value }))}
                        placeholder={language === 'ar' ? '+20123456789' : '+20123456789'}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={formData.userEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
                        placeholder={language === 'ar' ? 'your@email.com' : 'your@email.com'}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 rtl:right-3 rtl:left-auto top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={language === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                        rows={3}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedSlot(null);
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={booking}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      {booking && <Loader className="w-4 h-4 animate-spin" />}
                      <span>
                        {booking 
                          ? (language === 'ar' ? 'جاري الحجز...' : 'Booking...')
                          : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')
                        }
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfessionBooking;