import React, { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import MessagePreviewDialog from './MessagePreviewDialog';

const ContactMessagesManagement: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Mock messages data - in real app, this would come from API/Firebase
  const mockMessages = [
    {
      id: '1',
      name: language === 'ar' ? 'چون ايهاب ابراهيم' : 'John Ihab',
      email: 'ahmed.mohamed@email.com',
      phone: '+20 1234567890',
      subject: language === 'ar' ? 'استفسار عن مواعيد الاجتماعات' : 'Inquiry about meeting schedules',
      message: language === 'ar' 
        ? 'السلام عليكم ورحمة الله وبركاته، أود الاستفسار عن مواعيد اجتماعات الشباب والأنشطة المتاحة في الكنيسة. هل يمكنكم إرسال جدول المواعيد المحدثة؟ وشكراً لكم.'
        : 'Peace be upon you, I would like to inquire about youth meeting schedules and available activities in the church. Can you send me the updated schedule? Thank you.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      priority: 'medium'
    },
    {
      id: '2',
      name: language === 'ar' ? 'مريم يوسف' : 'Mariam Youssef',
      email: 'mariam.youssef@email.com',
      phone: '+20 1098765432',
      subject: language === 'ar' ? 'طلب للمشاركة في الخدمة' : 'Request to join the service',
      message: language === 'ar'
        ? 'تحية طيبة، أرغب في المشاركة في خدمة الأطفال والمساعدة في الأنشطة الكنسية. لدي خبرة في التعامل مع الأطفال وأتطلع للمساهمة في خدمة الرب.'
        : 'Greetings, I would like to participate in children\'s service and help with church activities. I have experience working with children and look forward to contributing to the Lord\'s service.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
      priority: 'high'
    },
    {
      id: '3',
      name: language === 'ar' ? 'بولس منير' : 'Paul Monir',
      email: 'paul.monir@email.com',
      phone: '+20 1555666777',
      subject: language === 'ar' ? 'استفسار عن المعمودية' : 'Baptism inquiry',
      message: language === 'ar'
        ? 'أود الاستفسار عن إجراءات المعمودية والمستندات المطلوبة. متى يمكنني ترتيب موعد للمقابلة؟'
        : 'I would like to inquire about baptism procedures and required documents. When can I arrange an appointment for an interview?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: false,
      priority: 'high'
    },
    {
      id: '4',
      name: language === 'ar' ? 'سارة جرجس' : 'Sarah Gerges',
      email: 'sarah.gerges@email.com',
      phone: '+20 1444555666',
      subject: language === 'ar' ? 'تبرع للكنيسة' : 'Church donation',
      message: language === 'ar'
        ? 'أرغب في التبرع للكنيسة وأود معرفة طرق التبرع المتاحة. هل يمكنني التبرع عبر الإنترنت؟'
        : 'I would like to donate to the church and would like to know the available donation methods. Can I donate online?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
      priority: 'low'
    },
    {
      id: '5',
      name: language === 'ar' ? 'مينا عادل' : 'Mina Adel',
      email: 'mina.adel@email.com',
      phone: '+20 1333444555',
      subject: language === 'ar' ? 'طلب صلاة' : 'Prayer request',
      message: language === 'ar'
        ? 'أرجو الصلاة من أجل والدتي المريضة. تمر بظروف صحية صعبة ونحتاج لصلاتكم ودعمكم الروحي.'
        : 'Please pray for my sick mother. She is going through difficult health conditions and we need your prayers and spiritual support.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: false,
      priority: 'high'
    }
  ];

  const openPreview = (message: any) => {
    setSelectedMessage(message);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedMessage(null);
  };

  const handleReply = (messageId: string) => {
    // Handle reply functionality
    console.log('Reply to message:', messageId);
    closePreview();
  };

  const handleMarkAsRead = (messageId: string) => {
    // Handle mark as read functionality
    console.log('Mark as read:', messageId);
    // In real app, update the message status
  };

  return (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة الرسائل الواردة من صفحة التواصل' : 'Manage incoming messages from contact page'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              12 {language === 'ar' ? 'رسالة جديدة' : 'new messages'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockMessages.map((message) => (
          <div key={message.id} className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {message.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    message.isRead 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {message.isRead 
                      ? (language === 'ar' ? 'مقروء' : 'Read')
                      : (language === 'ar' ? 'جديد' : 'New')
                    }
                  </span>
                  {message.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                        : message.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                    }`}>
                      {language === 'ar' 
                        ? message.priority === 'high' ? 'عالية' : message.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                        : message.priority === 'high' ? 'High' : message.priority === 'medium' ? 'Medium' : 'Low'
                      }
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>{message.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>{message.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>
                      {new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'en', { numeric: 'auto' })
                        .format(Math.floor((message.timestamp.getTime() - Date.now()) / (1000 * 60 * 60)), 'hour')}
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {message.subject}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {message.message}
                </p>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={() => openPreview(message)}
                  className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title={language === 'ar' ? 'معاينة الرسالة' : 'Preview Message'}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'مرسل في:' : 'Sent at:'} {message.timestamp.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={() => handleReply(message.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  {language === 'ar' ? 'الرد' : 'Reply'}
                </button>
                {!message.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-medium"
                  >
                    {language === 'ar' ? 'وضع علامة كمقروء' : 'Mark as Read'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Preview Dialog */}
      <MessagePreviewDialog
        isOpen={isPreviewOpen}
        onClose={closePreview}
        message={selectedMessage}
        onReply={handleReply}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default ContactMessagesManagement;