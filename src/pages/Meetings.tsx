import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CardMeeting from '../components/CardMeeting';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

interface Meeting {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  locationEn: string;
  type: string;
  typeEn: string;
  description: string;
  descriptionEn: string;
  organizer: string;
  organizerEn: string;
  maxAttendees: number;
  currentAttendees: number;
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  category?: string;
  image?: string;
}

const Meetings: React.FC = () => {
  const { language } = useLanguage();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Helper function to format date to day name
  const formatDateToDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load meetings from Firebase
  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const meetingsRef = collection(db, 'meetings');
      const q = query(meetingsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);

      const meetingsData: Meeting[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        meetingsData.push({
          id: doc.id,
          ...data,
          category: data.type, // Map type to category for filtering compatibility
          image: data.image || undefined
        } as Meeting);
      });

      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const categories = [
    { key: 'all', label: 'الكل', labelEn: 'All' },
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'prayer', label: 'صلاة', labelEn: 'Prayer' },
    { key: 'bible-study', label: 'دراسة كتابية', labelEn: 'Bible Study' },
    { key: 'worship', label: 'تسبيح', labelEn: 'Worship' },
    { key: 'leadership', label: 'قيادة', labelEn: 'Leadership' },
    { key: 'general', label: 'عام', labelEn: 'General' }
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
                  className={`filter-item px-4 py-2 rounded-full font-medium transition-all duration-300 ${selectedCategory === category.key
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

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-center">
              {language === 'ar' ? 'حدث خطأ في تحميل الاجتماعات. يتم عرض اجتماعات افتراضية.' : 'Error loading meetings. Showing default meetings.'}
            </p>
          </div>
        )}

        {/* Meetings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
              {language === 'ar' ? 'جاري تحميل الاجتماعات...' : 'Loading meetings...'}
            </p>
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                <CardMeeting
                  title={language === 'ar' ? meeting.title : meeting.titleEn}
                  time={meeting.time}
                  day={formatDateToDay(meeting.date)}
                  location={language === 'ar' ? meeting.location : meeting.locationEn}
                  description={language === 'ar' ? meeting.description : meeting.descriptionEn}
                  organizer={language === 'ar' ? meeting.organizer : meeting.organizer}
                  image={meeting.image}
                  onJoin={() => {
                    console.log(`Joining meeting: ${meeting.title}`);
                  }}
                />
              </div>
            ))}
          </div>
        )}

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