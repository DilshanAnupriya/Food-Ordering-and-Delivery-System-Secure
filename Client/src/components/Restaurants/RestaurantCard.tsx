import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../../services/Restaurants/LoadAllRestaurants.ts';

interface RestaurantCardProps {
    restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/restaurant/${restaurant.restaurantId}`);
    };

    return (
        <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 w-[280px] mt-15 cursor-pointer"
            onClick={handleClick}
        >
            <div className="h-48 overflow-hidden">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/320';
                    }}
                />
            </div>
            <div className="py-4 pl-2 pr-2 bg-amber-50 h-full">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-800">{restaurant.restaurantName}</h2>
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium">{restaurant.rating}</span>
                    </div>
                </div>
                <p className="text-gray-600 mt-1">{restaurant.restaurantType} • {restaurant.city}</p>
                {/*<p className="text-gray-600 text-sm mt-2 line-clamp-2">{restaurant.description}</p>*/}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {restaurant.openingTime.substring(0, 5)} - {restaurant.closingTime.substring(0, 5)}
                </div>
                <div className="mt-4 flex justify-between">
                    {restaurant.availability ? (
                        <>
                            <span className="mr-1 py-1 text-xs rounded bg-green-100 text-green-800">
                                Restaurant available
                            </span>
                            <span className="px-1 py-1 text-xs rounded bg-green-100 text-green-800">
                                {restaurant.active ? 'Open' : 'Closed'}
                            </span>
                            <span className="px-1 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                {restaurant.orderAvailability ? 'Online Order' : 'No Online Order'}
                            </span>
                        </>
                    ) : (
                        <span className="py-1 text-xs rounded bg-red-100 text-red-800 w-full text-center">
                            Restaurant unavailable
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};