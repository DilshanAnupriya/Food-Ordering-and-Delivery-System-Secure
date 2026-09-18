import React, { useState } from 'react';
import { orderService } from '../../services/Orders/orderService';

// Import or define OrderStatus enum
export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

interface OrderStatusUpdateProps {
  orderId: number;
  currentStatus: string; // Changed from OrderStatus to string to handle various input formats
  onStatusUpdate: () => void;
}

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Normalize the currentStatus to ensure it's a valid OrderStatus enum value
  const normalizedStatus = Object.values(OrderStatus).includes(currentStatus as OrderStatus) 
    ? currentStatus as OrderStatus 
    : OrderStatus.PLACED;

  // Define allowed status transitions based on backend logic
  const getNextAllowedStatuses = (status: OrderStatus): OrderStatus[] => {
    switch(status) {
      case OrderStatus.PLACED:
        return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.PREPARING, OrderStatus.CANCELLED];
      case OrderStatus.PREPARING:
        return [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED];
      case OrderStatus.OUT_FOR_DELIVERY:
        return [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
      case OrderStatus.DELIVERED:
      case OrderStatus.CANCELLED:
        return []; // Terminal states - no further transitions
      default:
        return [];
    }
  };
  
  const allowedNextStatuses = getNextAllowedStatuses(normalizedStatus);
  
  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setLoading(true);
      setError(null);
      await orderService.updateOrderStatus(orderId, newStatus);
      onStatusUpdate(); // Refresh parent component data
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Don't render status update options for terminal states
  if (allowedNextStatuses.length === 0) {
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          {normalizedStatus === OrderStatus.DELIVERED 
            ? "This order has been delivered and cannot be updated further." 
            : "This order has been cancelled and cannot be updated further."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-2">
      <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {allowedNextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={loading}
            className={`px-3 py-1 text-xs rounded-full font-medium transition
              ${status === OrderStatus.CANCELLED
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : status === OrderStatus.DELIVERED
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {status === OrderStatus.CANCELLED 
              ? 'Cancel Order' 
              : `Move to ${status.replace('_', ' ')}`}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-1 text-sm text-blue-600">Updating order status...</p>}
    </div>
  );
};

export default OrderStatusUpdate;