import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ElementaryService from '../components/admin/ElementaryService';
import PreparatoryService from '../components/admin/PreparatoryService';
import SecondaryService from '../components/admin/SecondaryService';
import UniversityService from '../components/admin/UniversityService';
import MissingServe from '../components/admin/MissingService';

type ServiceKey = 'elementary' | 'preparatory' | 'secondary' | 'university' | 'missing';

const ServicesDashboard: React.FC = () => {
    const { language } = useLanguage();
    const [selected, setSelected] = useState<ServiceKey>('elementary');
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const items: { key: ServiceKey; label: string; labelEn: string }[] = [
        { key: 'elementary', label: 'المرحلة الابتدائية', labelEn: 'Elementary' },
        { key: 'preparatory', label: 'المرحلة الاعدادية', labelEn: 'Preparatory' },
        { key: 'secondary', label: 'المرحلة الثانوية', labelEn: 'Secondary' },
        { key: 'university', label: 'خدمة الجامعة', labelEn: 'University' },
        { key: 'missing', label: 'الافتقاد', labelEn: 'Missing' },
    ];

    return (
        <div className="mt-20 min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {language === 'ar' ? 'لوحة خدمات الكنيسة' : 'Services Dashboard'}
                </h1>
            </header>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - styled like AsidePanel */}
                <aside className="col-span-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    {/* Mobile collapse header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 lg:hidden">
                        <h3 className="text-sm font-semibold text-gray-700">{language === 'ar' ? 'الخدمات' : 'Services'}</h3>
                        <button
                            aria-expanded={!collapsed}
                            aria-controls="services-sidebar"
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                        >
                            <span className="sr-only">{collapsed ? (language === 'ar' ? 'عرض' : 'Open') : (language === 'ar' ? 'إغلاق' : 'Close')}</span>
                            {/* simple chevron */}
                            <svg className={`w-4 h-4 transform ${collapsed ? '' : 'rotate-90'}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <nav id="services-sidebar" className={`${collapsed ? 'hidden' : ''} p-4` }>
                        <ul className="space-y-1">
                            {items.map((item) => (
                                <li key={item.key} className="relative">
                                    <button
                                        onClick={() => setSelected(item.key)}
                                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                                            selected === item.key
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                        aria-current={selected === item.key ? 'true' : 'false'}
                                    >
                                        {/* Active accent bar - RTL aware: on the left for LTR, right for RTL */}
                                        <span
                                            aria-hidden
                                            className={`w-1 h-8 rounded ${
                                                selected === item.key ? 'bg-indigo-500' : 'bg-transparent'
                                            } ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                                        />

                                        {/* Icon placeholder */}
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 group-hover:bg-gray-200">
                                            {item.key === 'elementary' && 'E'}
                                            {item.key === 'preparatory' && 'P'}
                                            {item.key === 'secondary' && 'S'}
                                            {item.key === 'university' && 'U'}
                                            {item.key === 'missing' && 'M'}
                                        </span>

                                        <span className="flex-1">{language === 'ar' ? item.label : item.labelEn}</span>

                                        {/* keyboard focus ring */}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="col-span-1 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                        {selected === 'elementary' && (
                            <section>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                                    {language === 'ar' ? 'المرحلة الابتدائية' : 'Elementary Service'}
                                </h2>
                                <ElementaryService />
                            </section>
                        )}
                        {selected === 'preparatory' && (
                            <section>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                                    {language === 'ar' ? 'المرحلة الاعدادية' : 'Preparatory Service'}
                                </h2>
                                <PreparatoryService />
                            </section>
                        )}
                        {selected === 'secondary' && (
                            <section>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                                    {language === 'ar' ? 'المرحلة الثانوية' : 'Secondary Service'}
                                </h2>
                                <SecondaryService />
                            </section>
                        )}
                        {selected === 'university' && (
                            <section>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                                    {language === 'ar' ? 'خدمة الجامعة' : 'University Service'}
                                </h2>
                                <UniversityService />
                            </section>
                        )}
                        {selected === 'missing' && (
                            <section>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                                    {language === 'ar' ? 'الافتقاد' : 'Missing Service'}
                                </h2>
                                <MissingServe />
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ServicesDashboard;