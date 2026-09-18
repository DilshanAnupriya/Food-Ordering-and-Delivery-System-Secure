import React from 'react';

interface Order {
  id: string;
  orderId?: string; // Adding an optional orderId field from database
  status: string;
  destination: string;
  deliveryDate?: string;
}

interface CompletedDeliveryCardProps {
  order: Order;
}

const CompletedDeliveryCard: React.FC<CompletedDeliveryCardProps> = ({ order }) => {
  // Format date nicely or use placeholder if missing
  const formattedDate = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date not available';

  // Use orderId from database if available, otherwise fallback to id
  const displayOrderId = order.orderId || order.id;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-md overflow-hidden flex-shrink-0 w-64 transform hover:scale-105 transition-transform duration-300">
      <div className="bg-yellow-500 h-2 w-full"></div>
      <div className="p-4">
        <div className="mb-2">
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
            {order.status}
          </span>
        </div>
        <p className="font-bold text-gray-800 mb-2 truncate">{displayOrderId}</p>
        
        {/* Delivery Date Section */}
        <div className="flex items-center mb-2 border-b border-gray-200 pb-2">
          <div className="flex-shrink-0 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2">
            <span className="text-xs text-gray-500">Delivered on</span>
            <p className="text-xs font-medium text-gray-800">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedDeliveryCard;