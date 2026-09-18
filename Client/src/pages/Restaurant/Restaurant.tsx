import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRestaurantData } from '../../services/Restaurants/LoadAllRestaurants';
import { fetchFoodItemsByCategory } from '../../services/Restaurants/Fooditems';

import RestaurantHeaderWrapper from "../../components/Restaurants/RestaurantHeader.tsx";
import CategoriesSearch from "../../components/Restaurants/CategorySearch.tsx";


import Footer from "../../components/layout/Footer.tsx";
import WrapperPagination from '../../components/Restaurants/Pagination.tsx';
import { fetchFoodCategories } from '../../services/Restaurants/Fooditems.ts';
import NavV2 from '../../components/layout/NavV2.tsx';
import EnhancedFoodItemsListWrapper from "../../components/Restaurants/FoodItemsList.tsx";

// Define TypeScript interfaces for the data
interface FoodItem {
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

interface Restaurant {
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
    coverImageUrl: string;
    updatedAt: string;
    createdAt: string;
    categories?: string[];
}

const Restaurant = () => {
    const { id } = useParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [foodItemsByCategory, setFoodItemsByCategory] = useState<Record<string, FoodItem[]>>({});
    const [foodItemsTotalCount, setFoodItemsTotalCount] = useState<Record<string, number>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingFoodItems, setLoadingFoodItems] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const defaultCategories = ['Italian', 'fast food', 'Desserts', 'Vegan', 'Beverages'];
    const [page, setPage] = useState<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    const [size, setSize] = useState<number>(6);

    // Use a ref to track which categories have been loaded
    const loadedCategories = useRef<Set<string>>(new Set());

    // Data loading state from previous page
    const isInitialLoad = useRef<boolean>(true);

    // Load restaurant data and categories only once
    useEffect(() => {
        const loadRestaurantData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await fetchRestaurantData(id);
                const restaurantData = response.data;

                // Fetch categories from backend
                let categories: string[] = [];
                try {
                    categories = await fetchFoodCategories();
                } catch (catErr) {
                    console.warn("Falling back to default categories due to fetch failure.");
                    categories = defaultCategories;
                }

                const restaurantWithCategories = {
                    ...restaurantData,
                    categories
                };

                setRestaurant(restaurantWithCategories);

                // Set default selected category
                if (categories.length > 0) {
                    setSelectedCategory(categories[0]);
                }
            } catch (err) {
                setError('Failed to load restaurant data');
                console.error(err);
            } finally {
                setLoading(false);
                isInitialLoad.current = false;
            }
        };

        loadRestaurantData();
    }, [id]);

    // Reset page when category or search changes
    useEffect(() => {
        setPage(0);
    }, [selectedCategory, searchText]);

    // Load food items for a category if not already loaded or if search/pagination changes
    useEffect(() => {
        const loadFoodItems = async () => {
            if (!id || !selectedCategory) return;

            // Skip if this category is already loaded and there's no search or pagination
            const categoryKey = `${selectedCategory}-${searchText}-${page}`;
            if (
                loadedCategories.current.has(categoryKey) &&
                !searchText &&
                page === 0 &&
                !isInitialLoad.current
            ) {
                return;
            }

            try {
                setLoadingFoodItems(true);
                console.log(`Loading food items for ${selectedCategory}, search: ${searchText}, page: ${page}`);

                const response = await fetchFoodItemsByCategory(
                    id,
                    selectedCategory,
                    searchText,
                    page,
                    size
                );

                // Add this category to loaded categories
                loadedCategories.current.add(categoryKey);

                if (response.data) {
                    setFoodItemsByCategory(prev => ({
                        ...prev,
                        [selectedCategory]: response.data.dataList || []
                    }));

                    setFoodItemsTotalCount(prev => ({
                        ...prev,
                        [selectedCategory]: response.data.dataCount || 0
                    }));
                }
            } catch (err) {
                console.error('Failed to load food items:', err);
                setFoodItemsByCategory(prev => ({
                    ...prev,
                    [selectedCategory]: []
                }));
                setFoodItemsTotalCount(prev => ({
                    ...prev,
                    [selectedCategory]: 0
                }));
            } finally {
                setLoadingFoodItems(false);
            }
        };

        loadFoodItems();
    }, [id, selectedCategory, searchText, page, size]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleCategoryChange = useCallback((category: string) => {
        console.log('Changing category to:', category);
        setSelectedCategory(category);
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    // Calculate final price after discount
    const calculateFinalPrice = useCallback((price: number, discount: number) => {
        return (price - (price * discount / 100)).toFixed(2);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || 'Restaurant not found'}
                </div>
            </div>
        );
    }

    // Calculate total items safely for pagination
    const totalItems = selectedCategory ? (foodItemsTotalCount[selectedCategory] || 0) : 0;

    return (
        <div>

            <NavV2/>

            <RestaurantHeaderWrapper restaurant={restaurant} />

            <CategoriesSearch
                categories={restaurant.categories || []}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchText={searchText}
                onSearchChange={handleSearchChange}
            />
<div className="bg-white   rounded-b-3xl  mb-30">
            <EnhancedFoodItemsListWrapper
                selectedCategory={selectedCategory}
                foodItemsByCategory={foodItemsByCategory}
                foodItemsTotalCount={foodItemsTotalCount}
                loadingFoodItems={loadingFoodItems}
                calculateFinalPrice={calculateFinalPrice}
                searchText={searchText}
                onSearchChange={handleSearchChange}
            />

            <WrapperPagination
                page={page}
                size={size}
                totalItems={totalItems}
                onPageChange={handlePageChange}
            />
</div>
            <Footer/>
        </div>
    );
};

export default Restaurant;