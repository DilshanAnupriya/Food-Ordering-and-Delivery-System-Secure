import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/Orders/orderService';
import NavigationBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SubNav from '../../components/layout/SubNav';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../services/auth/authContext';
import NavV2 from "../../components/layout/NavV2.tsx";

interface OrderStatus {
  statusInfo: string;
  estimatedDelivery?: string;
  lastUpdated?: string;
  orderDetails?: {
    items: Array<{ name: string, quantity: number }>;
    total: number;
    restaurant: string;
  };
  deliveryAddress?: string;
  trackingHistory?: Array<{ status: string, timestamp: string }>;
  orderId?: string;
}

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [trackingInfo, setTrackingInfo] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [userOrders, setUserOrders] = useState<Array<{ orderId: string, date?: string, totalAmount?: number }>>([]);
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserOrders = () => {
      const orderDetails = sessionStorage.getItem('orderDetail');
      if (orderDetails && user?.userId) {
        try {
          const orders = JSON.parse(orderDetails);
          const filteredOrders = orders.filter((o: any) => o.userId === user.userId);
          setUserOrders(filteredOrders);
        } catch (e) {
          setUserOrders([]);
        }
      } else {
        setUserOrders([]);
      }
    };
    fetchUserOrders();
  }, [user]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    try {
      setLoading(true);
      setError('');
      const data = await orderService.trackOrderStatus(parseInt(orderId));
      const enhancedData: OrderStatus = {
        statusInfo: data.statusInfo,
        estimatedDelivery: data.statusInfo.includes('DELIVERED') ? 'Delivered' : 'Estimated in 25-35 minutes',
        lastUpdated: new Date().toLocaleTimeString(),
        orderDetails: {
          items: [
            { name: 'Margherita Pizza', quantity: 1 },
            { name: 'Caesar Salad', quantity: 1 },
            { name: 'Garlic Bread', quantity: 2 }
          ],
          total: 32.50,
          restaurant: 'Pizza Palace'
        },
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        trackingHistory: [
          { status: 'Order Placed', timestamp: '12:30 PM' },
          { status: 'Confirmed by Restaurant', timestamp: '12:35 PM' },
          { status: 'Preparation Started', timestamp: '12:45 PM' },
          { status: data.statusInfo, timestamp: new Date().toLocaleTimeString() }
        ],
        orderId: orderId
      };
      setTrackingInfo(enhancedData);
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Failed to retrieve tracking information. Please check the order ID and try again.');
      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUserOrder = (id: string) => {
    setOrderId(id);
    const autoSubmitOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await orderService.trackOrderStatus(parseInt(id));
        const enhancedData: OrderStatus = {
          statusInfo: data.statusInfo,
          estimatedDelivery: data.statusInfo.includes('DELIVERED') ? 'Delivered' : 'Estimated in 25-35 minutes',
          lastUpdated: new Date().toLocaleTimeString(),
          orderDetails: {
            items: [
              { name: 'Margherita Pizza', quantity: 1 },
              { name: 'Caesar Salad', quantity: 1 },
              { name: 'Garlic Bread', quantity: 2 }
            ],
            total: 32.50,
            restaurant: 'Pizza Palace'
          },
          deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
          trackingHistory: [
            { status: 'Order Placed', timestamp: '12:30 PM' },
            { status: 'Confirmed by Restaurant', timestamp: '12:35 PM' },
            { status: 'Preparation Started', timestamp: '12:45 PM' },
            { status: data.statusInfo, timestamp: new Date().toLocaleTimeString() }
          ],
          orderId: id
        };
        setTrackingInfo(enhancedData);
      } catch (error) {
        console.error('Error tracking order:', error);
        setError('Failed to retrieve tracking information. Please check the order ID and try again.');
        setTrackingInfo(null);
      } finally {
        setLoading(false);
      }
    };
    autoSubmitOrder();
  };

  const handleNavigateToTracking = () => {
    if (trackingInfo) {
      const orderDetails = {
        orderId: trackingInfo.orderId
      };
      sessionStorage.setItem('orderDetails', JSON.stringify(orderDetails));
      navigate('/customer-tracking');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="w-full">
        <NavV2 />
      </div>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg overflow-hidden mb-10">
            <div className="px-8 py-12 text-center">
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                Order Tracking
              </h1>
              <p className="mt-3 text-xl text-orange-100">
                Check the status of your premium dining experience
              </p>
            </div>
          </div>

          {/* Tracking Form */}
          <div className="bg-white rounded-xl border-1 border-gray-300  overflow-hidden mb-10">
            <div className="p-8">
              <form onSubmit={handleTrack} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter Order ID"
                    className="flex-grow p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-sm bg-white text-gray-800 placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center font-medium shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tracking...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Track Order
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {userOrders.length > 0 && !trackingInfo && (
                <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Recent Orders</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {userOrders.map((order) => (
                      <button
                        key={order.orderId}
                        onClick={() => handleSelectUserOrder(order.orderId)}
                        className="bg-white text-gray-800 px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium flex items-center shadow-sm"
                      >
                        <svg className="h-4 w-4 mr-2 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Order {order.orderId}
                        {order.totalAmount && <span className="ml-2 text-gray-500">(${order.totalAmount.toFixed(2)})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {trackingInfo && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 text-gray-700 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order {orderId}
                    </h2>
                  </div>

                  {/* Status Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center 
                          ${trackingInfo.statusInfo.includes('DELIVERED') ? 'bg-green-100 text-green-800' : 
                            trackingInfo.statusInfo.includes('CANCELLED') ? 'bg-red-100 text-red-800' : 
                            'bg-orange-100 text-orange-800'}`}>
                          {trackingInfo.statusInfo.includes('DELIVERED') ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : trackingInfo.statusInfo.includes('CANCELLED') ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Status</h3>
                          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className={`text-lg font-medium ${
                                trackingInfo.statusInfo.includes('DELIVERED') ? 'text-green-600' : 
                                trackingInfo.statusInfo.includes('CANCELLED') ? 'text-red-600' : 
                                'text-orange-600'
                              }`}>
                                {trackingInfo.statusInfo.split('\n')[1]?.replace('Status: ', '') || trackingInfo.statusInfo}
                              </span>
                              <span className="text-sm text-gray-500">
                                {trackingInfo.lastUpdated}
                              </span>
                            </div>
                            {trackingInfo.statusInfo.includes('Delivery Location:') && (
                              <div className="mt-2 text-sm text-gray-600">
                                {trackingInfo.statusInfo.split('\n').find(line => line.startsWith('Delivery Location:'))}
                              </div>
                            )}
                            <div className="mt-3 text-sm text-gray-700">
                              {trackingInfo.statusInfo.split('\n').find(line => 
                                !line.startsWith('Order') && 
                                !line.startsWith('Status:') && 
                                !line.startsWith('Last Updated:') && 
                                !line.startsWith('Delivery Location:')
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showDetailedView && (
                    <div className="mt-6 space-y-6 animate-fadeIn">
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-5 text-lg">Order Progress</h4>
                        <div className="space-y-4">
                          {trackingInfo.trackingHistory?.map((step, index) => (
                            <div key={index} className="flex items-start">
                              <div className={`flex-shrink-0 h-6 w-6 rounded-full ${index === trackingInfo.trackingHistory!.length - 1 ? 'bg-gray-900' : 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold`}>
                                {index + 1}
                              </div>
                              <div className="ml-4">
                                <p className="font-medium text-gray-900">{step.status}</p>
                                <p className="text-sm text-gray-600 mt-1">{step.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {trackingInfo.orderDetails && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-4 text-lg">Order Details</h4>
                          <p className="text-gray-700 mb-4">From: <span className="font-medium">{trackingInfo.orderDetails.restaurant}</span></p>
                          <div className="space-y-3">
                            {trackingInfo.orderDetails.items.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                <span className="text-gray-600">${(item.quantity * 10.83).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                              <span>Total</span>
                              <span>${trackingInfo.orderDetails.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {trackingInfo.deliveryAddress && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">Delivery Address</h4>
                          <p className="text-gray-700">{trackingInfo.deliveryAddress}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <button
                      className="text-orange-500 hover:text-gray-900 font-medium flex items-center bg-gray-50 px-5 py-2.5 rounded-md transition-colors hover:bg-gray-100 border border-gray-200 shadow-sm"
                      onClick={() => navigate('/')}
                    >
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Home
                    </button>
                    <button
                      className="text-white bg-orange-500 hover:bg-orange-600 font-medium flex items-center px-5 py-2.5 rounded-md transition-colors shadow-md"
                      onClick={handleNavigateToTracking}
                    >
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Track Your Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-xl  border-1 border-gray-300 overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Need help with your order?</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:support@premiumrestaurants.com" className="font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@premiumrestaurants.com
                </a>
                <a href="tel:+1234567890" className="font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default OrderTracking;