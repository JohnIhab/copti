import React from 'react';
import { Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UnderDevelopmentProps {
  title?: string;
  titleEn?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ 
  title, 
  titleEn, 
  icon: Icon = Settings 
}) => {
  const { language } = useLanguage();

  return (
    <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 tab-content">
      <div className="text-center py-12">
        <Icon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? title : titleEn}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {language === 'ar' ? 'هذا القسم قيد التطوير' : 'This section is under development'}
        </p>
      </div>
    </div>
  );
};

export default UnderDevelopment;