import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { submitContactMessage, ContactFormData } from '../services/contactService';
import { Helmet } from 'react-helmet';

gsap.registerPlugin(ScrollTrigger);

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  // Honeypot anti-bot field for contact form
  const [extra, setExtra] = useState<string | null>(null);
  // Simple numeric captcha (sum of two numbers)
  const [captchaA, setCaptchaA] = useState<number | null>(null);
  const [captchaB, setCaptchaB] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isValidEgyptPhone = (phone: string) => {
    if (!phone) return false;
    const normalized = phone.replace(/[\s-]/g, '');
    // Local formats: 01X######## (11 digits). X allowed: 0,1,2,5
    const localRegex = /^01(0|1|2|5)\d{8}$/;
    // International: +201X######## or 00201X########
    const intlRegex = /^(?:\+20|0020)1(0|1|2|5)\d{8}$/;
    return localRegex.test(normalized) || intlRegex.test(normalized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'phone') {
      // live-validate phone and set friendly error message
      if (value.trim() === '') {
        setPhoneError('');
      } else if (!isValidEgyptPhone(value)) {
        setPhoneError(language === 'ar' ? 'رقم الهاتف غير صحيح. مثال: 01012345678' : 'Invalid phone number. Example: 01012345678');
      } else {
        setPhoneError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Block if honeypot filled
    if (extra && extra.trim() !== '') {
      console.warn('Blocked contact submission due to honeypot field:', extra);
      toast.error(language === 'ar' ? 'تم حظر الطلب المشبوه' : 'Suspicious submission blocked');
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
        toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // captcha must be valid before submitting
      if (!isCaptchaValid()) {
        setCaptchaError(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
        toast.warning(language === 'ar' ? 'الرجاء حل اختبار التحقق' : 'Please solve the verification question');
        setIsSubmitting(false);
        return;
      }

      // Submit to Firebase
      await submitContactMessage(formData as ContactFormData);

      toast.success(language === 'ar' ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Your message has been sent successfully! We will contact you soon.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Reset captcha after successful submit
      setCaptchaA(Math.floor(Math.random() * 8) + 1);
      setCaptchaB(Math.floor(Math.random() * 8) + 1);
      setCaptchaInput('');
      setCaptchaError('');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'An error occurred while sending the message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCaptchaValid = () => {
    if (captchaA === null || captchaB === null) return false;
    const expected = captchaA + captchaB;
    const val = parseInt(captchaInput || '', 10);
    return !isNaN(val) && val === expected;
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'العنوان',
      titleEn: 'Address',
      content: 'كفر فرج جرجس، محافظة الشرقية، مصر',
      contentEn: 'Kafr Farag Gerges, Sharkia Governorate, Egypt',
      // link to open in Google Maps (opens in new tab)
      href: 'https://www.google.com/maps/search/?api=1&query=30.5143667,31.3321065',
      color: 'text-red-500'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      titleEn: 'Phone',
      content: '+201110797455',
      contentEn: '+201110797455',
      // tel: link so clicking will attempt to call on supported devices
      href: 'tel:+201110797455',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      titleEn: 'Email',
      content: 'johnihab.01@gmail.com',
      contentEn: 'johnihab.01@gmail.com',
      // mailto: link to open email client
      href: 'mailto:johnihab.01@gmail.com',
      color: 'text-blue-500'
    }
  ];

  const subjects = [
    { value: 'general', label: 'استفسار عام', labelEn: 'General Inquiry' },
    { value: 'baptism', label: 'المعمودية', labelEn: 'Baptism' },
    { value: 'wedding', label: 'الزواج', labelEn: 'Wedding' },
    { value: 'funeral', label: 'الجنازة', labelEn: 'Funeral' },
    { value: 'donation', label: 'التبرعات', labelEn: 'Donations' },
    { value: 'volunteer', label: 'التطوع', labelEn: 'Volunteering' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100064731461327', color: 'hover:text-blue-600', name: 'Facebook' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600', name: 'Instagram' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600', name: 'YouTube' }
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.contact-card', { opacity: 0, y: 50, scale: 0.9 });
    gsap.set('.form-section', { opacity: 0, x: 50 });
    gsap.set('.map-section', { opacity: 0, x: -50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.contact-card', {
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
      }, '-=0.4')
      .to('.map-section', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // generate captcha on mount
  useEffect(() => {
    setCaptchaA(Math.floor(Math.random() * 8) + 1);
    setCaptchaB(Math.floor(Math.random() * 8) + 1);
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  return (
    <>
      <Helmet>
        <title>اتصل بنا - كنيسة الأنبا رويس بكفر فرج</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              اتصل بنا
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              نحن هنا لخدمتك. تواصل معنا في أي وقت وسنكون سعداء للمساعدة
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, index) => {
              const title = language === 'ar' ? info.title : info.titleEn;
              const content = language === 'ar' ? info.content : info.contentEn;

              const card = (
                <div
                  className="contact-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg
                        hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                        border border-gray-100 dark:border-gray-700 text-center group"
                >
                  <div className={`${info.color} bg-gray-50 dark:bg-gray-700 p-4 rounded-full w-16 h-16 mx-auto mb-4
                              group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words">{content}</p>
                </div>
              );

              // If href exists, wrap the entire card so the whole card is clickable
              if (info.href) {
                return (
                  <a
                    key={index}
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={title}
                    className="block"
                  >
                    {card}
                  </a>
                );
              }

              return (
                <div key={index}>{card}</div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                أرسل لنا رسالة
              </h2>

              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Honeypot hidden input for contact form */}
                <input
                  type="hidden"
                  name="extra"
                  value={extra ?? ''}
                  onChange={(e) => setExtra(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الكريم *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="أدخل اسمك الكريم"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${phoneError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="01xxxxxxxxx"
                    />
                    {phoneError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneError}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع الرسالة *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">اختر موضوع الرسالة</option>
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {language === 'ar' ? subject.label : subject.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                {/* Captcha (sum of two numbers) */}
                <div className="mt-2 mb-4">
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
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg
                         font-semibold transition-all duration-300 transform hover:scale-105
                         shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Additional Info */}
            <div className="map-section space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  موقع الكنيسة
                </h2>

                {/* Embedded Google Map */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2" style={{ minHeight: '16rem' }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3110.5195066690103!2d31.3321065!3d30.5143667!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7e6b7ce326ae9%3A0xb78e347a37a6ed97!2z2YPZhtmK2LPYqSDYp9mE2LPZitiv2Kkg2KfZhNi52LDYsdin2KEg2YXYsdmK2YUg2YjYp9mE2YLYr9mK2LMg2KfZhNij2YbYqNinINix2YjZitizINio2YPZgdixINmB2LHYrCDYp9mK2KjYp9ix2LTZitipINin2YTYstmC2KfYstmK2YIg2Ygg2YXZhtmK2KfYp9mE2YLZhdit!5e1!3m2!1sar!2seg!4v1760547205236!5m2!1sar!2seg"
                      width="100%"
                      height="250"
                      style={{ border: 0, borderRadius: '0.5rem', width: '100%', minHeight: '200px', maxWidth: '100%' }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    <div className="text-center mt-2">
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Hours */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 ml-2 text-blue-600" />
                  أوقات الخدمة
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">القداس الصباحي</span>
                    <span className="font-semibold text-gray-900 dark:text-white">7:00 ص</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">اجتماع الشباب</span>
                    <span className="font-semibold text-gray-900 dark:text-white">الخميس 7:00 م</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-300">مدرسة الأحد</span>
                    <span className="font-semibold text-gray-900 dark:text-white">الجمعة 10:30 ص</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  تابعنا على
                </h3>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`p-3 bg-gray-100 dark:bg-white rounded-full ${social.color} 
                            transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                      title={social.name}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;