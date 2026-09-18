import axios from 'axios';
import { API_BASE_URL } from '../Common/Common';

export interface Payment {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  lastUpdated: string;
}

const paymentService = {
  getAllPayments: async (): Promise<Payment[]> => {
    try {
      const response = await axios.get(`http://localhost:8082/api/v1/payments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  getPaymentsByUserId: async (userId: string): Promise<Payment[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  },

  getPaymentsByOrderId: async (orderId: string): Promise<Payment[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order payments:', error);
      throw error;
    }
  }
};

export default paymentService;