import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/Orders/orderService';
import { PaginatedOrdersResponse } from '../../types/Order/order';
import { Link } from 'react-router-dom';
import AdminSidebar from "../../components/layout/AdminSideBar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const OrderList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<PaginatedOrdersResponse | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('orderDate');
  const [direction, setDirection] = useState<string>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    PLACED: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELLED: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setSearchError(null);
      const data = await orderService.getOrders(page, size, sortBy, direction);
      setOrderData(data);
      
      // Calculate status counts
      if (data.orders) {
        const counts = data.orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setStatusCounts(prev => ({ ...prev, ...counts }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSearchError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchOrders = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      setSearchError(null);
      const data = await orderService.searchOrders(searchTerm, page, size, sortBy, direction);
      setOrderData(data);

      if (data.orders.length === 0) {
        setSearchError(`No results found for "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      setSearchError('Failed to search orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSearching && searchTerm.trim()) {
      searchOrders();
    } else {
      fetchOrders();
    }
    // eslint-disable-next-line
  }, [page, size, sortBy, direction]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setDirection('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    searchOrders();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setIsSearching(false);
      setSearchError(null);
      fetchOrders();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchError(null);
    fetchOrders();
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );

    if (searchError) {
      return (
        <div className="text-center mt-10 p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500 font-medium">{searchError}</p>
          <button
            onClick={clearSearch}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (!orderData || orderData.orders.length === 0) {
      return (
        <div className="text-center mt-10 p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 font-medium">No orders found.</p>
        </div>
      );
    }

    return (
      <>
        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 max-w-7xl mx-auto px-4">
          {/* Total Orders */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orderData.totalItems}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Out for Delivery */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Out for Delivery</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.OUT_FOR_DELIVERY || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.CONFIRMED || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Preparing */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Preparing</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.PREPARING || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.DELIVERED || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Cancelled */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.CANCELLED || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search indicator */}
        {isSearching && (
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md shadow-sm border border-blue-100">
              <span className="text-blue-800 font-medium">
                Showing results for: <strong className="font-semibold">"{searchTerm}"</strong>
              </span>
              <button
                onClick={clearSearch}
                className="text-blue-700 hover:text-blue-900 font-medium transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto max-w-7xl mx-auto w-full px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort('orderId')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortBy === 'orderId' && (
                        <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'orderDate' && (
                        <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortBy === 'totalAmount' && (
                        <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderData.orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{order.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                          ${order.status === 'PLACED' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' : ''}
                          ${order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' : ''}
                        `}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/orders/${order.orderId}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          View
                        </Link>
                        <Link
                          to={`/orders/${order.orderId}/edit`}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this order?')) {
                              await orderService.deleteOrder(order.orderId!);
                              fetchOrders();
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 mb-8 max-w-7xl mx-auto px-4">
          <div className="text-black font-medium">
            Showing page {orderData.currentPage + 1} of {orderData.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 ${
                page === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= orderData.totalPages - 1}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 ${
                page >= orderData.totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        
        <div className="container mx-auto py-8 bg-white mt-16">
          <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-orange-500">
              <span className="border-b-4 border-orange-500 pb-1">Order Management</span>
            </h1>
            <div className="flex">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Search orders..."
                  className="border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-64 shadow-sm text-black"
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-black px-6 py-2 rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-300 font-medium shadow-sm"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrderList;