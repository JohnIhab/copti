
import React, { useEffect, useState } from 'react';
import { tripPaymentsService, TripPayment } from '../../services/tripPaymentsService';
import { tripsService, Trip } from '../../services/tripsService';
import { Eye, Filter, Users, Calendar, DollarSign } from 'lucide-react';

const PaymentDetailsModal: React.FC<{
    payment: TripPayment | null;
    trips: Trip[];
    isOpen: boolean;
    onClose: () => void;
}> = ({ payment, trips, isOpen, onClose }) => {
    if (!isOpen || !payment) return null;
    const getTripName = (id: string) => {
        const t = trips.find(trip => trip.id === id);
        return t ? t.title : id;
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center mx-2 sm:mx-0 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full z-10"
                    aria-label="إغلاق"
                >
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="p-4 sm:p-6 w-full flex flex-col items-center justify-center">
                    <div className="mb-6 w-full">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center w-full">تفاصيل الحجز</h2>
                    </div>
                    <div className="space-y-6 w-full flex flex-col items-center justify-center text-center">
                        <div className="flex flex-col items-center space-y-2 dark:text-white">
                            <Users className="h-5 w-5 text-blue-500 mx-auto" />
                            <span className="font-semibold">{payment.name}</span>
                            <span className="text-gray-500">{payment.phone}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 dark:text-white">
                            <DollarSign className="h-5 w-5 text-green-600 mx-auto" />
                            <span className="font-bold text-green-700">{payment.total} جنيه</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2 dark:text-white">
                            <h3 className="font-semibold mb-2 ">الرحلات المحجوزة:</h3>
                            <ul className="list-disc pl-6 rtl:pl-0 rtl:pr-6 inline-block text-center">
                                {payment.tripIds.map(id => (
                                    <li key={id}>{getTripName(id)}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col items-center space-y-2 ">
                            <Calendar className="h-5 w-5 text-gray-500 mx-auto" />
                            <span className="text-gray-700 dark:text-white">{payment.createdAt instanceof Date ? payment.createdAt.toLocaleString('ar-EG') : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminTripsPayments: React.FC = () => {
    const [payments, setPayments] = useState<TripPayment[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<TripPayment | null>(null);
    const [filterTrip, setFilterTrip] = useState('all');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [paymentsData, tripsData] = await Promise.all([
                    tripPaymentsService.getPayments(),
                    tripsService.getTrips()
                ]);
                setPayments(paymentsData);
                setTrips(tripsData);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const getTripName = (id: string) => {
        const t = trips.find(trip => trip.id === id);
        return t ? t.title : id;
    };


        const filteredPayments = filterTrip === 'all'
            ? payments
            : payments.filter(p => p.tripIds.includes(filterTrip));

        // Calculate total donors and total amount
        const totalDonors = filteredPayments.length;
        const totalAmount = filteredPayments.reduce((sum, p) => sum + (typeof p.total === 'number' ? p.total : 0), 0);

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 pb-0">
                    <h1 className="text-3xl font-bold dark:text-white">مدفوعات الرحلات</h1>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <select
                            value={filterTrip}
                            onChange={e => setFilterTrip(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">جميع الرحلات</option>
                            {trips.map(trip => (
                                <option key={trip.id} value={trip.id}>{trip.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                        {/* Totals summary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المتبرعين</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalDonors}</p>
                                </div>
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 00-8 0v3m12 0a4 4 0 01-8 0m8 0v3a4 4 0 01-8 0V7m8 0a4 4 0 00-8 0" /></svg>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبلغ</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalAmount.toLocaleString()} جنيه</p>
                                </div>
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-2.21 0-4-1.79-4-4h2a2 2 0 004 0h2c0 2.21-1.79 4-4 4zm0-16C6.48 0 2 4.48 2 10c0 5.52 4.48 10 10 10s10-4.48 10-10C22 4.48 17.52 0 12 0z" /></svg>
                            </div>
                        </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">لا توجد مدفوعات</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: stacked cards */}
                        <div className="sm:hidden space-y-4 p-4">
                            {filteredPayments.map(payment => (
                                <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{payment.name}</p>
                                            <p className="text-sm text-gray-500" dir="ltr">{payment.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{payment.total} جنيه</p>
                                            <p className="text-xs text-gray-500">{payment.createdAt instanceof Date ? payment.createdAt.toLocaleString('ar-EG') : ''}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <h4 className="text-sm font-semibold mb-1">الرحلات</h4>
                                        <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5">
                                            {payment.tripIds.map(id => <li key={id} className="text-sm">{getTripName(id)}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <button
                                            onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                        >
                                            عرض
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop/table for sm and up */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الاسم</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">رقم الهاتف</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الرحلات</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجمالي</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">تاريخ الحجز</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-center">
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white text-center">{payment.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-center" dir="ltr">{payment.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center dark:text-white">
                                            <ul className="list-none pl-4 rtl:pl-0 rtl:pr-4 inline-block text-center">
                                                {payment.tripIds.map(id => <li key={id}>{getTripName(id)}</li>)}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 text-center">{payment.total} جنيه</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white text-center">{payment.createdAt instanceof Date ? payment.createdAt.toLocaleString('ar-EG') : ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <button
                                                onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>عرض</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </>
                )}
            </div>
            <PaymentDetailsModal
                payment={selectedPayment}
                trips={trips}
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedPayment(null); }}
            />
        </div>
    );
};

export default AdminTripsPayments;
