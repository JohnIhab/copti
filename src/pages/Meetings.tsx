import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, MapPin, Users, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CardMeeting from '../components/CardMeeting';

gsap.registerPlugin(ScrollTrigger);

interface Meeting {
  id: number;
  title: string;
  titleEn: string;
  time: string;
  day: string;
  dayEn: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  capacity: number;
  registered: number;
}

const Meetings: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const meetings: Meeting[] = [
    {
      id: 1,
      title: 'اجتماع الشباب',
      titleEn: 'Youth Meeting',
      time: '7:00 PM',
      day: 'الجمعة',
      dayEn: 'Friday',
      location: 'قاعة الكنيسة الرئيسية',
      locationEn: 'Main Church Hall',
      category: 'youth',
      categoryEn: 'Youth',
      description: 'اجتماع أسبوعي للشباب مع دراسة كتابية وأنشطة روحية',
      descriptionEn: 'Weekly youth meeting with Bible study and spiritual activities',
      capacity: 100,
      registered: 75
    },
    {
      id: 2,
      title: 'مدرسة الأحد للأطفال',
      titleEn: 'Sunday School for Children',
      time: '10:00 AM',
      day: 'الأحد',
      dayEn: 'Sunday',
      location: 'فصول مدرسة الأحد',
      locationEn: 'Sunday School Classrooms',
      category: 'children',
      categoryEn: 'Children',
      description: 'تعليم الأطفال قصص الكتاب المقدس والقيم المسيحية',
      descriptionEn: 'Teaching children Bible stories and Christian values',
      capacity: 80,
      registered: 65
    },
    {
      id: 3,
      title: 'اجتماع الخدام',
      titleEn: 'Servants Meeting',
      time: '8:00 PM',
      day: 'الثلاثاء',
      dayEn: 'Tuesday',
      location: 'قاعة الاجتماعات',
      locationEn: 'Meeting Room',
      category: 'servants',
      categoryEn: 'Servants',
      description: 'اجتماع أسبوعي للخدام لمناقشة الخدمة والتخطيط',
      descriptionEn: 'Weekly servants meeting for service discussion and planning',
      capacity: 30,
      registered: 25
    },
    {
      id: 4,
      title: 'اجتماع السيدات',
      titleEn: 'Ladies Meeting',
      time: '6:00 PM',
      day: 'الأربعاء',
      dayEn: 'Wednesday',
      location: 'قاعة السيدات',
      locationEn: 'Ladies Hall',
      category: 'ladies',
      categoryEn: 'Ladies',
      description: 'اجتماع أسبوعي للسيدات مع دراسة كتابية وشركة',
      descriptionEn: 'Weekly ladies meeting with Bible study and fellowship',
      capacity: 60,
      registered: 45
    }
  ];

  const categories = [
    { key: 'all', label: 'الكل', labelEn: 'All' },
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' },
    { key: 'ladies', label: 'السيدات', labelEn: 'Ladies' }
  ];

  const filteredMeetings = meetings.filter(meeting => {
    const matchesCategory = selectedCategory === 'all' || meeting.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.meeting-card', { opacity: 0, y: 50, scale: 0.9 });
    gsap.set('.filter-item', { opacity: 0, x: -20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.filter-item', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
    })
    .to('.meeting-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    }, '-=0.3');

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredMeetings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            الاجتماعات اليومية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            انضم إلينا في اجتماعاتنا الروحية المنتظمة لجميع الأعمار والفئات
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`filter-item px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {language === 'ar' ? category.label : category.labelEn}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في الاجتماعات...' : 'Search meetings...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Meetings Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <CardMeeting
                title={language === 'ar' ? meeting.title : meeting.titleEn}
                time={meeting.time}
                day={language === 'ar' ? meeting.day : meeting.dayEn}
                location={language === 'ar' ? meeting.location : meeting.locationEn}
                description={language === 'ar' ? meeting.description : meeting.descriptionEn}
                category={language === 'ar' ? categories.find(c => c.key === meeting.category)?.label || meeting.category : categories.find(c => c.key === meeting.category)?.labelEn || meeting.categoryEn}
                capacity={meeting.capacity}
                registered={meeting.registered}
                onJoin={() => {
                  console.log(`Joining meeting: ${meeting.title}`);
                }}
              />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMeetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد اجتماعات' : 'No meetings found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'جرب تغيير الفلتر أو البحث' : 'Try changing the filter or search term'}
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Meetings;