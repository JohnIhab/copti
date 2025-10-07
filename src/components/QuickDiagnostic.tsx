import React, { useState } from 'react';
import { donationBoxesService } from '../services/donationBoxesService';
import { auth, db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const QuickDiagnostic: React.FC = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Check user authentication
      addResult('فحص المصادقة...');
      if (currentUser) {
        addResult(`✅ مسجل دخول: ${currentUser.email}`);
      } else {
        addResult('❌ غير مسجل دخول');
      }

      // Test 2: Check Firebase config
      addResult('فحص إعدادات Firebase...');
      addResult(`Auth instance: ${auth ? '✅' : '❌'}`);
      addResult(`DB instance: ${db ? '✅' : '❌'}`);

      // Test 3: Try to read collection
      addResult('محاولة قراءة صناديق التبرع...');
      const boxes = await donationBoxesService.getDonationBoxes();
      addResult(`✅ تم قراءة ${boxes.length} صندوق`);

      if (boxes.length === 0) {
        addResult('📝 لا توجد صناديق، سيتم إنشاء صناديق افتراضية...');
        // Try to create a test box
        const testBox = {
          title: 'صندوق تجريبي',
          titleEn: 'Test Box',
          description: 'هذا صندوق تجريبي',
          descriptionEn: 'This is a test box',
          color: 'bg-blue-500',
          icon: 'Heart',
          target: 1000,
          category: 'general',
          priority: 'low' as const
        };
        
        const boxId = await donationBoxesService.addDonationBox(testBox);
        addResult(`✅ تم إنشاء صندوق تجريبي: ${boxId}`);
      }

      addResult('🎉 جميع الاختبارات نجحت!');
    } catch (error) {
      console.error('Diagnostic error:', error);
      if (error instanceof Error) {
        addResult(`❌ خطأ: ${error.message}`);
      } else {
        addResult('❌ خطأ غير معروف');
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        تشخيص سريع لصناديق التبرع
      </h2>
      
      <button
        onClick={runDiagnostic}
        disabled={testing}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold mb-4"
      >
        {testing ? 'جاري الاختبار...' : 'بدء التشخيص'}
      </button>

      {results.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">النتائج:</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickDiagnostic;