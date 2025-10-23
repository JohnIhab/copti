import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Event, getAllEvents } from '../services/eventsService';
import { Helmet } from 'react-helmet';

gsap.registerPlugin(ScrollTrigger);

const Events: React.FC = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 9;
  // removed category filter state — show all events with pagination
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

  // show all events; pagination will slice the events array
  const filteredEvents = events;

  // keep currentPage in range if events length changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(events.length / perPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [events.length, currentPage]);

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
  }, [filteredEvents, currentPage]);

  return (
    <>
    <Helmet>
        <title>فعاليات ومؤتمرات كنيسة الأنبا رويس</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
    </Helmet>
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



        {/* Pagination will replace the previous category filter */}

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
              {language === 'ar' ? 'لم يتم العثور على أي فعاليات' : 'No events available'}
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents
              .slice((currentPage - 1) * perPage, currentPage * perPage)
              .map((event) => (
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
                    <span>{new Date(`1970-01-01T${event.time}`).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{language === 'ar' ? event.location : event.locationEn}</span>
                  </div>
                  
                </div>
              
              </div>
            </div>
          ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-center space-x-3">
            {/* Prev button */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 ml-2 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              {language === 'ar' ? 'السابق' : 'Prev'}
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.max(1, Math.ceil(filteredEvents.length / perPage)) }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredEvents.length / perPage), p + 1))}
              disabled={currentPage >= Math.ceil(filteredEvents.length / perPage)}
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default Events;