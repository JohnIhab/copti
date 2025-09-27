import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Calendar, Users, DollarSign, Clock, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Trip {
  id: number;
  title: string;
  titleEn: string;
  destination: string;
  destinationEn: string;
  date: string;
  duration: string;
  durationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  cost: number;
  includes: string[];
  includesEn: string[];
}

const Trips: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrips, setSelectedTrips] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const trips: Trip[] = [
    {
      id: 1,
      title: 'رحلة دير الأنبا بيشوي',
      titleEn: 'St. Bishoy Monastery Trip',
      destination: 'وادي النطرون',
      destinationEn: 'Wadi El Natrun',
      date: '2025-02-20',
      duration: 'يوم واحد',
      durationEn: 'One Day',
      category: 'adults',
      categoryEn: 'Adults',
      description: 'رحلة روحية لدير الأنبا بيشوي العامر بوادي النطرون مع زيارة المتحف والكنائس الأثرية',
      descriptionEn: 'Spiritual trip to St. Bishoy Monastery in Wadi El Natrun with museum and historic churches visit',
      image: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 50,
      registered: 35,
      cost: 200,
      includes: ['المواصلات', 'الغداء', 'المرشد السياحي', 'رسوم الدخول'],
      includesEn: ['Transportation', 'Lunch', 'Tour Guide', 'Entry Fees']
    },
    {
      id: 2,
      title: 'رحلة الأطفال لحديقة الحيوان',
      titleEn: 'Children Zoo Trip',
      destination: 'حديقة حيوان الجيزة',
      destinationEn: 'Giza Zoo',
      date: '2025-02-15',
      duration: 'يوم واحد',
      durationEn: 'One Day',
      category: 'children',
      categoryEn: 'Children',
      description: 'رحلة ترفيهية للأطفال لحديقة الحيوان مع أنشطة تعليمية وألعاب',
      descriptionEn: 'Fun trip for children to the zoo with educational activities and games',
      image: 'https://images.pexels.com/photos/1661535/pexels-photo-1661535.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 40,
      registered: 30,
      cost: 100,
      includes: ['المواصلات', 'الغداء', 'المشرفين', 'الأنشطة'],
      includesEn: ['Transportation', 'Lunch', 'Supervisors', 'Activities']
    },
    {
      id: 3,
      title: 'رحلة الشباب لسانت كاترين',
      titleEn: 'Youth Trip to St. Catherine',
      destination: 'دير سانت كاترين - سيناء',
      destinationEn: 'St. Catherine Monastery - Sinai',
      date: '2025-03-01',
      duration: '3 أيام',
      durationEn: '3 Days',
      category: 'youth',
      categoryEn: 'Youth',
      description: 'رحلة روحية للشباب لدير سانت كاترين مع تسلق جبل موسى ومشاهدة شروق الشمس',
      descriptionEn: 'Spiritual youth trip to St. Catherine Monastery with Mount Moses climbing and sunrise viewing',
      image: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 30,
      registered: 25,
      cost: 800,
      includes: ['المواصلات', 'الإقامة', 'جميع الوجبات', 'المرشد', 'التأمين'],
      includesEn: ['Transportation', 'Accommodation', 'All Meals', 'Guide', 'Insurance']
    },
    {
      id: 4,
      title: 'رحلة الخدام للإسكندرية',
      titleEn: 'Servants Trip to Alexandria',
      destination: 'الإسكندرية',
      destinationEn: 'Alexandria',
      date: '2025-02-28',
      duration: 'يومان',
      durationEn: '2 Days',
      category: 'servants',
      categoryEn: 'Servants',
      description: 'رحلة للخدام لزيارة الكنائس الأثرية بالإسكندرية ومكتبة الإسكندرية',
      descriptionEn: 'Servants trip to visit historic churches in Alexandria and Alexandria Library',
      image: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800',
      capacity: 25,
      registered: 20,
      cost: 400,
      includes: ['المواصلات', 'الإقامة', 'الوجبات', 'الزيارات'],
      includesEn: ['Transportation', 'Accommodation', 'Meals', 'Visits']
    }
  ];

  const categories = [
    { key: 'all', label: 'الكل', labelEn: 'All' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'adults', label: 'الكبار', labelEn: 'Adults' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' }
  ];

  const filteredTrips = trips.filter(trip => 
    selectedCategory === 'all' || trip.category === selectedCategory
  );

  const toggleTripSelection = (tripId: number) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const getTotalCost = () => {
    return selectedTrips.reduce((total, tripId) => {
      const trip = trips.find(t => t.id === tripId);
      return total + (trip?.cost || 0);
    }, 0);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.set('.trip-card', { opacity: 0, y: 50, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.trip-card', {
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
  }, [filteredTrips]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            الرحلات الروحية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            انضم إلينا في رحلاتنا الروحية والترفيهية المميزة لجميع الأعمار
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

        {/* Selected Trips Summary */}
        {selectedTrips.length > 0 && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              الرحلات المختارة ({selectedTrips.length})
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              إجمالي التكلفة: {getTotalCost()} جنيه
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg
                             font-semibold transition-all duration-300 transform hover:scale-105">
              احجز الرحلات المختارة
            </button>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className={`trip-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                       shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                       border-2 ${selectedTrips.includes(trip.id) 
                         ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                         : 'border-gray-100 dark:border-gray-700'} group cursor-pointer`}
              onClick={() => toggleTripSelection(trip.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={trip.image} 
                  alt={language === 'ar' ? trip.title : trip.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {trip.cost} جنيه
                </div>
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {language === 'ar' ? categories.find(c => c.key === trip.category)?.label : categories.find(c => c.key === trip.category)?.labelEn}
                </div>
                {selectedTrips.includes(trip.id) && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'ar' ? trip.title : trip.titleEn}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {language === 'ar' ? trip.description : trip.descriptionEn}
                </p>
                
                <div className="space-y-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                    <span>{language === 'ar' ? trip.destination : trip.destinationEn}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{new Date(trip.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{language === 'ar' ? trip.duration : trip.durationEn}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{trip.registered}/{trip.capacity}</span>
                  </div>
                </div>

                {/* Includes */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">يشمل:</h4>
                  <div className="flex flex-wrap gap-1">
                    {(language === 'ar' ? trip.includes : trip.includesEn).map((item, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                                   px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(trip.registered / trip.capacity) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {trip.cost} جنيه
                  </span>
                  <div className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    selectedTrips.includes(trip.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedTrips.includes(trip.id) ? 'مختار' : 'اختر'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trips;