import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/layout/AdminSideBar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Clock, AlertCircle, Menu } from 'lucide-react';

interface Payment {
  id: number;
  userId: string;
  orderId: number;
  totalAmount: number;
  paymentStatus: string;
  paymentDate: string;
}

const PaymentDetails: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle sidebar function
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/v1/payments');
        setPayments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payments');
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative w-full">
          <AdminNavbar />
        </div>
        <div className="flex flex-1 pt-16">
          <div className={`fixed top-16 left-0 bottom-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -ml-64'}`}>
            <AdminSidebar />
          </div>
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative w-full">
          <AdminNavbar />
        </div>
        <div className="flex flex-1 pt-16">
          <div className={`fixed top-16 left-0 bottom-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -ml-64'}`}>
            <AdminSidebar />
          </div>
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
            <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
  const successfulPayments = payments.filter(p => p.paymentStatus === 'SUCCESS').length;
  const failedPayments = payments.filter(p => p.paymentStatus !== 'SUCCESS').length;
  const averageAmount = totalAmount / (payments.length || 1);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full">
        <AdminNavbar />
      </div>
      <div className="flex flex-1 pt-16">
        <div className={`fixed top-16 left-0 bottom-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -ml-64'}`}>
          <AdminSidebar />
        </div>

        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-40 p-2 rounded-full bg-white shadow-md border border-gray-200 lg:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={20} />
        </button>

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 bg-gray-50`}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Management</h1>

            {/* Payment Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Payments</span>
                  <CreditCard className="text-purple-500" size={20} />
                </div>
                <p className="text-2xl font-bold mt-2">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-purple-500">{payments.length} transactions</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Successful Payments</span>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-2xl font-bold mt-2">{successfulPayments}</p>
                <p className="text-sm text-green-500">Completed transactions</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Failed Payments</span>
                  <AlertCircle className="text-red-500" size={20} />
                </div>
                <p className="text-2xl font-bold mt-2">{failedPayments}</p>
                <p className="text-sm text-red-500">Requires attention</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Amount</span>
                  <Clock className="text-blue-500" size={20} />
                </div>
                <p className="text-2xl font-bold mt-2">${averageAmount.toFixed(2)}</p>
                <p className="text-sm text-blue-500">Per transaction</p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <motion.tr 
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{payment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payment.totalAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${payment.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {payment.paymentStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentDetails;