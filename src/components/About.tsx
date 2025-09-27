import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Church, Cross, Users, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set([contentRef.current, imageRef.current], { opacity: 0, x: -50 });
    gsap.set(imageRef.current, { x: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(contentRef.current, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
    })
    .to(imageRef.current, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.7');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      id="about"
      ref={sectionRef}
      className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('aboutTitle')}
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('aboutDescription')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Church className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">تأسست عام 2000</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">25 سنة من الخدمة</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">500+ عضو</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">عائلة متنامية</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <Cross className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">خدمة يومية</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">قداسات واجتماعات</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">خدمة المجتمع</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">مساعدة المحتاجين</p>
                </div>
              </div>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold
                             transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              {t('learnMore')}
            </button>
          </div>

          {/* Image/Visual */}
          <div ref={imageRef} className="relative">
            <div className="relative z-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
              <div className="text-center">
                <Church className="h-24 w-24 mx-auto mb-6 text-white/90" />
                <h3 className="text-2xl font-bold mb-4">رسالتنا</h3>
                <p className="text-white/90 leading-relaxed">
                  نسعى لبناء مجتمع محب ومترابط يعكس محبة المسيح، ونخدم جميع الأعمار من خلال برامج روحية واجتماعية متنوعة
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -left-6 w-6 h-6 bg-green-400 rounded-full opacity-70"></div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 
                           rounded-3xl transform rotate-3 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;