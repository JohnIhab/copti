import React, { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import MessagePreviewDialog from './MessagePreviewDialog';
import { 
  ContactMessage, 
  subscribeToContactMessages,
  markMessageAsAnswered,
  deleteMessage,
  bulkDeleteMessages,
  bulkMarkAsRead,
  bulkMarkAsAnswered
} from '../../services/contactService';

const ContactMessagesManagement: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToContactMessages((updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const openPreview = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedMessage(null);
  };

  const handleReply = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      // Mark as answered
      try {
        if (messageId) {
          await markMessageAsAnswered(messageId);
        }
      } catch (error) {
        console.error('Error marking message as answered:', error);
      }
      
      // Open Gmail with pre-filled email
      const subject = encodeURIComponent(`Re: ${message.subject}`);
      const body = encodeURIComponent(`\n\n---\nOriginal message from ${message.name}:\n${message.message}`);
      window.open(`https://mail.google.com/mail/?view=cm&to=${message.email}&su=${subject}&body=${body}`, '_blank');
    }
    closePreview();
  };

  const handleWhatsApp = async (message: ContactMessage) => {
    // Mark as answered
    try {
      if (message.id) {
        await markMessageAsAnswered(message.id);
      }
    } catch (error) {
      console.error('Error marking message as answered:', error);
    }

    // Extract phone number and format for WhatsApp
    let phoneNumber = message.phone.replace(/\D/g, ''); // Remove all non-digits
    
    // Add country code if not present (assuming Egypt +20)
    if (!phoneNumber.startsWith('20') && phoneNumber.length === 11) {
      phoneNumber = '20' + phoneNumber.substring(1);
    }
    
    const whatsappMessage = encodeURIComponent(
      `Hello ${message.name}, thank you for contacting us regarding "${message.subject}". How can we help you?`
    );
    
    window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(messages.map(m => m.id!).filter(Boolean));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages(prev => [...prev, messageId]);
    } else {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف الرسائل المحددة؟' : 'Are you sure you want to delete selected messages?')) {
      try {
        await bulkDeleteMessages(selectedMessages);
        setSelectedMessages([]);
      } catch (error) {
        console.error('Error deleting messages:', error);
        alert(language === 'ar' ? 'حدث خطأ في حذف الرسائل' : 'Error deleting messages');
      }
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await bulkMarkAsRead(selectedMessages);
      setSelectedMessages([]);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      alert(language === 'ar' ? 'حدث خطأ في تحديث الرسائل' : 'Error updating messages');
    }
  };

  const handleBulkMarkAsAnswered = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await bulkMarkAsAnswered(selectedMessages);
      setSelectedMessages([]);
    } catch (error) {
      console.error('Error marking messages as answered:', error);
      alert(language === 'ar' ? 'حدث خطأ في تحديث الرسائل' : 'Error updating messages');
    }
  };

  const handleDeleteSingle = async (messageId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert(language === 'ar' ? 'حدث خطأ في حذف الرسالة' : 'Error deleting message');
      }
    }
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
      return language === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays} days ago`;
    }
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.isAnswered) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Check className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'تم الرد' : 'Answered'}
        </span>
      );
    } else if (message.isRead) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Eye className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'مقروء' : 'Read'}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <Mail className="w-3 h-3 mr-1" />
          {language === 'ar' ? 'جديد' : 'New'}
        </span>
      );
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    const labels = {
      high: language === 'ar' ? 'عالي' : 'High',
      medium: language === 'ar' ? 'متوسط' : 'Medium',
      low: language === 'ar' ? 'منخفض' : 'Low'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 tab-content">
        <div className="content-header">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'جاري تحميل الرسائل...' : 'Loading messages...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

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
              {messages.length} {language === 'ar' ? 'رسالة' : 'messages'}
            </span>
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
              {messages.filter(m => !m.isRead).length} {language === 'ar' ? 'غير مقروء' : 'unread'}
            </span>
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
              {messages.filter(m => m.isAnswered).length} {language === 'ar' ? 'تم الرد عليها' : 'answered'}
            </span>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMessages.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                {selectedMessages.length} {language === 'ar' ? 'رسالة محددة' : 'messages selected'}
              </span>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  {language === 'ar' ? 'تحديد كمقروء' : 'Mark as Read'}
                </button>
                <button
                  onClick={handleBulkMarkAsAnswered}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {language === 'ar' ? 'تحديد كمجاب عنه' : 'Mark as Answered'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedMessages.length === messages.length && messages.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الموضوع' : 'Subject'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((message) => (
                <tr key={message.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id!)}
                      onChange={(e) => handleSelectMessage(message.id!, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(message)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {message.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {message.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {message.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div>{formatRelativeTime(message.timestamp)}</div>
                    <div className="text-xs">{message.timestamp.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => openPreview(message)}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title={language === 'ar' ? 'معاينة الرسالة' : 'Preview Message'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(message)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title={language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                      >
                        <FaWhatsapp className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => message.id && handleReply(message.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title={language === 'ar' ? 'الرد عبر الإيميل' : 'Reply via Email'}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => message.id && handleDeleteSingle(message.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف الرسالة' : 'Delete Message'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد رسائل' : 'No messages'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لم يتم استلام أي رسائل تواصل بعد' : 'No contact messages have been received yet'}
            </p>
          </div>
        )}
      </div>

      {/* Message Preview Dialog */}
      <MessagePreviewDialog
        isOpen={isPreviewOpen}
        onClose={closePreview}
        message={selectedMessage}
        onReply={handleReply}
      />
    </div>
  );
};

export default ContactMessagesManagement;