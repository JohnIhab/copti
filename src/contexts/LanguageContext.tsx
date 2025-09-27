import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    about: 'عن الكنيسة',
    meetings: 'الاجتماعات',
    events: 'الفعاليات',
    trips: 'الرحلات',
    donations: 'التبرعات',
    bible: 'قراءة الكتاب',
    confession: 'الاعتراف',
    contact: 'اتصل بنا',
    servants: 'الخدام',
    
    // Hero Section
    heroTitle: 'كنيسة السيدة العذراء مريم والأنبا رويس',
    heroSubtitle: 'بكفر فرج جرجس',
    heroDescription: 'مرحباً بكم في بيت الله، حيث نجتمع للعبادة والشركة والخدمة بمحبة المسيح',
    joinUs: 'انضم إلينا',
    learnMore: 'اعرف المزيد',
    
    // Features
    featuresTitle: 'خدماتنا وأنشطتنا',
    dailyMeetings: 'الاجتماعات اليومية',
    dailyMeetingsDesc: 'اجتماعات روحية يومية لجميع الأعمار',
    spiritualTrips: 'الرحلات الروحية',
    spiritualTripsDesc: 'رحلات للأطفال والشباب والخدام',
    bibleReading: 'قراءة الكتاب المقدس',
    bibleReadingDesc: 'خطط قراءة تفاعلية ومحفزة',
    onlineConfession: 'حجز الاعتراف',
    onlineConfessionDesc: 'احجز موعدك للاعتراف أونلاين',
    
    // About
    aboutTitle: 'عن كنيستنا',
    aboutDescription: 'كنيسة السيدة العذراء مريم والأنبا رويس بكفر فرج جرجس هي مجتمع مسيحي محب يرحب بجميع الأشخاص للعبادة والنمو في الإيمان معاً.',
    
    // Footer
    footerDescription: 'كنيسة السيدة العذراء مريم والأنبا رويس - مجتمع محب يخدم بروح المسيح',
    quickLinks: 'روابط سريعة',
    contactInfo: 'معلومات الاتصال',
    followUs: 'تابعنا على',
    rightsReserved: 'جميع الحقوق محفوظة',
  },
  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    meetings: 'Meetings',
    events: 'Events',
    trips: 'Trips',
    donations: 'Donations',
    bible: 'Bible Reading',
    confession: 'Confession',
    contact: 'Contact',
    servants: 'Servants',
    
    // Hero Section
    heroTitle: 'St. Mary & St. Rewis Church',
    heroSubtitle: 'Kafr Farag Gerges',
    heroDescription: 'Welcome to God\'s house, where we gather for worship, fellowship, and service in Christ\'s love',
    joinUs: 'Join Us',
    learnMore: 'Learn More',
    
    // Features
    featuresTitle: 'Our Services & Activities',
    dailyMeetings: 'Daily Meetings',
    dailyMeetingsDesc: 'Daily spiritual meetings for all ages',
    spiritualTrips: 'Spiritual Trips',
    spiritualTripsDesc: 'Trips for children, youth, and servants',
    bibleReading: 'Bible Reading',
    bibleReadingDesc: 'Interactive and motivating reading plans',
    onlineConfession: 'Confession Booking',
    onlineConfessionDesc: 'Book your confession appointment online',
    
    // About
    aboutTitle: 'About Our Church',
    aboutDescription: 'St. Mary & St. Rewis Church in Kafr Farag Gerges is a loving Christian community that welcomes all people to worship and grow in faith together.',
    
    // Footer
    footerDescription: 'St. Mary & St. Rewis Church - A loving community serving in the spirit of Christ',
    quickLinks: 'Quick Links',
    contactInfo: 'Contact Information',
    followUs: 'Follow Us',
    rightsReserved: 'All Rights Reserved',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('church-language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('church-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};