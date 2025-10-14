import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Church, Cross, Users, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LearnMoreBtn from './LearnMoreBtn';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set([contentRef.current, imageRef.current], { opacity: 0 });

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
      duration: 1,
      ease: 'power3.out',
    })
    .to(imageRef.current, {
      opacity: 1,
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
      className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-gray-800 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Content */}
          <div ref={contentRef}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              {t('aboutTitle')}
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              {t('aboutDescription')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Church className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">تأسست عام 1930</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">25 سنة من الخدمة</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="bg-green-100 dark:bg-green-900 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">500+ عضو</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">عائلة متنامية</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Cross className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">خدمة يومية</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">قداسات واجتماعات</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="bg-red-100 dark:bg-red-900 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">خدمة المجتمع</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">مساعدة المحتاجين</p>
                </div>
              </div>
            </div>
            <Link to="/aboutpage">
              <LearnMoreBtn />
            </Link>
            
          </div>

          {/* Image/Visual */}
          <div ref={imageRef} className="relative mt-8 lg:mt-0">
            <div className="relative z-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white">
              <div className="text-center">
                <Church className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto mb-4 sm:mb-6 text-white/90" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">رسالتنا</h3>
                <p className="text-white/90 leading-relaxed text-sm sm:text-base lg:text-lg">
                  نسعى لبناء مجتمع محب ومترابط يعكس محبة المسيح، ونخدم جميع الأعمار من خلال برامج روحية واجتماعية متنوعة
                </p>
              </div>
              
              {/* Decorative elements - responsive sizing */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full opacity-80"></div>
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-8 h-8 sm:w-12 sm:h-12 bg-pink-400 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -left-3 sm:-left-6 w-4 h-4 sm:w-6 sm:h-6 bg-green-400 rounded-full opacity-70"></div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 
                           rounded-2xl sm:rounded-3xl transform rotate-2 sm:rotate-3 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;