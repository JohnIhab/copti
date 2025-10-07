import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { donationBoxesService } from '../services/donationBoxesService';
import { toast } from 'react-toastify';

const FirestoreTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirestoreConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('بدء اختبار الاتصال بـ Firestore...');
      
      // Test reading
      addTestResult('اختبار القراءة...');
      const boxes = await donationBoxesService.getDonationBoxes();
      addTestResult(`تم قراءة ${boxes.length} صندوق بنجاح`);
      
      // Test writing
      addTestResult('اختبار الكتابة...');
      const testBox = {
        title: 'صندوق اختبار',
        titleEn: 'Test Box',
        description: 'هذا صندوق للاختبار',
        descriptionEn: 'This is a test box',
        color: 'bg-blue-500',
        icon: 'Heart',
        target: 1000,
        category: 'general',
        priority: 'low' as const
      };
      
      const boxId = await donationBoxesService.addDonationBox(testBox);
      addTestResult(`تم إنشاء صندوق اختبار بنجاح - ID: ${boxId}`);
      
      // Clean up test box
      addTestResult('حذف صندوق الاختبار...');
      await donationBoxesService.deleteDonationBox(boxId);
      addTestResult('تم حذف صندوق الاختبار بنجاح');
      
      addTestResult('✅ جميع الاختبارات نجحت!');
      toast.success('اختبار Firestore نجح!');
      
    } catch (error) {
      console.error('Firestore test error:', error);
      addTestResult(`❌ خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      toast.error('فشل اختبار Firestore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          اختبار اتصال Firestore
        </h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            معلومات المستخدم:
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            {currentUser ? (
              <div>
                <p><strong>البريد الإلكتروني:</strong> {currentUser.email}</p>
                <p><strong>UID:</strong> {currentUser.uid}</p>
                <p><strong>حالة التحقق:</strong> {currentUser.emailVerified ? 'محقق' : 'غير محقق'}</p>
              </div>
            ) : (
              <p className="text-red-500">غير مسجل دخول</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={testFirestoreConnection}
            disabled={isLoading || !currentUser}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300"
          >
            {isLoading ? 'جاري الاختبار...' : 'بدء اختبار Firestore'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              نتائج الاختبار:
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreTest;