// src/service/cart.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/v1/cart';

// Create axios instance with auth headers
const getCartAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: 'http://localhost:8082',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const getCartByUserId = async (userId: string) => {
    try {
        const axiosInstance = getCartAxios();
        const response = await axiosInstance.get(`${API_BASE_URL}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const removeCartItem = async (userId: string, foodId: string) => {
    try {
        const axiosInstance = getCartAxios();
        const response = await axiosInstance.delete(`${API_BASE_URL}/${userId}/${foodId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
};

export const updateCartItemQuantity = async (userId: string, foodId: string, quantity: number, increase: boolean) => {
    try {
        const axiosInstance = getCartAxios();
        const response = await axiosInstance.put(
            `${API_BASE_URL}/${userId}/${foodId}`,
            { quantity, increase }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        throw error;
    }
};

export const clearCart = async (userId: string) => {
    try {
        const axiosInstance = getCartAxios();
        const response = await axiosInstance.delete(`${API_BASE_URL}/${userId}/clear`);
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};