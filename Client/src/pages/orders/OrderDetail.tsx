import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/Orders/orderService'; 
import { Order } from '../../types/Order/order';
import Footer from '../../components/layout/Footer';
import SubNav from '../../components/layout/SubNav';
import NavigationBar from '../../components/layout/Navbar';
import OrderStatusUpdate from '../../components/order/OrderStatusUpdate';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusInfo, setStatusInfo] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(parseInt(orderId!));
      setOrder(data);

      const trackInfo = await orderService.trackOrderStatus(parseInt(orderId!));
      setStatusInfo(trackInfo.statusInfo);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const handleStatusUpdateComplete = () => {
    fetchOrderData();
  };

  const handleDelete = async () => {
    if (!order || !orderId) return;
    
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setDeleteLoading(true);
        await orderService.deleteOrder(parseInt(orderId));
        alert('Order deleted successfully');
        navigate('/orders');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (!order) return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">Order not found</h2>
      <Link to="/orders" className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
        Back to Orders
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="w-full">
        <SubNav/> 
      </div>
      <div className="w-full">
        <NavigationBar/>
      </div>
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 mt-1">Order ID: {order.orderId}</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              to="/orders" 
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Orders
            </Link>
            <button 
              onClick={handleDelete} 
              disabled={deleteLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-400 transition flex items-center"
            >
              {deleteLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Order
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="text-sm text-gray-900">{new Date(order.orderDate!).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{new Date(order.lastUpdated!).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Customer ID</p>
                  <p className="text-sm text-gray-900">{order.userId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Restaurant ID</p>
                  <p className="text-sm text-gray-900">{order.restaurantId}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                  <p className="text-sm text-gray-900">{order.deliveryAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                  <p className="text-sm text-gray-900">{order.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Current Status</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-opacity-10 
                  ${order.status === 'DELIVERED' ? 'bg-green-500 text-green-800' : ''}
                  ${order.status === 'CANCELLED' ? 'bg-red-500 text-red-800' : ''}
                  ${order.status === 'PLACED' ? 'bg-blue-500 text-blue-800' : ''}
                  ${order.status === 'CONFIRMED' ? 'bg-purple-500 text-purple-800' : ''}
                  ${order.status === 'PREPARING' ? 'bg-yellow-500 text-yellow-800' : ''}
                  ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-500 text-orange-800' : ''}">
                  {order.status}
                </div>
              </div>

              <OrderStatusUpdate 
                orderId={order.orderId!} 
                currentStatus={order.status} 
                onStatusUpdate={handleStatusUpdateComplete} 
              />

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Tracking Information</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {statusInfo || 'No tracking information available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu ID</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.menuItemId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Subtotal</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Delivery Fee</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">${order.deliveryFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Tax</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">${order.tax.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-orange-600">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default OrderDetail;