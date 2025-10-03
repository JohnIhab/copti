import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, DollarSign, CreditCard, Smartphone, Gift, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

gsap.registerPlugin(ScrollTrigger);

const Donations: React.FC = () => {
  const { language, t } = useLanguage();
  const [donationType, setDonationType] = useState('general');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const donationTypes = [
    {
      key: 'general',
      title: 'تبرع عام',
      titleEn: 'General Donation',
      description: 'للمساهمة في أنشطة الكنيسة العامة',
      descriptionEn: 'To contribute to general church activities',
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      key: 'building',
      title: 'صندوق البناء',
      titleEn: 'Building Fund',
      description: 'للمساهمة في مشاريع البناء والتطوير',
      descriptionEn: 'To contribute to building and development projects',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      key: 'poor',
      title: 'صندوق الفقراء',
      titleEn: 'Poor Fund',
      description: 'لمساعدة المحتاجين والأسر الفقيرة',
      descriptionEn: 'To help the needy and poor families',
      icon: Gift,
      color: 'bg-green-500'
    }
  ];

  const suggestedAmounts = [50, 100, 200, 500, 1000];

  const handleDonation = () => {
    if (!donorName || !donorPhone || (!amount && !customAmount)) {
      toast.warning('يرجى ملء جميع البيانات المطلوبة');
      return;
    }
    setShowPaymentInstructions(true);
    toast.success('شكراً لك! تم إنشاء طلب التبرع بنجاح. يرجى اتباع التعليمات أدناه لإتمام التبرع.');
  };

  const getFinalAmount = () => {
    return amount === 'custom' ? customAmount : amount;
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

  return (
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
                {donationTypes.map((type) => (
                  <div
                    key={type.key}
                    onClick={() => setDonationType(type.key)}
                    className={`donation-card p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      donationType === type.key
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className={`${type.color} p-3 rounded-full`}>
                        <type.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {language === 'ar' ? type.title : type.titleEn}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {language === 'ar' ? type.description : type.descriptionEn}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        donationType === type.key
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {donationType === type.key && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Form */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                بيانات التبرع
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Personal Info */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الكريم
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="أدخل اسمك الكريم"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="01xxxxxxxxx"
                  />
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
                        className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                          amount === suggestedAmount.toString()
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
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-3 ${
                      amount === 'custom'
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
                <button
                  onClick={handleDonation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg
                           font-semibold transition-all duration-300 transform hover:scale-105
                           shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Heart className="h-5 w-5" />
                  <span>تبرع الآن</span>
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
                      {donationTypes.find(t => t.key === donationType)?.title}
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
                    01234567890
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
                >
                  رجوع
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg
                                 font-semibold transition-all duration-300 transform hover:scale-105">
                  تم التحويل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;