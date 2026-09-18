import { API_BASE_URL, StandardResponse } from '../Common/Common';
import axios from 'axios';
export interface FoodItem {
    foodItemId: string;
    name: string;
    type: string;
    category: string;
    price: number;
    discount: number;
    imageUrl: string;
    description: string;
    available: boolean;
    restaurantId: string;
    restaurantName: string;
    createdAt: string;
}
export interface FoodItemRequest {
    name: string;
    type: string;
    category: string;
    price: number;
    discount: number;
    imageUrl: string;
    description: string;
    available: boolean;
    restaurantId: string;
}
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    dataCount?: number;
    dataList?: T[];
}

export interface FoodItemsResponse {
    dataCount: number;
    dataList: FoodItem[];
}

export const fetchFoodItemsByCategory = async (
    restaurantId: string,
    category: string,
    searchText: string = '',
    page: number = 0,
    size: number = 10
): Promise<StandardResponse<FoodItemsResponse>> => {
    try {
        const url = new URL(`${API_BASE_URL}/foods/${restaurantId}/${category}`);

        // Add query parameters
        url.searchParams.append('searchText', searchText);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('size', size.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching food items:', error);
        throw error;
    }
};
export const fetchFoodCategories = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/foods/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result.data; // assuming the response has a "data" array
    } catch (error) {
        console.error('Error fetching food categories:', error);
        throw error;
    }
};
export const getFoodItemById = async (foodItemId: string): Promise<FoodItem> => {
    try {
        const response = await axios.get<ApiResponse<FoodItem>>(`${API_BASE_URL}/foods/${foodItemId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching food item with ID ${foodItemId}:`, error);
        throw error;
    }
};
export const createFoodItem = async (foodItem: FoodItemRequest): Promise<ApiResponse<null>> => {
    try {
        const response = await axios.post<ApiResponse<null>>(`${API_BASE_URL}/foods`, foodItem);
        return response.data;
    } catch (error) {
        console.error('Error creating food item:', error);
        throw error;
    }
};// Update food item
export const updateFoodItem = async (
    foodItemId: string,
    foodItem: FoodItemRequest
): Promise<ApiResponse<null>> => {
    try {
        const response = await axios.put<ApiResponse<null>>(`${API_BASE_URL}/foods/${foodItemId}`, foodItem);
        return response.data;
    } catch (error) {
        console.error(`Error updating food item with ID ${foodItemId}:`, error);
        throw error;
    }
};

// Delete food item
export const deleteFoodItem = async (foodItemId: string): Promise<ApiResponse<null>> => {
    try {
        const response = await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/foods/${foodItemId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting food item with ID ${foodItemId}:`, error);
        throw error;
    }
};

// Toggle food item availability
export const toggleFoodItemAvailability = async (
    foodItemId: string,
    available: boolean
): Promise<ApiResponse<null>> => {
    try {
        const response = await axios.patch<ApiResponse<null>>(`${API_BASE_URL}/foods/${foodItemId}/availability`, { available });
        return response.data;
    } catch (error) {
        console.error(`Error toggling availability for food item with ID ${foodItemId}:`, error);
        throw error;
    }
};