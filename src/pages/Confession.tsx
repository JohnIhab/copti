import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface TimeSlot {
  id: number;
  date: string;
  time: string;
  priest: string;
  priestEn: string;
  available: boolean;
}

const Confession: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const timeSlots: TimeSlot[] = [
    {
      id: 1,
      date: '2025-01-25',
      time: '10:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      available: true
    },
    {
      id: 2,
      date: '2025-01-25',
      time: '11:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      available: true
    },
    {
      id: 3,
      date: '2025-01-25',
      time: '2:00 PM',
      priest: 'أبونا مرقس',
      priestEn: 'Father Marcus',
      available: false
    },
    {
      id: 4,
      date: '2025-01-26',
      time: '10:00 AM',
      priest: 'أبونا مرقس',
      priestEn: 'Father Marcus',
      available: true
    },
    {
      id: 5,
      date: '2025-01-26',
      time: '11:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      available: true
    },
    {
      id: 6,
      date: '2025-01-26',
      time: '3:00 PM',
      priest: 'أبونا مرقس',
      priestEn: 'Father Marcus',
      available: true
    }
  ];

  const handleBooking = () => {
    if (!selectedSlot || !userName || !userPhone) {
      alert('يرجى ملء جميع البيانات المطلوبة واختيار موعد');
      return;
    }
    setShowConfirmation(true);
  };

  const getSelectedSlotInfo = () => {
    return timeSlots.find(slot => slot.id === selectedSlot);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.time-slot', { opacity: 0, y: 30, scale: 0.95 });
    gsap.set('.form-section', { opacity: 0, x: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.time-slot', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
    })
    .to('.form-section', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.3');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            حجز موعد الاعتراف
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            احجز موعدك للاعتراف مع أحد الآباء الكهنة في الأوقات المتاحة
          </p>
        </div>

        {!showConfirmation ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Available Time Slots */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                المواعيد المتاحة
              </h2>
              
              <div className="space-y-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => slot.available && setSelectedSlot(slot.id)}
                    className={`time-slot p-4 rounded-2xl transition-all duration-300 transform ${
                      slot.available
                        ? `cursor-pointer hover:scale-105 ${
                            selectedSlot === slot.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-lg'
                              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                          }`
                        : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className={`p-3 rounded-full ${
                          slot.available 
                            ? selectedSlot === slot.id 
                              ? 'bg-blue-500' 
                              : 'bg-gray-200 dark:bg-gray-600'
                            : 'bg-gray-300 dark:bg-gray-500'
                        }`}>
                          <Clock className={`h-5 w-5 ${
                            slot.available 
                              ? selectedSlot === slot.id 
                                ? 'text-white' 
                                : 'text-gray-600 dark:text-gray-300'
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {new Date(slot.date).toLocaleDateString('ar-EG', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {slot.time}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <User className="h-4 w-4 mr-1" />
                            <span>{language === 'ar' ? slot.priest : slot.priestEn}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {slot.available ? (
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedSlot === slot.id
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedSlot === slot.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-500 text-sm font-medium">محجوز</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-green-600" />
                بيانات الحجز
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الكريم *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="أدخل اسمك الكريم"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="أي ملاحظات خاصة أو طلبات..."
                  />
                </div>

                {selectedSlot && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">الموعد المختار:</h4>
                    <div className="text-blue-700 dark:text-blue-300 text-sm">
                      <p>{new Date(getSelectedSlotInfo()?.date || '').toLocaleDateString('ar-EG', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p>الوقت: {getSelectedSlotInfo()?.time}</p>
                      <p>مع: {language === 'ar' ? getSelectedSlotInfo()?.priest : getSelectedSlotInfo()?.priestEn}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!selectedSlot || !userName || !userPhone}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                           text-white py-4 rounded-lg font-semibold transition-all duration-300 
                           transform hover:scale-105 shadow-lg hover:shadow-xl
                           flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Calendar className="h-5 w-5" />
                  <span>احجز الموعد</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                تم حجز الموعد بنجاح
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                شكراً لك، تم حجز موعدك للاعتراف. سيتم التواصل معك قريباً لتأكيد الموعد.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-right">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">تفاصيل الحجز:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الاسم:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">التاريخ:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(getSelectedSlotInfo()?.date || '').toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الوقت:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getSelectedSlotInfo()?.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الكاهن:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {language === 'ar' ? getSelectedSlotInfo()?.priest : getSelectedSlotInfo()?.priestEn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">الهاتف:</span>
                    <span className="font-medium text-gray-900 dark:text-white" dir="ltr">{userPhone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>مهم:</strong> يرجى الحضور قبل الموعد بـ 10 دقائق. في حالة عدم القدرة على الحضور، يرجى الاتصال على: 01234567890
                </p>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedSlot(null);
                    setUserName('');
                    setUserPhone('');
                    setNotes('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg
                           font-semibold transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  حجز موعد آخر
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg
                                 font-semibold transition-all duration-300 transform hover:scale-105">
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Confession;