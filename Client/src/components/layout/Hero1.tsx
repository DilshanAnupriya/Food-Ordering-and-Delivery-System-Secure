import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from "../../hoc/SectionWrapper.tsx";
import { Link } from 'react-router';

interface TrendingRestaurant {
    restaurantName: string;
    search_id: string;
    searchCount: number;
    url: string | null;
}

interface ApiResponse {
    code: number;
    message: string;
    data: {
        trendingRestaurants: TrendingRestaurant[];
    };
}

// Skeleton loader for restaurant cards
const RestaurantCardSkeleton = () => {
    return (
        <div className="flex flex-col w-full rounded-2xl overflow-hidden shadow-md bg-white">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4 bg-gray-100 animate-pulse">
                <div className="h-6 w-3/4 mx-auto bg-gray-300 rounded"></div>
            </div>
        </div>
    );
};

const RestaurantCard = ({ restaurant }: { restaurant: TrendingRestaurant }) => {
    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        hover: {
            y: -10,
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3
            }
        }
    };

    // Badge variants
    const badgeVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delay: 0.2,
                duration: 0.3,
                type: "spring",
                stiffness: 300
            }
        }
    };

    return (
        <motion.div
            className="flex flex-col w-full   rounded-2xl overflow-hidden shadow-md bg-white"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={restaurant.url || "/api/placeholder/400/300"}
                    alt={restaurant.restaurantName}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />

                {/* Trending badge */}
                <motion.div
                    className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                    variants={badgeVariants}
                >
                    Trending
                </motion.div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <h3 className="font-semibold text-lg text-center">
                    {restaurant.restaurantName}
                </h3>
                <div className="flex items-center justify-center mt-1 text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span>Popular Choice</span>
                </div>
            </div>
        </motion.div>
    );
};

const TrendingRestaurants = () => {
    const [trendingRestaurants, setTrendingRestaurants] = useState<TrendingRestaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Animation variants for container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
            }
        }
    };

    // Animation variants for title
    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    useEffect(() => {
        const fetchTrendingRestaurants = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8082/api/v1/restaurants/trending-list');

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: ApiResponse = await response.json();

                if (data.code === 200 && Array.isArray(data.data.trendingRestaurants)) {
                    setTrendingRestaurants(data.data.trendingRestaurants);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            } catch (err) {
                console.error('Error fetching trending restaurants:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingRestaurants();
    }, []);

    return (
        <section className="py-12 mt-10 bg-orange-50 pb-20 rounded-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6  lg:px-8">
                <motion.div
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-10"
                >
                    <h2 className="text-3xl font-bold text-gray-900">
                        Popular <span className="text-orange-500">Restaurants</span>
                    </h2>
                    <div className="h-1 w-24 bg-orange-500 mt-2"></div>
                    <p className="mt-4 text-gray-600">
                        Explore the most trending food places in your area
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {Array(5).fill(0).map((_, index) => (
                            <RestaurantCardSkeleton key={index} />
                        ))}
                    </div>
                ) : error ? (
                    <motion.div
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="font-medium">Error loading restaurants:</p>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 pt-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {trendingRestaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant.search_id} restaurant={restaurant} />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

const TrendingRestaurantsWrapper = SectionWrapper(TrendingRestaurants);

export default TrendingRestaurantsWrapper;