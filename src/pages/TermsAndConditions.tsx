import React from 'react';

const TermsAndConditions: React.FC = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-20 mb-10 border border-gray-200 dark:border-gray-800" dir="rtl">
        <h1 className="text-3xl md:text-4xl font-bold text-red-700 dark:text-red-400 mb-6 text-right">الشروط والأحكام</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">مرحبًا بك في كنيسة السيدة العذراء مريم والأنبا رويس باستخدامك لموقعنا، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.</p>
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">١. قبول الشروط</h2>
                <p className="text-gray-700 dark:text-gray-300">باستخدامك لموقع كنيسة السيدة العذراء مريم والأنبا رويس، فإنك تقر بأنك قرأت وفهمت وتوافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام الموقع.</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">٢. استخدام المحتوى</h2>
                <p className="text-gray-700 dark:text-gray-300">جميع المحتويات المقدمة على كنيسة السيدة العذراء مريم والأنبا رويس هي لأغراض إعلامية فقط. لا يجوز لك إعادة إنتاج أو توزيع أو تعديل أي محتوى دون إذن كتابي مسبق منا.</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">٣. سلوك المستخدم</h2>
                <p className="text-gray-700 dark:text-gray-300">تتعهد بعدم استخدام كنيسة السيدة العذراء مريم والأنبا رويس لأي غرض غير قانوني أو بأي طريقة قد تضر بالموقع أو مستخدميه.</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">٤. سياسة الخصوصية</h2>
                <p className="text-gray-700 dark:text-gray-300">خصوصيتك مهمة بالنسبة لنا. يرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام وحماية معلوماتك.</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">٥. التغييرات على الشروط</h2>
                <p className="text-gray-700 dark:text-gray-300">نحتفظ بالحق في تحديث هذه الشروط والأحكام في أي وقت. سيتم نشر التغييرات على هذه الصفحة.</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-2">٦. اتصل بنا</h2>
                <p className="text-gray-700 dark:text-gray-300">إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا عبر الموقع.</p>
            </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-8 text-sm">آخر تحديث: ٢٠ أكتوبر ٢٠٢٥</p>
    </div>
);

export default TermsAndConditions;
