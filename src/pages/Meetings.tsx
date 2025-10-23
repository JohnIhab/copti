import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CardMeeting from '../components/CardMeeting';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Helmet } from "react-helmet";

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
  // Category filter removed — only search is used now
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Helper function to format date to only the weekday name
  const formatDateToDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long'
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

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = searchTerm === '' ||
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE));
  const paginatedMeetings = filteredMeetings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!sectionRef.current) return;

  gsap.set('.meeting-card', { opacity: 0, y: 50, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.meeting-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredMeetings]);

  return (
    <>
      <Helmet>
        <title>دور وتميز كنيسة الأنبا رويس | الاجتماعات اليومية</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
      </Helmet>
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
          <div className="mb-8">
            <div className="flex items-center justify-end">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في الاجتماعات...' : 'Search meetings...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full
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
              {paginatedMeetings.map((meeting) => (
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

          {/* Pagination Controls */}
          {!loading && filteredMeetings.length > ITEMS_PER_PAGE && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                {language === 'ar' ? 'السابق' : 'Prev'}
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
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
    </>
  );
};

export default Meetings;