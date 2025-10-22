import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, CreditCard, Smartphone, Gift, Users, Home, BookOpen, Star, Shield, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { donationsService } from '../services/donationsService';
import { donationBoxesService, type DonationBox } from '../services/donationBoxesService';
import { Helmet } from 'react-helmet';

gsap.registerPlugin(ScrollTrigger);

const Donations: React.FC = () => {
  const { language } = useLanguage();
  const [donationType, setDonationType] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [isCompletingDonation, setIsCompletingDonation] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState<string | null>(null);
  const [donationBoxes, setDonationBoxes] = useState<DonationBox[]>([]);
  const [loadingBoxes, setLoadingBoxes] = useState(true);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const sectionRef = useRef<HTMLDivElement>(null);
  // Honeypot anti-bot field for donation form
  const [extra, setExtra] = useState<string | null>(null);

  // Simple numeric captcha (sum of two numbers) similar to Trips.tsx pattern
  const [captchaA, setCaptchaA] = useState<number | null>(null);
  const [captchaB, setCaptchaB] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Icon mapping for donation boxes
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Heart,
    Users,
    Gift,
    Home,
    BookOpen,
    Star,
    Shield
  };

  const suggestedAmounts = [50, 100, 200, 500, 1000];

  // Load donation boxes on component mount
  useEffect(() => {
    loadDonationBoxes();
  }, []);

  // Set initial donation type when boxes are loaded
  useEffect(() => {
    if (donationBoxes.length > 0 && !donationType) {
      setDonationType(donationBoxes[0].key);
    }
  }, [donationBoxes, donationType]);

  const loadDonationBoxes = async () => {
    try {
      console.log('بدء تحميل صناديق التبرع في الصفحة العامة...');
      setLoadingBoxes(true);

      let boxes = await donationBoxesService.getActiveDonationBoxes();
      console.log(`تم تحميل ${boxes.length} صندوق نشط`);

      // إذا لم توجد صناديق نشطة، حاول جلب جميع الصناديق
      if (boxes.length === 0) {
        console.log('لا توجد صناديق نشطة، محاولة جلب جميع الصناديق...');
        try {
          const allBoxes = await donationBoxesService.getDonationBoxes();
          boxes = allBoxes.filter(box => box.isActive);
          console.log(`تم جلب ${boxes.length} صندوق من جميع الصناديق`);
        } catch (allBoxesError) {
          console.error('فشل في جلب جميع الصناديق:', allBoxesError);
        }
      }

      // إذا ما زالت فارغة، استخدم صناديق افتراضية للعرض فقط
      if (boxes.length === 0) {
        console.log('إنشاء صناديق افتراضية للعرض...');
        toast.info('سيتم عرض صناديق افتراضية. قد لا تكون متصلة بقاعدة البيانات.');
        boxes = [
          {
            id: 'default-1',
            key: 'general',
            title: 'تبرع عام',
            titleEn: 'General Donation',
            description: 'للمساهمة في أنشطة الكنيسة العامة',
            descriptionEn: 'To contribute to general church activities',
            color: 'bg-red-500',
            icon: 'Heart',
            target: 50000,
            currentAmount: 0,
            isActive: true,
            category: 'general',
            priority: 'high',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'default-2',
            key: 'building',
            title: 'صندوق البناء',
            titleEn: 'Building Fund',
            description: 'للمساهمة في مشاريع البناء والتطوير',
            descriptionEn: 'To contribute to building and development projects',
            color: 'bg-blue-500',
            icon: 'Users',
            target: 200000,
            currentAmount: 0,
            isActive: true,
            category: 'building',
            priority: 'high',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'default-3',
            key: 'charity',
            title: 'صندوق الفقراء',
            titleEn: 'Poor Fund',
            description: 'لمساعدة المحتاجين والأسر الفقيرة',
            descriptionEn: 'To help the needy and poor families',
            color: 'bg-green-500',
            icon: 'Gift',
            target: 30000,
            currentAmount: 0,
            isActive: true,
            category: 'charity',
            priority: 'medium',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ] as DonationBox[];
        console.log('تم إنشاء 3 صناديق افتراضية للعرض');
      }

      setDonationBoxes(boxes);

      // Set initial donation type if not set
      if (boxes.length > 0 && !donationType) {
        setDonationType(boxes[0].key);
        console.log('تم تعيين نوع التبرع الافتراضي:', boxes[0].key);
      }
    } catch (error) {
      console.error('Error loading donation boxes:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('permission')) {
          toast.error('مشكلة في الصلاحيات. سيتم استخدام صناديق افتراضية.');
        } else if (error.message.includes('network') || error.message.includes('unavailable')) {
          toast.error('مشكلة في الاتصال. سيتم استخدام صناديق افتراضية.');
        } else {
          toast.error('خطأ في تحميل صناديق التبرع. سيتم استخدام صناديق افتراضية.');
        }
      }

      // استخدام صناديق افتراضية في حالة الخطأ
      const fallbackBoxes = [
        {
          id: 'fallback-1',
          key: 'general',
          title: 'تبرع عام',
          titleEn: 'General Donation',
          description: 'للمساهمة في أنشطة الكنيسة العامة',
          descriptionEn: 'To contribute to general church activities',
          color: 'bg-red-500',
          icon: 'Heart',
          target: 50000,
          currentAmount: 0,
          isActive: true,
          category: 'general',
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as DonationBox[];

      setDonationBoxes(fallbackBoxes);
      if (!donationType) {
        setDonationType(fallbackBoxes[0].key);
      }
    } finally {
      setLoadingBoxes(false);
    }
  };

  const handleDonation = async () => {
    // Block if honeypot filled
    if (extra && extra.trim() !== '') {
      console.warn('Blocked donation submission due to honeypot field:', extra);
      toast.error(language === 'ar' ? 'تم حظر الطلب المشبوه' : 'Suspicious submission blocked');
      return;
    }
    if (!donorName || !donorPhone || (!amount && !customAmount)) {
      toast.warning('يرجى ملء جميع البيانات المطلوبة');
      return;
    }
    // captcha must be valid before submitting
    if (!isCaptchaValid()) {
      setCaptchaError(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
      toast.warning(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
      return;
    }
    // Validate phone before proceeding
    if (phoneError || !isValidEgyptPhone(donorPhone)) {
      toast.warning(language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    try {
      // obtain reCAPTCHA token if site key present
      let recaptchaToken: string | undefined = undefined;
      if (RECAPTCHA_SITE_KEY) {
        setRecaptchaLoading(true);
        try {
          recaptchaToken = await getRecaptchaToken('donation');
        } catch (tokenErr) {
          console.error('Failed to get reCAPTCHA token:', tokenErr);
          toast.error(language === 'ar' ? 'فشل التحقق، يرجى المحاولة لاحقاً' : 'Verification failed, please try again later');
          setRecaptchaLoading(false);
          return;
        }
        setRecaptchaLoading(false);
      }
      const selectedDonationBox = donationBoxes.find(box => box.key === donationType);
      if (!selectedDonationBox) {
        toast.error('نوع التبرع غير صحيح');
        return;
      }

      const donationData = {
        donorName,
        donorPhone,
        amount: Number(getFinalAmount()),
        donationType,
        donationTypeTitle: selectedDonationBox.title,
        donationTypeTitleEn: selectedDonationBox.titleEn,
        notes: `تبرع من خلال موقع الكنيسة - نوع التبرع: ${selectedDonationBox.title}`
        // attach recaptcha token if available
        , ...(recaptchaToken ? { recaptchaToken } : {})
      };

      console.log('إنشاء طلب تبرع:', donationData);
      const donationId = await donationsService.addDonation(donationData);
      console.log('تم إنشاء طلب التبرع بنجاح، ID:', donationId);

      setCurrentDonationId(donationId);
      setShowPaymentInstructions(true);
      toast.success('شكراً لك! تم إنشاء طلب التبرع بنجاح. يرجى اتباع التعليمات أدناه لإتمام التبرع.');
    } catch (error) {
      console.error('Error creating donation:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        toast.error('مشكلة في الصلاحيات. يرجى المحاولة لاحقاً أو التواصل مع الإدارة.');
      } else {
        toast.error('حدث خطأ في إنشاء طلب التبرع. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const getFinalAmount = () => {
    return amount === 'custom' ? customAmount : amount;
  };

  // Validate Egyptian phone numbers (supports local 11-digit and +20 prefixed numbers)
  const isValidEgyptPhone = (phone: string) => {
    if (!phone) return false;
    const normalized = phone.replace(/[\s-]/g, '');
    // Local formats: 01X######## (11 digits). X allowed: 0,1,2,5
    const localRegex = /^01(0|1|2|5)\d{8}$/;
    // International: +201X######## or 00201X########
    const intlRegex = /^(?:\+20|0020)1(0|1|2|5)\d{8}$/;
    return localRegex.test(normalized) || intlRegex.test(normalized);
  };

  const isCaptchaValid = () => {
    if (captchaA === null || captchaB === null) return false;
    const expected = captchaA + captchaB;
    const val = parseInt(captchaInput || '', 10);
    return !isNaN(val) && val === expected;
  };

  // reCAPTCHA helpers
  const loadRecaptchaScript = () => new Promise<void>((resolve, reject) => {
    if (!RECAPTCHA_SITE_KEY) return reject(new Error('RECAPTCHA_SITE_KEY not provided'));
    if ((window as any).grecaptcha) return resolve();
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  const getRecaptchaToken = async (action = 'donation') => {
    if (!(window as any).grecaptcha) {
      await loadRecaptchaScript();
    }
    return new Promise<string>((resolve, reject) => {
      try {
        (window as any).grecaptcha.ready(() => {
          (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then((token: string) => {
            if (!token) return reject(new Error('Empty token'));
            resolve(token);
          }).catch(reject);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleDonationComplete = async () => {
    if (!currentDonationId) {
      toast.error('معرف التبرع غير موجود');
      return;
    }

    setIsCompletingDonation(true);
    try {
      await donationsService.updateDonationStatus(currentDonationId, 'completed');
      toast.success('تم تأكيد التبرع بنجاح! شكراً لك على مساهمتك الكريمة.');

      // Reset form and go back to initial state
      setShowPaymentInstructions(false);
      setCurrentDonationId(null);
      setDonorName('');
      setDonorPhone('');
      setAmount('');
      setCustomAmount('');
      setDonationType(donationBoxes[0]?.key || '');
    } catch (error) {
      console.error('Error completing donation:', error);
      toast.error('حدث خطأ في تأكيد التبرع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCompletingDonation(false);
    }
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.donation-card', { opacity: 0, y: 50, scale: 0.9 });
    gsap.set('.form-section', { opacity: 0, x: -50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.donation-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    })
      .to('.form-section', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // generate captcha on mount (and when donation type changes to be safe)
  useEffect(() => {
    const gen = () => {
      setCaptchaA(Math.floor(Math.random() * 8) + 1);
      setCaptchaB(Math.floor(Math.random() * 8) + 1);
      setCaptchaInput('');
      setCaptchaError('');
    };
    gen();
  }, [donationType]);

  return (
    <>
      <Helmet>
        <title>التبرعات والعشور - كنيسة الأنبا رويس بكفر فرج</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              التبرعات والعشور
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              ساهم في خدمة الكنيسة ومساعدة المحتاجين من خلال تبرعاتك الكريمة
            </p>
          </div>

          {!showPaymentInstructions ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Donation Types */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  اختر نوع التبرع
                </h2>
                <div className="space-y-4">
                  {loadingBoxes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : donationBoxes.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {language === 'ar' ? 'لا توجد صناديق تبرع متاحة حالياً' : 'No donation boxes available currently'}
                      </p>
                      <button
                        onClick={loadDonationBoxes}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    </div>
                  ) : (
                    donationBoxes.map((box) => {
                      const IconComponent = iconMap[box.icon] || Heart;
                      const percentage = box.target > 0 ? (box.currentAmount / box.target) * 100 : 0;

                      return (
                        <div
                          key={box.key}
                          onClick={() => setDonationType(box.key)}
                          className={`donation-card p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${donationType === box.key
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-lg'
                              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                            }`}
                        >
                          <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className={`${box.color} p-3 rounded-full`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {language === 'ar' ? box.title : box.titleEn}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                {language === 'ar' ? box.description : box.descriptionEn}
                              </p>
                              {/* Progress bar */}
                              <div className="mb-1">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  <span>{box.currentAmount.toLocaleString()} ج.م</span>
                                  <span>{box.target.toLocaleString()} ج.م</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`${box.color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {percentage.toFixed(1)}% مكتمل
                                </div>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${donationType === box.key
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {donationType === box.key && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Donation Form */}
              <div className="form-section">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  بيانات التبرع
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    {/* Honeypot hidden input for donation form */}
                    <input
                      type="hidden"
                      name="extra"
                      value={extra ?? ''}
                      onChange={(e) => setExtra(e.target.value)}
                    />
                  {/* Personal Info */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم المتبرع
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="أدخل اسمك "
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDonorPhone(val);
                        // live-validate and set friendly error message
                        if (val.trim() === '') {
                          setPhoneError('');
                        } else if (!isValidEgyptPhone(val)) {
                          setPhoneError(language === 'ar' ? 'رقم الهاتف غير صحيح. مثال: 01012345678' : 'Invalid phone number. Example: 01012345678');
                        } else {
                          setPhoneError('');
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${phoneError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="01xxxxxxxxx"
                    />
                    {phoneError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneError}</p>
                    )}
                  </div>

                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      مبلغ التبرع (جنيه مصري)
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {suggestedAmounts.map((suggestedAmount) => (
                        <button
                          key={suggestedAmount}
                          onClick={() => setAmount(suggestedAmount.toString())}
                          className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${amount === suggestedAmount.toString()
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                            }`}
                        >
                          {suggestedAmount}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setAmount('custom')}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-3 ${amount === 'custom'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                        }`}
                    >
                      مبلغ آخر
                    </button>

                    {amount === 'custom' && (
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="أدخل المبلغ"
                        min="1"
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  {/* Captcha (sum of two numbers) */}
                  <div className="mt-6 mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'تحقق' : 'Verification'}
                    </label>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white font-bold">{captchaA ?? '?'} + {captchaB ?? '?'}</div>
                      <input
                        type="number"
                        value={captchaInput}
                        onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={language === 'ar' ? 'أدخل الناتج' : 'Enter sum'}
                      />
                    </div>
                    {captchaError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{captchaError}</p>}
                  </div>
                  <button
                    onClick={handleDonation}
                    disabled={recaptchaLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg
                          font-semibold transition-all duration-300 transform hover:scale-105
                          shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    {recaptchaLoading ? (<Loader className="h-5 w-5 animate-spin" />) : (<Heart className="h-5 w-5" />)}
                    <span>{recaptchaLoading ? (language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...') : 'تبرع الآن'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Instructions */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    تعليمات الدفع
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    شكراً لك على تبرعك الكريم
                  </p>
                </div>

                {/* Donation Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">ملخص التبرع:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">الاسم:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{donorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">نوع التبرع:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {donationBoxes.find(b => b.key === donationType)?.title || ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">المبلغ:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {getFinalAmount()} جنيه
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      <Smartphone className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">فودافون كاش</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      احول المبلغ على الرقم التالي:
                    </p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white" dir="ltr">
                      01110797455
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">تحويل بنكي</h4>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>اسم الحساب: كنيسة السيدة العذراء مريم</p>
                      <p>رقم الحساب: 1234567890123456</p>
                      <p>البنك: البنك الأهلي المصري</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>مهم:</strong> بعد إتمام التحويل، يرجى إرسال صورة من الإيصال على واتساب رقم: 01234567890
                  </p>
                </div>

                <div className="flex space-x-4 rtl:space-x-reverse mt-6">
                  <button
                    onClick={() => setShowPaymentInstructions(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg
                          font-semibold transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    disabled={isCompletingDonation}
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleDonationComplete}
                    disabled={isCompletingDonation}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg
                          font-semibold transition-all duration-300 transform hover:scale-105
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCompletingDonation ? 'جاري المعالجة...' : 'تم التحويل'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Donations;