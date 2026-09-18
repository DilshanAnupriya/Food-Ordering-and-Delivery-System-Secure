
import React, { useState, useEffect } from 'react';
import { fetchRestaurants, Restaurant } from '../../services/Restaurants/LoadAllRestaurants';
import { SearchAndFilter } from './SearchAndFilter.tsx';
import { RestaurantCard } from './RestaurantCard.tsx';
import { EmptyState } from './EmptyState.tsx';
import WrapperPagination from './Pagination.tsx';
import SectionWrapper from "../../hoc/SectionWrapper.tsx";


const RestaurantsContainer: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    // Fetch restaurants when page, size or search changes
    useEffect(() => {
        const getRestaurants = async () => {
            try {
                setLoading(true);
                const data = await fetchRestaurants(debouncedSearchText, page, size);
                setRestaurants(data.restaurants);
                setTotalItems(data.totalItems);
                setError(null);

                // Added logging to debug
                console.log('Restaurant data:', {
                    restaurants: data.restaurants.length,
                    totalItems: data.totalItems,
                    currentPage: page,
                    pageSize: size
                });

            } catch (err) {
                setError('An error occurred while fetching restaurants');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getRestaurants();
    }, [page, size, debouncedSearchText]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // Scroll to top when page changes
        window.scrollTo(0, 0);
    };

    const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSize(Number(event.target.value));
        setPage(0); // Reset to first page when changing size
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        setPage(0); // Reset to first page when searching
    };

    // Show loading and error states
    if (loading && restaurants.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg font-medium text-gray-700">Loading restaurants...</div>
            </div>
        );
    }

    if (error && restaurants.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg font-medium text-red-600">{error}</div>
            </div>
        );
    }

    return (

        <div className="container mx-auto px-4 py-8 mb-10 mt-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Restaurants</h1>

                <SearchAndFilter
                    searchText={searchText}
                    size={size}
                    onSearchChange={handleSearchChange}
                    onSizeChange={handleSizeChange}
                />

            </div>

            {/* Add position-relative to this container */}
            <div className="relative">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Restaurant grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
                    ))}
                </div>

                {/* Empty state */}
                {restaurants.length === 0 && !loading && <EmptyState />}
            </div>

            {/* Always show pagination component */}
            <div id="pagination-container" className="mt-8">
                <WrapperPagination
                    page={page}
                    size={size}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>


    );
};


const WrappedRestaurantsContainer = SectionWrapper(RestaurantsContainer);

export default WrappedRestaurantsContainer;
