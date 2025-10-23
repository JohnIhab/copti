import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { tripsService, Trip } from '../services/tripsService';
import { tripPaymentsService } from '../services/tripPaymentsService';
import OrderButton from '../components/BookTripBtn';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

gsap.registerPlugin(ScrollTrigger);

const Trips: React.FC = () => {
  const { language } = useLanguage();
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 6;
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  // Simple numeric captcha (sum of two numbers)
  const [captchaA, setCaptchaA] = useState<number | null>(null);
  const [captchaB, setCaptchaB] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  // Honeypot anti-bot field for booking forms
  const [extra, setExtra] = useState<string | null>(null);

  // Load trips from Firestore
  useEffect(() => {
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

    loadTrips();
  }, []);
  const categories = [
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'adults', label: 'الكبار', labelEn: 'Adults' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' }
  ];

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(trips.length / tripsPerPage));
  // ensure currentPage is within bounds when trips change
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [trips.length, totalPages]);

  const paginatedTrips = trips.slice((currentPage - 1) * tripsPerPage, currentPage * tripsPerPage);

  const toggleTripSelection = (tripId: string | undefined) => {
    if (!tripId) return;
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const getTotalCost = () => {
    return selectedTrips.reduce((total, tripId) => {
      const trip = trips.find(t => t.id === tripId);
      return total + (trip?.cost || 0);
    }, 0);
  };

  const handleSubmitBooking = async () => {
    if (extra && extra.trim() !== '') {
      console.warn('Blocked booking submission due to honeypot field:', extra);
      toast.error(language === 'ar' ? 'تم حظر الطلب المشبوه' : 'Suspicious submission blocked');
      return;
    }
    // captcha must be valid before submitting
    if (!isCaptchaValid()) {
      setCaptchaError(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
      setPaymentError(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
      return;
    }
    if (!isValidEgyptianPhone(bookingPhone)) {
      const err = language === 'ar' ? 'الرجاء إدخال رقم هاتف صالح' : 'Please enter a valid phone number';
      setPhoneError(language === 'ar' ? 'رقم الهاتف غير صالح' : 'Invalid phone number');
      setPaymentError(err);
      return;
    }
    setIsPaying(true);
    setPaymentError('');
    try {
      await tripPaymentsService.addPayment({
        name: bookingName,
        phone: bookingPhone,
        tripIds: selectedTrips,
        total: getTotalCost()
      });
      setPaymentSuccess(true);
      setSelectedTrips([]);
      setBookingName('');
      setBookingPhone('');
      setTimeout(() => {
        setShowBookingModal(false);
        setPaymentSuccess(false);
        setShowPaymentStep(false);
      }, 1800);
    } catch (err) {
      setPaymentError(language === 'ar' ? 'حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.' : 'Failed to send data. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const isValidEgyptianPhone = (phone: string) => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    if (/^01[0125]\d{8}$/.test(digits)) return true;
    if (/^20?1[0125]\d{8}$/.test(digits)) return true;
    return false;
  };

  const isCaptchaValid = () => {
    if (captchaA === null || captchaB === null) return false;
    const expected = captchaA + captchaB;
    const val = parseInt(captchaInput || '', 10);
    return !Number.isNaN(val) && val === expected;
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.trip-card', { opacity: 0, y: 50, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.trip-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [paginatedTrips]);

  return (
    <>
      <Helmet>
        <title>دور وتميز كنيسة الأنبا رويس - الرحلات الروحية</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            الرحلات الروحية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            انضم إلينا في رحلاتنا الروحية والترفيهية المميزة لجميع الأعمار
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading trips...'}
            </span>
          </div>
        ) : (
          <>
            {/* (Filter removed) */}

        {/* Selected Trips Summary */}
        {selectedTrips.length > 0 && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              {language === 'ar' ? `الرحلات المختارة (${selectedTrips.length})` : `Selected Trips (${selectedTrips.length})`}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              {language === 'ar' ? 'إجمالي التكلفة:' : 'Total Cost:'} {getTotalCost()} {language === 'ar' ? 'جنيه' : 'EGP'}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                // generate simple captcha when opening modal
                setCaptchaA(Math.floor(Math.random() * 8) + 1);
                setCaptchaB(Math.floor(Math.random() * 8) + 1);
                setCaptchaInput('');
                setCaptchaError('');
                setShowBookingModal(true);
              }}
            >
              {language === 'ar' ? 'احجز الرحلات المختارة' : 'Book Selected Trips'}
            </button>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                onClick={() => !isPaying && setShowBookingModal(false)}
                disabled={isPaying}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">
                {language === 'ar' ? 'حجز الرحلات المختارة' : 'Book Selected Trips'}
              </h2>
              {/* Honeypot hidden input for booking form */}
              <input
                type="hidden"
                name="extra"
                value={extra ?? ''}
                onChange={(e) => setExtra(e.target.value)}
              />
              {paymentSuccess ? (
                <div className="text-green-600 dark:text-green-400 text-center text-lg font-semibold my-8">
                  {language === 'ar' ? 'تم إرسال بيانات الحجز بنجاح!' : 'Booking data sent successfully!'}
                </div>
              ) : showPaymentStep ? (
                <>
                  <div className="mb-4 text-center">
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-200 mb-2">
                      {language === 'ar' ? 'ادفع عبر فودافون كاش' : 'Pay via Vodafone Cash'}
                    </div>
                    <div className="text-md text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'ارسل المبلغ إلى رقم فودافون كاش التالي:' : 'Send the amount to this Vodafone Cash number:'}
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2 select-all">
                      01110797455
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {language === 'ar' ? 'ثم أرسل صورة إيصال التحويل على واتساب نفس الرقم.' : 'Then send the payment screenshot via WhatsApp to the same number.'}
                    </div>
                  </div>
                  {paymentError && (
                    <div className="mb-2 text-red-600 dark:text-red-400 text-center">{paymentError}</div>
                  )}
                  <button
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${isPaying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={handleSubmitBooking}
                    disabled={isPaying || !!phoneError || !isCaptchaValid()}
                  >
                    {isPaying
                      ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')}
                  </button>
                  <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'بعد الدفع وإرسال الصورة على واتساب سيتم تأكيد الحجز.' : 'After payment and sending the screenshot on WhatsApp, your booking will be confirmed.'}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700 dark:text-white">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingName}
                      onChange={e => setBookingName(e.target.value)}
                      disabled={isPaying}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:text-white dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookingPhone}
                      onChange={e => {
                        const v = e.target.value;
                        setBookingPhone(v);
                        if (v && !isValidEgyptianPhone(v)) {
                          setPhoneError(language === 'ar' ? 'رقم الهاتف غير صالح' : 'Invalid phone number');
                        } else {
                          setPhoneError('');
                        }
                        setPaymentError('');
                      }}
                      disabled={isPaying}
                    />
                    {phoneError && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneError}</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                      {language === 'ar' ? 'إجمالي السعر' : 'Total Price'}
                    </label>
                    <div className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-lg font-bold text-green-700 dark:text-green-300">
                      {getTotalCost()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </div>
                  </div>
                  {paymentError && (
                    <div className="mb-2 text-red-600 dark:text-red-400 text-center">{paymentError}</div>
                  )}
                  {/* Simple numeric captcha */}
                  <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                      {language === 'ar' ? 'اختبار التحقق: كم نتيجة' : 'Verification test: What is'}
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white font-bold">{captchaA ?? '?'} + {captchaB ?? '?'}</div>
                      <input
                        type="number"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:text-white dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none"
                        value={captchaInput}
                        onChange={e => {
                          setCaptchaInput(e.target.value);
                          setCaptchaError('');
                          setPaymentError('');
                        }}
                        disabled={isPaying}
                      />
                    </div>
                    {captchaError && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{captchaError}</div>}
                  </div>
                  <button
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${isPaying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => {
                      // check captcha before showing payment step
                      if (!isCaptchaValid()) {
                        setCaptchaError(language === 'ar' ? 'الرجاء حل اختبار التحقق بشكل صحيح' : 'Please solve the verification correctly');
                        return;
                      }
                      setShowPaymentStep(true);
                    }}
                    disabled={isPaying || !bookingName || !bookingPhone || !!phoneError}
                  >
                    {language === 'ar' ? 'ادفع واحجز' : 'Pay & Book'}
                  </button>
                  <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'سيظهر لك رقم فودافون كاش بعد الضغط على الزر.' : 'Vodafone Cash number will appear after clicking the button.'}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.length > 0 ? paginatedTrips.map((trip: Trip) => (
            <div
              key={trip.id}
              className={`trip-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                       shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                       border-2 ${selectedTrips.includes(trip.id || '') 
                         ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                         : 'border-gray-100 dark:border-gray-700'} group cursor-pointer`}
              onClick={() => toggleTripSelection(trip.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={trip.image} 
                  alt={language === 'ar' ? trip.title : trip.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {trip.cost} جنيه
                </div>
                
                {selectedTrips.includes(trip.id || '') && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'ar' ? trip.title : trip.titleEn}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {language === 'ar' ? trip.description : trip.descriptionEn}
                </p>
                
                <div className="space-y-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span>{language === 'ar' ? trip.destination : trip.destinationEn}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{new Date(trip.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{language === 'ar' ? trip.duration : trip.durationEn} يوم</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{trip.capacity}</span>
                  </div>
                </div>

                {/* Includes */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(language === 'ar' ? trip.includes || [] : trip.includesEn || []).map((item: string, index: number) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                                  px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {trip.cost} جنيه
                  </span>

                </div>
                <div className="flex items-center justify-center mt-4">
                  <OrderButton />
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {language === 'ar' ? 'لا توجد رحلات متاحة' : 'No trips available'}
              </p>
            </div>
          )}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 ml-2 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              disabled={currentPage === 1}
            >
              {language === 'ar' ? 'السابق' : 'Prev'}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 rounded-lg border ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              disabled={currentPage === totalPages}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
    </>
  );
};

export default Trips;