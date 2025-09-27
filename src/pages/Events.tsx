import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Users, Clock, Star, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  id: number;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  featured: boolean;
}

const Events: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const sectionRef = useRef<HTMLDivElement>(null);

  const events: Event[] = [
    {
      id: 1,
      title: 'مؤتمر الشباب السنوي',
      titleEn: 'Annual Youth Conference',
      date: '2025-02-15',
      time: '9:00 AM',
      location: 'قاعة المؤتمرات الكبرى',
      locationEn: 'Grand Conference Hall',
      category: 'conference',
      categoryEn: 'Conference',
      description: 'مؤتمر روحي للشباب مع متحدثين مميزين وأنشطة تفاعلية',
      descriptionEn: 'Spiritual conference for youth with distinguished speakers and interactive activities',
      image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 200,
      registered: 150,
      featured: true
    },
    {
      id: 2,
      title: 'احتفالية عيد الميلاد',
      titleEn: 'Christmas Celebration',
      date: '2025-01-07',
      time: '7:00 PM',
      location: 'الكنيسة الرئيسية',
      locationEn: 'Main Church',
      category: 'celebration',
      categoryEn: 'Celebration',
      description: 'احتفال بميلاد السيد المسيح مع ترانيم وعروض للأطفال',
      descriptionEn: 'Celebrating the birth of Jesus Christ with hymns and children\'s performances',
      image: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 300,
      registered: 280,
      featured: true
    },
    {
      id: 3,
      title: 'ندوة الأسرة المسيحية',
      titleEn: 'Christian Family Seminar',
      date: '2025-02-01',
      time: '6:00 PM',
      location: 'قاعة الاجتماعات',
      locationEn: 'Meeting Hall',
      category: 'seminar',
      categoryEn: 'Seminar',
      description: 'ندوة حول بناء الأسرة المسيحية وتربية الأطفال',
      descriptionEn: 'Seminar on building Christian families and raising children',
      image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 100,
      registered: 75,
      featured: false
    },
    {
      id: 4,
      title: 'مهرجان الترانيم',
      titleEn: 'Hymns Festival',
      date: '2025-03-10',
      time: '8:00 PM',
      location: 'الحديقة الخارجية',
      locationEn: 'Outdoor Garden',
      category: 'festival',
      categoryEn: 'Festival',
      description: 'أمسية ترانيم روحية مع جوقات من كنائس مختلفة',
      descriptionEn: 'Spiritual hymns evening with choirs from different churches',
      image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 400,
      registered: 320,
      featured: true
    }
  ];

  const categories = [
    { key: 'all', label: 'الكل', labelEn: 'All' },
    { key: 'conference', label: 'مؤتمرات', labelEn: 'Conferences' },
    { key: 'celebration', label: 'احتفاليات', labelEn: 'Celebrations' },
    { key: 'seminar', label: 'ندوات', labelEn: 'Seminars' },
    { key: 'festival', label: 'مهرجانات', labelEn: 'Festivals' }
  ];

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  const featuredEvents = events.filter(event => event.featured);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.event-card', { opacity: 0, y: 50, scale: 0.9 });
    gsap.set('.featured-card', { opacity: 0, x: -50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.featured-card', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
    })
    .to('.event-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    }, '-=0.4');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            الفعاليات والمؤتمرات
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            اكتشف فعالياتنا الروحية والثقافية المميزة على مدار السنة
          </p>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              الفعاليات المميزة
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="featured-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                           shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                           border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={language === 'ar' ? event.title : event.titleEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      مميز
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {language === 'ar' ? event.title : event.titleEn}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {language === 'ar' ? event.description : event.descriptionEn}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(event.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg
                                     font-semibold transition-all duration-300 transform hover:scale-105">
                      سجل الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'ar' ? category.label : category.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                       shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                       border border-gray-100 dark:border-gray-700 group"
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={language === 'ar' ? event.title : event.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {language === 'ar' ? categories.find(c => c.key === event.category)?.label : categories.find(c => c.key === event.category)?.labelEn}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'ar' ? event.title : event.titleEn}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                  {language === 'ar' ? event.description : event.descriptionEn}
                </p>
                
                <div className="space-y-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{language === 'ar' ? event.location : event.locationEn}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.registered}/{event.capacity}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  ></div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg
                                 font-semibold transition-all duration-300 transform hover:scale-105">
                  سجل الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;