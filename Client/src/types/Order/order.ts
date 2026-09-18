export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
export interface OrderItem {
  id?: number;
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  orderId?: number;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  orderDate?: string;
  lastUpdated?: string;
  deliveryAddress: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  orderItems: OrderItem[];
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
