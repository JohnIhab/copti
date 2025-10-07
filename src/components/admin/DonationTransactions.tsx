import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, DollarSign, User, Phone, Calendar, Filter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { donationsService, type Donation } from '../../services/donationsService';

interface DonationDetailsModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (donationId: string, status: Donation['status']) => void;
}

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({ 
  donation, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const { language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !donation) return null;

  const handleStatusUpdate = async (newStatus: Donation['status']) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(donation.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: language === 'ar' ? 'في الانتظار' : 'Pending', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      completed: { 
        label: language === 'ar' ? 'مكتمل' : 'Completed', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: language === 'ar' ? 'ملغي' : 'Cancelled', 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle 
      }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const statusInfo = getStatusBadge(donation.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تفاصيل التبرع' : 'Donation Details'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isUpdating}
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Donation Info */}
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" />
                {statusInfo.label}
              </span>
            </div>

            {/* Donor Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'ar' ? 'بيانات المتبرع' : 'Donor Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">{donation.donorName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white" dir="ltr">{donation.donorPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'ar' ? 'بيانات التبرع' : 'Donation Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'نوع التبرع' : 'Donation Type'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {language === 'ar' ? donation.donationTypeTitle : donation.donationTypeTitleEn}
                  </p>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'المبلغ' : 'Amount'}
                    </p>
                    <p className="font-bold text-green-600 text-lg">{donation.amount} جنيه</p>
                  </div>
                </div>
              </div>
              
              {donation.paymentMethod && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {donation.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 
                     donation.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                     donation.paymentMethod === 'cash' ? 'نقدي' : 'أخرى'}
                  </p>
                </div>
              )}

              {donation.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{donation.notes}</p>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'ar' ? 'التواريخ' : 'Timestamps'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                    </span>
                    <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(donation.createdAt)}
                    </span>
                  </div>
                </div>
                
                {donation.completedAt && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? 'تاريخ الإكمال:' : 'Completed:'}
                      </span>
                      <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(donation.completedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {donation.status === 'pending' && (
            <div className="flex space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg
                        font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <CheckCircle className="h-5 w-5" />
                <span>{isUpdating ? 'جاري المعالجة...' : (language === 'ar' ? 'تأكيد التبرع' : 'Confirm Donation')}</span>
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg
                        font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <XCircle className="h-5 w-5" />
                <span>{language === 'ar' ? 'إلغاء التبرع' : 'Cancel Donation'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DonationTransactions: React.FC = () => {
  const { language } = useLanguage();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Donation['status']>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
    completedAmount: 0
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const [donationsData, statsData] = await Promise.all([
        donationsService.getDonations(),
        donationsService.getDonationStats()
      ]);
      setDonations(donationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading donations:', error);
      toast.error(language === 'ar' ? 'خطأ في تحميل التبرعات' : 'Error loading donations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (donationId: string, newStatus: Donation['status']) => {
    try {
      await donationsService.updateDonationStatus(donationId, newStatus);
      await loadDonations(); // Reload data
      toast.success(
        language === 'ar' 
          ? 'تم تحديث حالة التبرع بنجاح' 
          : 'Donation status updated successfully'
      );
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error(
        language === 'ar' 
          ? 'خطأ في تحديث حالة التبرع' 
          : 'Error updating donation status'
      );
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: language === 'ar' ? 'في الانتظار' : 'Pending', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      completed: { 
        label: language === 'ar' ? 'مكتمل' : 'Completed', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: language === 'ar' ? 'ملغي' : 'Cancelled', 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle 
      }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredDonations = statusFilter === 'all' 
    ? donations 
    : donations.filter(donation => donation.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'إجمالي التبرعات' : 'Total Donations'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'في الانتظار' : 'Pending'}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'مكتملة' : 'Completed'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'المبلغ المكتمل' : 'Completed Amount'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.completedAmount.toLocaleString()} جنيه</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filter and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'معاملات التبرعات' : 'Donation Transactions'}
        </h2>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Donation['status'])}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
            <option value="completed">{language === 'ar' ? 'مكتملة' : 'Completed'}</option>
            <option value="cancelled">{language === 'ar' ? 'ملغية' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد تبرعات' : 'No donations found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'المتبرع' : 'Donor'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'نوع التبرع' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDonations.map((donation) => {
                  const statusInfo = getStatusBadge(donation.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {donation.donorName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">
                            {donation.donorPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {language === 'ar' ? donation.donationTypeTitle : donation.donationTypeTitleEn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {donation.amount.toLocaleString()} جنيه
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDonation(donation);
                            setShowModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300
                                   flex items-center space-x-1 rtl:space-x-reverse"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <DonationDetailsModal
        donation={selectedDonation}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDonation(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default DonationTransactions;