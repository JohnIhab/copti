import React from 'react';
import { donationBoxesService } from '../services/donationBoxesService';

const TestDonationBoxes: React.FC = () => {
  const [results, setResults] = React.useState<string[]>([]);
  const [testing, setTesting] = React.useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = async () => {
    setTesting(true);
    setResults([]);

    try {
      addResult('🔍 بدء اختبار صناديق التبرع...');

      // Test 1: Get all boxes
      addResult('📦 اختبار جلب جميع الصناديق...');
      try {
        const allBoxes = await donationBoxesService.getDonationBoxes();
        addResult(`✅ تم جلب ${allBoxes.length} صندوق من إجمالي الصناديق`);
        allBoxes.forEach((box, index) => {
          addResult(`   ${index + 1}. ${box.title} (${box.isActive ? 'نشط' : 'غير نشط'})`);
        });
      } catch (error) {
        addResult(`❌ فشل في جلب جميع الصناديق: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }

      // Test 2: Get active boxes
      addResult('🎯 اختبار جلب الصناديق النشطة...');
      try {
        const activeBoxes = await donationBoxesService.getActiveDonationBoxes();
        addResult(`✅ تم جلب ${activeBoxes.length} صندوق نشط`);
        activeBoxes.forEach((box, index) => {
          addResult(`   ${index + 1}. ${box.title} - ${box.currentAmount}/${box.target} ج.م`);
        });
      } catch (error) {
        addResult(`❌ فشل في جلب الصناديق النشطة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }

      // Test 3: Try to create a test box
      addResult('➕ اختبار إنشاء صندوق تجريبي...');
      try {
        const testBox = {
          title: `صندوق تجريبي ${Date.now()}`,
          titleEn: `Test Box ${Date.now()}`,
          description: 'هذا صندوق للاختبار فقط',
          descriptionEn: 'This is a test box only',
          color: 'bg-purple-500',
          icon: 'Star',
          target: 5000,
          category: 'test',
          priority: 'low' as const
        };
        
        const boxId = await donationBoxesService.addDonationBox(testBox);
        addResult(`✅ تم إنشاء صندوق تجريبي: ${boxId}`);
        
        // Clean up test box
        addResult('🗑️ حذف الصندوق التجريبي...');
        await donationBoxesService.deleteDonationBox(boxId);
        addResult('✅ تم حذف الصندوق التجريبي');
      } catch (error) {
        addResult(`❌ فشل في اختبار الإنشاء/الحذف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }

      addResult('🎉 انتهى الاختبار!');
    } catch (error) {
      addResult(`❌ خطأ عام في الاختبار: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      background: 'white', 
      border: '2px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
        🧪 اختبار صناديق التبرع
      </h3>
      
      <button
        onClick={runTest}
        disabled={testing}
        style={{
          background: testing ? '#ccc' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          width: '100%'
        }}
      >
        {testing ? 'جاري الاختبار...' : 'بدء الاختبار'}
      </button>

      {results.length > 0 && (
        <div style={{
          background: '#f5f5f5',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {results.map((result, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestDonationBoxes;