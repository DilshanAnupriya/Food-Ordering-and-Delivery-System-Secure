import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AdminNavbar from "../../components/admin/AdminNavbar.tsx";
import AdminSideBar from "../../components/layout/AdminSideBar.tsx";

// Import Leaflet CSS (need to add to your project)
// import 'leaflet/dist/leaflet.css';

// Define marker icon (leaflet's default icon has path issues)
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Component to update map view when coordinates change
function MapUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, 13);
        }
    }, [center, map]);

    return null;
}

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
    owner_username: string;
    active: boolean;
}

interface StandardResponseDto {
    code: number;
    message: string;
    data: never;
}

const ResCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState<RestaurantRequestDto>({
        restaurantName: '',
        restaurantAddress: '',
        restaurantPhone: '',
        restaurantEmail: '',
        restaurantType: '',
        city: '',
        latitude: 0,
        longitude: 0,
        availability: false,
        orderAvailability: false,
        rating: 0,
        openingTime: '',
        closingTime: '',
        description: '',
        imageUrl: '',
        coverImageUrl: '',
        owner_username: '',
        active: false
    });

    const [activeTab, setActiveTab] = useState(0);
    const [formProgress, setFormProgress] = useState(0);
    const [markerPosition, setMarkerPosition] = useState([0, 0]);
    const [locationFound, setLocationFound] = useState(false);
    const [error, setError] = useState('');

    // Update progress bar as fields are filled
    useEffect(() => {
        const requiredFields = [
            'restaurantName',
            'restaurantAddress',
            'restaurantPhone',
            'restaurantEmail',
            'restaurantType',
            'city'
        ];

        const filledFields = requiredFields.filter(field =>
            formData[field as keyof RestaurantRequestDto] !== '' &&
            formData[field as keyof RestaurantRequestDto] !== 0
        );

        setFormProgress((filledFields.length / requiredFields.length) * 100);
    }, [formData]);

    // Get current location
    const getCurrentLocation = () => {
        setIsLocating(true);
        setError('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Update form data with coordinates
                    setFormData(prev => ({
                        ...prev,
                        latitude,
                        longitude
                    }));

                    // Update marker position for map
                    setMarkerPosition([latitude, longitude]);
                    setLocationFound(true);

                    // Reverse geocode to get address
                    try {
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );

                        const address = response.data;

                        if (address && address.address) {
                            const streetAddress = [
                                address.address.road,
                                address.address.house_number
                            ].filter(Boolean).join(' ');

                            setFormData(prev => ({
                                ...prev,
                                restaurantAddress: streetAddress || '',
                                city: address.address.city || address.address.town || address.address.village || '',
                            }));
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                    }

                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError('Could not get your location. Please check your browser permissions.');
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setIsLocating(false);
        }
    };

    // Handle map click to update coordinates
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;

        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));

        setMarkerPosition([lat, lng]);
        setLocationFound(true);

        // Reverse geocode to get address
        axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        ).then(response => {
            const address = response.data;

            if (address && address.address) {
                const streetAddress = [
                    address.address.road,
                    address.address.house_number
                ].filter(Boolean).join(' ');

                setFormData(prev => ({
                    ...prev,
                    restaurantAddress: streetAddress || '',
                    city: address.address.city || address.address.town || address.address.village || '',
                }));
            }
        }).catch(error => {
            console.error("Error getting address:", error);
        });
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: parseFloat(value) });
    };

    const resetForm = () => {
        setFormData({
            restaurantName: '',
            restaurantAddress: '',
            restaurantPhone: '',
            restaurantEmail: '',
            restaurantType: '',
            city: '',
            latitude: 0,
            longitude: 0,
            availability: false,
            orderAvailability: false,
            rating: 0,
            openingTime: '',
            closingTime: '',
            description: '',
            imageUrl: '',
            coverImageUrl: '',
            owner_username: '',
            active: false
        });
        setMarkerPosition([0, 0]);
        setLocationFound(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:8082/api/v1/restaurants',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                // Store restaurant details in session storage
                const restaurantDetails = {
                    ...formData,
                    createdAt: new Date().toISOString()
                };
                sessionStorage.setItem('restaurantDetail', JSON.stringify([restaurantDetails]));

                // Send restaurant creation confirmation email
                try {
                    await axios.post(
                        `http://localhost:8080/api/notifications/restaurant-confirmation`,
                        {
                            email: formData.restaurantEmail,
                            restaurantName: formData.restaurantName,
                            restaurantType: formData.restaurantType,
                            address: formData.restaurantAddress,
                            city: formData.city,
                            phone: formData.restaurantPhone,
                            openingTime: formData.openingTime,
                            closingTime: formData.closingTime
                        }
                    );
                    console.log('Restaurant confirmation email sent');
                } catch (emailError) {
                    console.error('Failed to send restaurant confirmation email:', emailError);
                }

                // Show success toast notification
                toast.success('Restaurant created successfully!');
                resetForm();
                // Navigate to admin restaurant page after successful creation
                navigate('/');
            }
        } catch (error) {
            console.error('Error creating restaurant:', error);
            toast.error('Failed to create restaurant. Please try again.');
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

    return (
        <>
            <div className="h-screen bg-gray-50">
                <div className="mt-20 ">
                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white shadow-lg sm:rounded-lg overflow-hidden rounded-2xl w-full mt-3 2xl:w-[1600px] 2xl:ml-[-50px] 2xl:mt-[-150px] h-[740px]">
                            {/* Header with progress bar */}
                            <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-4">
                                <h2 className="text-2xl font-bold">Create New Restaurant</h2>
                                <p className="mt-1 text-indigo-100">
                                    Fill in the details below to add a new restaurant to our system
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
                                        className="px-6 py-4 space-y-6 h-[500px] overflow-y-auto"
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

                                        <div className="flex justify-end">
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
                                        className="px-6 py-4 space-y-6 h-[500px] overflow-y-auto"
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
                                                            className={`h-5 w-5 ${star <= Math.round(formData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
                                                        placeholder="owner name"
                                                    />
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
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                        className="px-6 py-4 space-y-6 h-[500px] overflow-y-auto"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <div className="flex justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Restaurant Location</h3>
                                                <motion.button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    disabled={isLocating}
                                                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${
                                                        isLocating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {isLocating ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Getting location...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            Use My Current Location
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>

                                            {error && (
                                                <div className="rounded-md bg-red-50 p-4 mb-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-red-800">Location Error</h3>
                                                            <div className="mt-2 text-sm text-red-700">
                                                                <p>{error}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Display coordinates */}
                                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-4">
                                                <div className="sm:col-span-3">
                                                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                                                        Latitude
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="number"
                                                            name="latitude"
                                                            id="latitude"
                                                            step="any"
                                                            value={formData.latitude || ''}
                                                            onChange={handleNumberChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder="Restaurant latitude"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-3">
                                                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                                                        Longitude
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="number"
                                                            name="longitude"
                                                            id="longitude"
                                                            step="any"
                                                            value={formData.longitude || ''}
                                                            onChange={handleNumberChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder="Restaurant longitude"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Map container with map or placeholder */}
                                            <div className="rounded-lg border border-gray-300 overflow-hidden h-64 relative">
                                                {locationFound ? (
                                                    <MapContainer
                                                        center={markerPosition}
                                                        zoom={13}
                                                        style={{ height: '100%', width: '100%' }}
                                                        scrollWheelZoom={false}
                                                        onClick={handleMapClick}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <Marker position={markerPosition} icon={icon}>
                                                        </Marker>
                                                        <MapUpdater center={markerPosition} />
                                                    </MapContainer>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                        <div className="text-center">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No location selected</h3>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                Click "Use My Current Location" or manually enter coordinates to display the map
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 text-sm text-gray-500">
                                                <p>
                                                    <span className="font-medium">Tip:</span> You can click directly on the map to update the restaurant location.
                                                </p>
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
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                        className="px-6 py-4 space-y-6 h-[500px] overflow-y-auto"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            {/* Restaurant Profile Image */}
                                            <div className="sm:col-span-6">
                                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Profile Image
                                                </label>
                                                <div className="mt-1 flex items-center">
                                                    <div className="h-32 w-32 rounded-md overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                                                        {formData.imageUrl ? (
                                                            <img
                                                                src={formData.imageUrl}
                                                                alt="Restaurant profile preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="ml-5">
                                                        <input
                                                            type="text"
                                                            name="imageUrl"
                                                            id="imageUrl"
                                                            value={formData.imageUrl}
                                                            onChange={handleInputChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                            placeholder="Enter image URL"
                                                        />
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            Recommended size: 300x300 pixels
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Restaurant Cover Image */}
                                            <div className="sm:col-span-6">
                                                <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">
                                                    Restaurant Cover Image
                                                </label>
                                                <div className="mt-1 flex items-center">
                                                    <div className="h-32 w-64 rounded-md overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                                                        {formData.coverImageUrl ? (
                                                            <img
                                                                src={formData.coverImageUrl}
                                                                alt="Restaurant cover preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="ml-5">
                                                        <input
                                                            type="text"
                                                            name="coverImageUrl"
                                                            id="coverImageUrl"
                                                            value={formData.coverImageUrl}
                                                            onChange={handleInputChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 p-2"
                                                            placeholder="Enter cover image URL"
                                                        />
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            Recommended size: 1200x400 pixels
                                                        </p>
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
                                                disabled={isLoading}
                                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                                    isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                                                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Create Restaurant
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

export default ResCreate;