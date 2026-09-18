import axios from 'axios';
import { API_BASE_URL, StandardResponse } from '../Common/Common';

// Types
export interface Restaurant {
    restaurantId: string;
    restaurantName: string;
    restaurantAddress: string;
    restaurantPhone: string;
    restaurantEmail: string;
    restaurantType: string;
    city: string;
    availability: boolean;
    orderAvailability: boolean;
    rating: number;
    openingTime: string;
    closingTime: string;
    description: string;
    active: boolean;
    imageUrl: string;
    latitude:number;
    longitude:number;
    coverImageUrl: string;
    updatedAt: string;
    createdAt: string;
}

export interface RestaurantResponseData {
    dataCount: number;
    dataList: Restaurant[];
}

export type RestaurantStandardResponse = StandardResponse<RestaurantResponseData>

export const fetchRestaurants = async (
    searchText: string,
    page: number,
    size: number = 10
): Promise<{ restaurants: Restaurant[]; totalItems: number }> => {
    try {
        const response = await axios.get<RestaurantStandardResponse>(
            `${API_BASE_URL}/restaurants/list?searchText=${searchText}&page=${page}&size=${size}`
        );

        if (response.data.code === 200) {
            return {
                restaurants: response.data.data.dataList,
                totalItems: response.data.data.dataCount
            };
        } else {
            throw new Error('Failed to fetch restaurants');
        }
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
    }
};

// Function to fetch restaurant data by ID
export const fetchRestaurantData = async (restaurantId: string): Promise<StandardResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching restaurant data:', error);
        throw error;
    }
};