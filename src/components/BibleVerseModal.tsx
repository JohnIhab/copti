import React, { useState, useEffect } from 'react';
import { X, BookOpen, RefreshCw, Wifi, TestTube } from 'lucide-react';
import { getDailyVerse, getRandomVerse, BibleVerse, forceArabicVersesOnly, forceAPIVerse, testAllArabicBibles } from '../services/bibleService';

interface BibleVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BibleVerseModal: React.FC<BibleVerseModalProps> = ({ isOpen, onClose }) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDailyVerse, setIsDailyVerse] = useState(true);
  const [isFromAPI, setIsFromAPI] = useState(false);

  useEffect(() => {
    if (isOpen && !verse) {
      // Force clear any English verses from cache first
      forceArabicVersesOnly();
      fetchDailyVerse();
    }
  }, [isOpen, verse]);

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDailyVerse(true);
      const fetchedVerse = await getDailyVerse();
      if (fetchedVerse) {
        setVerse(fetchedVerse);
        setIsFromAPI(!fetchedVerse.id.includes('fallback'));
      } else {
        setError('فشل في تحميل آية اليوم');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل آية اليوم');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomVerse = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDailyVerse(false);
      const fetchedVerse = await getRandomVerse();
      if (fetchedVerse) {
        setVerse(fetchedVerse);
        setIsFromAPI(!fetchedVerse.id.includes('fallback'));
      } else {
        setError('فشل في تحميل آية عشوائية');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل آية عشوائية');
    } finally {
      setLoading(false);
    }
  };

  const forceAPIFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDailyVerse(false);
      const fetchedVerse = await forceAPIVerse();
      if (fetchedVerse) {
        setVerse(fetchedVerse);
        setIsFromAPI(true);
      } else {
        setError('فشل في تحميل آية من الـ API');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل آية من الـ API');
    } finally {
      setLoading(false);
    }
  };

  const testAPIs = async () => {
    setLoading(true);
    await testAllArabicBibles();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" dir="rtl">
              {isDailyVerse ? 'آية اليوم من الكتاب المقدس' : 'آية من الكتاب المقدس'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-3 text-gray-600 dark:text-gray-300" dir="rtl">
                جاري التحميل...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4" dir="rtl">{error}</p>
              <button
                onClick={fetchDailyVerse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                dir="rtl"
              >
                حاول مرة أخرى
              </button>
            </div>
          ) : verse ? (
            <div className="text-center">
              {/* Verse Content */}
              <div className="mb-6">
                <blockquote 
                  className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-4 font-arabic"
                  style={{ fontFamily: 'Amiri, serif', lineHeight: '1.8' }}
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: verse.content }}
                />
                <cite className="text-sm md:text-base font-semibold text-blue-600 dark:text-blue-400" dir="rtl">
                  - {verse.reference}
                </cite>
              </div>

              {/* Daily Verse Indicator */}
              {isDailyVerse && (
                <div className="mb-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full inline-block text-sm" dir="rtl">
                  ⭐ آية اليوم
                </div>
              )}

              {/* API Source Indicator */}
              {/* <div className="mb-4 flex justify-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm ${isFromAPI 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                }`} dir="rtl">
                  {isFromAPI ? '🌐 من الـ API' : '📚 نسخة احتياطية'}
                </div>
              </div> */}

              {/* Copyright */}
              {/* {verse.copyright && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4" dir="rtl">
                  {verse.copyright}
                </p>
              )} */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={fetchDailyVerse}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isDailyVerse 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  dir="rtl"
                >
                  <BookOpen className="h-4 w-4" />
                  آية اليوم
                </button>
                <button
                  onClick={fetchRandomVerse}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  dir="rtl"
                >
                  <RefreshCw className="h-4 w-4" />
                  آية عشوائية
                </button>
                {/* <button
                  onClick={forceAPIFetch}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                  dir="rtl"
                  title="فرض الجلب من API"
                >
                  <Wifi className="h-4 w-4" />
                  فرض API
                </button> */}
              </div>
              
              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-3">
                {/* <button
                  onClick={testAPIs}
                  className="px-4 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                  dir="rtl"
                  title="اختبار جميع مصادر API"
                >
                  <TestTube className="h-3 w-3" />
                  اختبار APIs
                </button> */}
                <button
                  onClick={onClose}
                  className="px-4 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  dir="rtl"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BibleVerseModal;