import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Event, getAllEvents } from '../services/eventsService';

gsap.registerPlugin(ScrollTrigger);

const Events: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const categories = [
    { key: 'all', label: 'الكل', labelEn: 'All' },
    { key: 'conference', label: 'مؤتمرات', labelEn: 'Conferences' },
    { key: 'celebration', label: 'احتفاليات', labelEn: 'Celebrations' },
    { key: 'seminar', label: 'ندوات', labelEn: 'Seminars' },
    { key: 'festival', label: 'مهرجانات', labelEn: 'Festivals' },
    { key: 'youth', label: 'شباب', labelEn: 'Youth' },
    { key: 'children', label: 'أطفال', labelEn: 'Children' },
    { key: 'prayer', label: 'صلاة', labelEn: 'Prayer' },
    { key: 'workshop', label: 'ورش عمل', labelEn: 'Workshops' }
  ];

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  // const featuredEvents = events.filter(event => event.featured);

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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد فعاليات' : 'No Events Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === 'all' 
                ? (language === 'ar' ? 'لم يتم العثور على أي فعاليات' : 'No events available')
                : (language === 'ar' ? 'لا توجد فعاليات في هذه الفئة' : 'No events found in this category')
              }
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Events;