import axios from 'axios';
import { Order, OrderStatus, PaginatedOrdersResponse } from '../../types/Order/order';

const API_BASE_URL = 'http://localhost:8082/api/v1/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const orderService = {
  // Get paginated orders
  getOrders: async (page = 0, size = 10, sortBy = 'orderDate', direction = 'desc') => {
    try {
      const response = await api.get<PaginatedOrdersResponse>(
        '/orders', {
          params: {
            page,
            size,
            sortBy,
            direction
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get orders by user ID
  getOrdersByUserId: async (userId: number) => {
    try {
      const response = await api.get<Order[]>(`/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    try {
      const response = await api.get<Order>(`${API_BASE_URL}orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (order: Order) => {
    try {
      // Format all numeric values with 2 decimal places and ensure proper typing
      const orderData = {
        ...order,
        userId: String(order.userId),
        restaurantId: String(order.restaurantId),
        subtotal: Number(Number(order.subtotal).toFixed(2)),
        deliveryFee: Number(Number(order.deliveryFee).toFixed(2)),
        tax: Number(Number(order.tax).toFixed(2)),
        totalAmount: Number(Number(order.totalAmount).toFixed(2)),
        latitude: order.latitude !== null ? Number(Number(order.latitude).toFixed(6)) : null,
        longitude: order.longitude !== null ? Number(Number(order.longitude).toFixed(6)) : null,
        orderItems: order.orderItems.map(item => ({
          ...item,
          menuItemId: String(item.menuItemId),
          quantity: Number(item.quantity),
          unitPrice: Number(Number(item.unitPrice).toFixed(2)),
          totalPrice: Number(Number(item.totalPrice).toFixed(2))
        }))
      };

      const response = await api.post<Order>('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order
  updateOrder: async (orderId: number, order: Order) => {
    try {
      const response = await api.put<Order>(`/orders/${orderId}`, order);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: OrderStatus) => {
    try {
      const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  },

  // Track order status
  trackOrderStatus: async (orderId: number) => {
    try {
      const response = await api.get<{ statusInfo: string }>(`/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error(`Error tracking order ${orderId}:`, error);
      throw error;
    }
  },

  // Fixed search orders function
  searchOrders: async (searchTerm: string, page = 0, size = 10, sortBy = 'orderDate', direction = 'desc'): Promise<PaginatedOrdersResponse> => {
    try {
      const isNumeric = !isNaN(Number(searchTerm)) && !isNaN(parseFloat(searchTerm));
      
      if (isNumeric) {
        // Try to find by exact orderId first
        try {
          const orderIdResponse = await api.get<Order>(`/orders/${searchTerm}`);
          if (orderIdResponse.data) {
            // If found, create a paginated response with this single order
            return {
              orders: [orderIdResponse.data],
              currentPage: 0,
              totalPages: 1,
              totalItems: 1
            };
          }
        } catch (err) {
          // Order not found by ID, continue with other search methods
        }
        
        // Try to find by userId
        try {
          const userIdOrders = await api.get<Order[]>(`/orders/user/${searchTerm}`);
          if (userIdOrders.data && userIdOrders.data.length > 0) {
            // If found orders by userId, create a paginated response
            return {
              orders: userIdOrders.data.slice(page * size, (page + 1) * size),
              currentPage: page,
              totalPages: Math.ceil(userIdOrders.data.length / size),
              totalItems: userIdOrders.data.length
            };
          }
        } catch (err) {
          // No orders found by userId, continue with general search
        }
      }
      
      // If not found by direct methods or not numeric, use the search endpoint
      const params = {
        page,
        size,
        sortBy,
        direction,
        term: searchTerm
      };
      
      const response = await api.get<PaginatedOrdersResponse>('/orders/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (orderId: number) => {
    try {
      await api.delete(`/orders/${orderId}`);
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  },
};