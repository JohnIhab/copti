import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Book, Phone, Users, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const features = [
    {
      icon: Calendar,
      title: t('dailyMeetings'),
      description: t('dailyMeetingsDesc'),
      color: 'bg-blue-500',
      delay: 0,
    },
    {
      icon: MapPin,
      title: t('spiritualTrips'),
      description: t('spiritualTripsDesc'),
      color: 'bg-green-500',
      delay: 0.1,
    },
    {
      icon: Book,
      title: t('bibleReading'),
      description: t('bibleReadingDesc'),
      color: 'bg-amber-500',
      delay: 0.2,
    },
    {
      icon: Phone,
      title: t('onlineConfession'),
      description: t('onlineConfessionDesc'),
      color: 'bg-purple-500',
      delay: 0.3,
    },
    {
      icon: Users,
      title: 'خدمة الشباب',
      description: 'برامج متنوعة للشباب والمراهقين',
      color: 'bg-red-500',
      delay: 0.4,
    },
    {
      icon: Heart,
      title: 'الخدمة الاجتماعية',
      description: 'مساعدة المحتاجين في المجتمع',
      color: 'bg-pink-500',
      delay: 0.5,
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set(titleRef.current, { opacity: 0, y: 30 });
    gsap.set('.feature-card', { opacity: 0, y: 50, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
    .to('.feature-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.4');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('featuresTitle')}
          </h2>
        </div>

        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg
                       hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                       border border-gray-100 dark:border-gray-700"
            >
              <div className={`${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6
                            group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 
                           dark:group-hover:text-blue-400 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-6">
                <button className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 
                                 dark:hover:text-blue-300 transition-colors duration-300">
                  اعرف المزيد ←
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;