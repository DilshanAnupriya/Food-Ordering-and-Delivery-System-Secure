import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AdminNavbar from "../../../components/admin/AdminNavbar.tsx";
import { fetchRestaurantData } from "../../../services/Restaurants/LoadAllRestaurants.ts";
import { API_BASE_URL } from '../../../services/Common/Common.ts';
import Sidebar from "../../../components/Restaurants/Owner/Sidebar.tsx";

// Types
interface RestaurantRequestDto {
    restaurantName: string;
    restaurantAddress: string;
    restaurantPhone: string;
    restaurantEmail: string;
    restaurantType: string;
    city: string;
    latitude: number;
    longitude: number;
    availability: boolean;
    orderAvailability: boolean;
    rating: number;
    openingTime: string;
    closingTime: string;
    description: string;
    imageUrl: string;
    coverImageUrl: string;
    owner_username:string
    active: boolean;
}

interface StandardResponseDto {
    code: number;
    message: string;
    data: any;
}

const ResUpdate: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const [formData, setFormData] = useState<RestaurantRequestDto>({
        restaurantName: '',
        restaurantAddress: '',
        restaurantPhone: '',
        restaurantEmail: '',
        restaurantType: '',
        city: '',
        latitude: 0,
        longitude: 0,
        availability: true,
        orderAvailability: true,
        rating: 0,
        openingTime: '',
        closingTime: '',
        description: '',
        imageUrl: '',
        coverImageUrl: '',
        owner_username:'',
        active: true
    });

    const [activeTab, setActiveTab] = useState<number>(0);
    const [formProgress, setFormProgress] = useState<number>(0);

    // Fetch existing restaurant data
    useEffect(() => {
        const loadRestaurantData = async () => {
            try {
                setIsPageLoading(true);
                if (id) {
                    const response = await fetchRestaurantData(id);
                    if (response && response.code === 200 && response.data) {
                        const restaurantData = response.data;

                        // Map the response data to our form data structure
                        setFormData({
                            restaurantName: restaurantData.restaurantName || '',
                            restaurantAddress: restaurantData.restaurantAddress || '',
                            restaurantPhone: restaurantData.restaurantPhone || '',
                            restaurantEmail: restaurantData.restaurantEmail || '',
                            restaurantType: restaurantData.restaurantType || '',
                            city: restaurantData.city || '',
                            latitude: restaurantData.latitude || 0,
                            longitude: restaurantData.longitude || 0,
                            availability: restaurantData.availability !== undefined ? restaurantData.availability : true,
                            orderAvailability: restaurantData.orderAvailability !== undefined ? restaurantData.orderAvailability : true,
                            rating: restaurantData.rating || 0,
                            openingTime: restaurantData.openingTime || '',
                            closingTime: restaurantData.closingTime || '',
                            description: restaurantData.description || '',
                            imageUrl: restaurantData.imageUrl || '',
                            coverImageUrl: restaurantData.coverImageUrl || '',
                            owner_username: restaurantData.owner_username || '',
                            active: restaurantData.active !== undefined ? restaurantData.active : true
                        });

                        // Calculate initial form progress
                        calculateFormProgress({
                            restaurantName: restaurantData.restaurantName || '',
                            restaurantAddress: restaurantData.restaurantAddress || '',
                            restaurantPhone: restaurantData.restaurantPhone || '',
                            restaurantEmail: restaurantData.restaurantEmail || '',
                            restaurantType: restaurantData.restaurantType || '',
                            city: restaurantData.city || '',
                        });
                    } else {
                        toast.error('Failed to load restaurant data');
                        navigate('/owner-restaurant');
                    }
                }
            } catch (error) {
                console.error('Error loading restaurant data:', error);
                toast.error('Could not load restaurant information');
                navigate('/owner-restaurant');
            } finally {
                setIsPageLoading(false);
            }
        };

        loadRestaurantData();
    }, [id, navigate]);

    // Calculate form progress based on required fields
    const calculateFormProgress = (data: any) => {
        const requiredFields = [
            'restaurantName',
            'restaurantAddress',
            'restaurantPhone',
            'restaurantEmail',
            'restaurantType',
            'city'
        ];

        const filledFields = requiredFields.filter(field =>
            data[field] !== '' &&
            data[field] !== undefined &&
            data[field] !== 0
        );

        setFormProgress((filledFields.length / requiredFields.length) * 100);
    };

    // Update progress bar as fields are filled
    useEffect(() => {
        calculateFormProgress(formData);
    }, [formData]);

    const restaurantTypes = [
        'Italian',
        'Chinese',
        'Indian',
        'Mexican',
        'American',
        'Japanese',
        'French',
        'Mediterranean',
        'Thai',
        'Greek',
        'Spanish',
        'Korean',
        'Vietnamese',
        'Turkish',
        'Lebanese'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "ownerRestaurant") {
            setFormData({ ...formData, owner_username: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: parseFloat(value) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Add logging to check what's being sent
            console.log("Submitting restaurant data:", formData);

            // Ensure restaurantType is explicitly included in the request
            const restaurantUpdateData = {
                ...formData,
                restaurantType: formData.restaurantType, // Explicitly include this
            };

            const response = await axios.put<StandardResponseDto>(
                `${API_BASE_URL}/restaurants/${id}`,
                restaurantUpdateData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                // Show success toast notification
                console.log(response.data)
                toast.success('Restaurant updated successfully!');
                // Navigate back to restaurant dashboard after successful update
                navigate('/owner-restaurant');
            } else {
                // Handle specific error if needed
                toast.error(`Update failed: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            // More detailed error handling
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || 'Failed to update restaurant';
                toast.error(errorMsg);
            } else {
                toast.error('Failed to update restaurant. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    const formTabs = [
        { name: 'Basic Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { name: 'Details', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    // Function to get map preview URL using OpenStreetMap instead of Google Maps
    const getMapPreviewUrl = () => {
        if (formData.latitude && formData.longitude) {
            return `https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.01}%2C${formData.latitude - 0.01}%2C${formData.longitude + 0.01}%2C${formData.latitude + 0.01}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`;
        }
        return '';
    };

    // Display loading spinner if page is loading
    if (isPageLoading) {
        return (
            <div className="h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid"></div>
            </div>
        );
    }

    return (
        <>
            <div className="h-screen ">
                <div className="ml-[250px] mt-2">
                    <AdminNavbar/>
                </div>
                <Sidebar/>

                <div className="absolute mt-20 ml-70 w-250 pb-40">

                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white shadow-lg sm:rounded-lg overflow-hidden rounded-2xl w-full mt-3 2xl:w-[1600px] 2xl:ml-[-50px] 2xl:mt-[-150px] h-[700px]">
                            {/* Header with progress bar */}
                            <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-4">
                                <h2 className="text-2xl font-bold">Update Restaurant</h2>
                                <p className="mt-1 text-indigo-100">
                                    Update the details for {formData.restaurantName}
                                </p>
                                <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${formProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs mt-1 text-indigo-100">
                                    <span>Progress</span>
                                    <span>{Math.round(formProgress)}% Complete</span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px overflow-x-auto py-2">
                                    {formTabs.map((tab, index) => (
                                        <button
                                            key={tab.name}
                                            onClick={() => setActiveTab(index)}
                                            className={`${
                                                activeTab === index
                                                    ? 'border-orange-400 text-orange-500'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap flex items-center px-4 py-2 border-b-2 font-medium text-sm mx-2 transition-all duration-200`}
                                        >
                                            <svg
                                                className="mr-2 h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                                            </svg>
                                            {tab.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Basic Info Tab */}
                                {activeTab === 0 && (
                                    <motion.div
                                        className="px-6 py-4 space-y-6"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            {/* Restaurant Name */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Name<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="restaurantName"
                                                        id="restaurantName"
                                                        required
                                                        value={formData.restaurantName}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="Enter restaurant name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Restaurant Type */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="restaurantType" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Type<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <select
                                                        id="restaurantType"
                                                        name="restaurantType"
                                                        required
                                                        value={formData.restaurantType}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                    >
                                                        <option value="">Select type</option>
                                                        {restaurantTypes.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Restaurant Address */}
                                            <div className="sm:col-span-6">
                                                <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700">
                                                    Address<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="restaurantAddress"
                                                        id="restaurantAddress"
                                                        required
                                                        value={formData.restaurantAddress}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="Enter full address"
                                                    />
                                                </div>
                                            </div>

                                            {/* City */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                                    City<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        id="city"
                                                        required
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="Enter city name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700">
                                                    Phone Number<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="tel"
                                                        name="restaurantPhone"
                                                        id="restaurantPhone"
                                                        required
                                                        value={formData.restaurantPhone}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="+1 (xxx) xxx-xxxx"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="restaurantEmail" className="block text-sm font-medium text-gray-700">
                                                    Email<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="email"
                                                        name="restaurantEmail"
                                                        id="restaurantEmail"
                                                        required
                                                        value={formData.restaurantEmail}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="restaurant@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-end 2xl:mt-30">
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(1)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Next: Details
                                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Details Tab */}
                                {activeTab === 1 && (
                                    <motion.div
                                        className="px-6 py-4 space-y-6"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            {/* Description */}
                                            <div className="sm:col-span-6">
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <div className="mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={3}
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                placeholder="Describe your restaurant in detail..."
                                            />
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                                                    Rating (1-5)
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="number"
                                                        name="rating"
                                                        id="rating"
                                                        min="1"
                                                        max="5"
                                                        step="0.1"
                                                        value={formData.rating}
                                                        onChange={handleNumberChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                    />
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`h-5 w-5 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Opening Hours */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                                                    Opening Time
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="time"
                                                        name="openingTime"
                                                        id="openingTime"
                                                        value={formData.openingTime}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                    />
                                                </div>
                                            </div>

                                            {/* Closing Hours */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                                                    Closing Time
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="time"
                                                        name="closingTime"
                                                        id="closingTime"
                                                        value={formData.closingTime}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label htmlFor="owner_username" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Owner<span className="text-red-500">*</span>
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="owner_username"
                                                        id="owner_username"
                                                        required
                                                        value={formData.owner_username}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="Owner name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Checkboxes for availability */}
                                            <div className="sm:col-span-2">
                                                <div className="flex items-center">
                                                    <input
                                                        id="availability"
                                                        name="availability"
                                                        type="checkbox"
                                                        checked={formData.availability}
                                                        onChange={handleCheckboxChange}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200 mt-8"
                                                    />
                                                    <label htmlFor="availability" className="ml-2 block text-sm text-gray-700 pt-8">
                                                        Restaurant Available
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <div className="flex items-center">
                                                    <input
                                                        id="orderAvailability"
                                                        name="orderAvailability"
                                                        type="checkbox"
                                                        checked={formData.orderAvailability}
                                                        onChange={handleCheckboxChange}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200 p-2"
                                                    />
                                                    <label htmlFor="orderAvailability" className="ml-2 block text-sm text-gray-700">
                                                        Order Available
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <div className="flex items-center">
                                                    <input
                                                        id="active"
                                                        name="active"
                                                        type="checkbox"
                                                        checked={formData.active}
                                                        onChange={handleCheckboxChange}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200 ml-[-150px]"
                                                    />
                                                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-between mt-10">
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(0)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(2)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Next: Location
                                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Location Tab */}
                                {activeTab === 2 && (
                                    <motion.div
                                        className="px-6 py-4 space-y-6"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            {/* Latitude */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                                                    Latitude
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        name="latitude"
                                                        id="latitude"
                                                        value={formData.latitude}
                                                        onChange={handleNumberChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="e.g. 51.507351"
                                                    />
                                                </div>
                                            </div>

                                            {/* Longitude */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                                                    Longitude
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        name="longitude"
                                                        id="longitude"
                                                        value={formData.longitude}
                                                        onChange={handleNumberChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="e.g. -0.127758"
                                                    />
                                                </div>
                                            </div>

                                            {/* Map Preview */}
                                            <div className="sm:col-span-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Map Preview
                                                </label>
                                                {formData.latitude && formData.longitude ? (
                                                    <div className="mt-2 border border-gray-300 rounded-md overflow-hidden h-64">
                                                        <iframe
                                                            title="Restaurant Location"
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            scrolling="no"
                                                            marginHeight={0}
                                                            marginWidth={0}
                                                            src={getMapPreviewUrl()}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 border border-gray-300 rounded-md flex items-center justify-center h-64 bg-gray-50">
                                                        <p className="text-gray-500">
                                                            Enter latitude and longitude to see map preview
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-between mt-10">
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(1)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(3)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Next: Images
                                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Images Tab */}
                                {activeTab === 3 && (
                                    <motion.div
                                        className="px-6 py-4 space-y-6"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            {/* Restaurant Logo/Image */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Logo/Image URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="imageUrl"
                                                        id="imageUrl"
                                                        value={formData.imageUrl}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                </div>
                                                {formData.imageUrl && (
                                                    <div className="mt-2 border border-gray-300 rounded-md overflow-hidden w-32 h-32">
                                                        <img
                                                            src={formData.imageUrl}
                                                            alt="Restaurant logo preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/128?text=Invalid+Image';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Restaurant Cover Image */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">
                                                    Cover Image URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="coverImageUrl"
                                                        id="coverImageUrl"
                                                        value={formData.coverImageUrl}
                                                        onChange={handleInputChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                        placeholder="https://example.com/cover.jpg"
                                                    />
                                                </div>
                                                {formData.coverImageUrl && (
                                                    <div className="mt-2 border border-gray-300 rounded-md overflow-hidden h-32">
                                                        <img
                                                            src={formData.coverImageUrl}
                                                            alt="Restaurant cover preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/300x128?text=Invalid+Image';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Image Upload Guidelines */}
                                            <div className="sm:col-span-6">
                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-blue-800">Image Guidelines</h3>
                                                            <div className="mt-2 text-sm text-blue-700">
                                                                <ul className="list-disc pl-5 space-y-1">
                                                                    <li>Logo image: Square format (1:1 ratio), at least 256x256 pixels</li>
                                                                    <li>Cover image: Landscape format (16:9 ratio), at least 1200x675 pixels</li>
                                                                    <li>Maximum file size: 5MB per image</li>
                                                                    <li>Supported formats: JPG, PNG, WebP</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-between mt-10">
                                            <motion.button
                                                type="button"
                                                onClick={() => setActiveTab(2)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                                    isLoading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200`}
                                                disabled={isLoading}
                                                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Update Restaurant
                                                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ResUpdate;