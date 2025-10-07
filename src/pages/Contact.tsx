import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { submitContactMessage, ContactFormData } from '../services/contactService';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
        toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
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
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'An error occurred while sending the message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'العنوان',
      titleEn: 'Address',
      content: 'كفر فرج جرجس، محافظة الشرقية، مصر',
      contentEn: 'Kafr Farag Gerges, Sharkia Governorate, Egypt',
      color: 'text-red-500'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      titleEn: 'Phone',
      content: '+201110797455',
      contentEn: '+201110797455',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      titleEn: 'Email',
      content: 'johnihab.01@gmail.com',
      contentEn: 'johnihab.01@gmail.com',
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
    { icon: Facebook, href: '#', color: 'hover:text-blue-600', name: 'Facebook' },
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

  return (
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
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="contact-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg
                       hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                       border border-gray-100 dark:border-gray-700 text-center group"
            >
              <div className={`${info.color} bg-gray-50 dark:bg-gray-700 p-4 rounded-full w-16 h-16 mx-auto mb-4
                            group-hover:scale-110 transition-transform duration-300`}>
                <info.icon className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? info.title : info.titleEn}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {language === 'ar' ? info.content : info.contentEn}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="form-section">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              أرسل لنا رسالة
            </h2>
            
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="01xxxxxxxxx"
                  />
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
              
              {/* Map Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">خريطة الموقع</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">كفر فرج جرجس، الشرقية</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
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
                    className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-full ${social.color} 
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
  );
};

export default Contact;