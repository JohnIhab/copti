import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ElementaryService from '../components/admin/ElementaryService';
import PreparatoryService from '../components/admin/PreparatoryService';
import SecondaryService from '../components/admin/SecondaryService';
import UniversityService from '../components/admin/UniversityService';
import MissingServe from '../components/admin/MissingService';
import { Helmet } from 'react-helmet';

type ServiceKey = 'elementary' | 'preparatory' | 'secondary' | 'university' | 'missing';

const ServicesDashboard: React.FC = () => {
    const { language } = useLanguage();
    const { isDark } = useTheme();
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
        <>
            <Helmet>
                <title>{language === 'ar' ? 'لوحة خدمات الكنيسة' : 'Services Dashboard'} - كنيسة الأنبا رويس بكفر فرج</title>
                <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
                <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
                <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
            </Helmet>
            <div
                className={
                    `min-h-screen p-4 sm:p-6 lg:p-8 ` +
                    (isDark ? 'bg-gray-900' : 'bg-gray-100')
                }
                dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <header className="mb-6 pt-20">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                        {language === 'ar' ? 'لوحة خدمات الكنيسة' : 'Services Dashboard'}
                    </h1>
                </header>

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - styled like AsidePanel */}
                    <aside className={`col-span-1 rounded-lg shadow-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {/* Mobile collapse header */}
                        <div className={`flex items-center justify-between p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} lg:hidden`}>
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

                        <nav id="services-sidebar" className={`${collapsed ? 'hidden' : ''} p-4`}>
                            <ul className="space-y-1">
                                {items.map((item) => (
                                    <li key={item.key} className="relative">
                                        <button
                                            onClick={() => setSelected(item.key)}
                                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors group ` +
                                                (selected === item.key
                                                    ? (isDark ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white')
                                                    : (isDark ? 'bg-transparent text-gray-200 hover:bg-gray-700 hover:text-white' : 'bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'))
                                            }
                                            aria-current={selected === item.key ? 'true' : 'false'}
                                        >
                                            {/* Active accent bar - RTL aware: on the left for LTR, right for RTL */}
                                            <span
                                                aria-hidden
                                                className={`w-1 h-8 rounded ${selected === item.key ? 'bg-indigo-500' : 'bg-transparent'
                                                    } ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
                                            />

                                            {/* Icon placeholder */}
                                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-gray-700 text-gray-200 group-hover:bg-gray-600' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
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
                        <div className={`rounded-lg shadow-lg p-4 sm:p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            {selected === 'elementary' && (
                                <section>
                                    <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {language === 'ar' ? 'المرحلة الابتدائية' : 'Elementary Service'}
                                    </h2>
                                    <ElementaryService />
                                </section>
                            )}
                            {selected === 'preparatory' && (
                                <section>
                                    <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {language === 'ar' ? 'المرحلة الاعدادية' : 'Preparatory Service'}
                                    </h2>
                                    <PreparatoryService />
                                </section>
                            )}
                            {selected === 'secondary' && (
                                <section>
                                    <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {language === 'ar' ? 'المرحلة الثانوية' : 'Secondary Service'}
                                    </h2>
                                    <SecondaryService />
                                </section>
                            )}
                            {selected === 'university' && (
                                <section>
                                    <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {language === 'ar' ? 'خدمة الجامعة' : 'University Service'}
                                    </h2>
                                    <UniversityService />
                                </section>
                            )}
                            {selected === 'missing' && (
                                <section>
                                    <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {language === 'ar' ? 'الافتقاد' : 'Missing Service'}
                                    </h2>
                                    <MissingServe />
                                </section>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default ServicesDashboard;