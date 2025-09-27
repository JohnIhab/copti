import React from 'react';
import { Church } from 'lucide-react';

const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Church className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400 animate-pulse" />
          <div className="absolute inset-0 animate-ping">
            <Church className="h-16 w-16 mx-auto text-blue-600/20 dark:text-blue-400/20" />
          </div>
        </div>
        <div className="mt-4 flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;