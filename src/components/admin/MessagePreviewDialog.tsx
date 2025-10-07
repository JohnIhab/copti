import React from 'react';
import { X, Mail, Phone, Clock, Calendar, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface MessagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onReply?: (messageId: string) => void;
}

const MessagePreviewDialog: React.FC<MessagePreviewDialogProps> = ({
  isOpen,
  onClose,
  message,
  onReply
}) => {
  const { language } = useLanguage();

  if (!isOpen || !message) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'تفاصيل الرسالة' : 'Message Details'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'عرض الرسالة كاملة' : 'View full message'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Message Status and Priority */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {message.priority && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                  {language === 'ar' 
                    ? message.priority === 'high' ? 'عالية' : message.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                    : message.priority === 'high' ? 'High' : message.priority === 'medium' ? 'Medium' : 'Low'
                  } {language === 'ar' ? 'الأولوية' : 'Priority'}
                </span>
              )}
            </div>
          </div>

          {/* Sender Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'معلومات المرسل' : 'Sender Information'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{message.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{message.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{message.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(message.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Subject */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'الموضوع' : 'Subject'}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              {message.subject}
            </p>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'محتوى الرسالة' : 'Message Content'}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              {language === 'ar' ? 'تم الاستلام:' : 'Received:'} {formatDate(message.timestamp)}
            </span>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {onReply && message.id && (
              <button
                onClick={() => onReply(message.id!)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Mail className="h-4 w-4" />
                <span>{language === 'ar' ? 'الرد على الرسالة' : 'Reply to Message'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePreviewDialog;