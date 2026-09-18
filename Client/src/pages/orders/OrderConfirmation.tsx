import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/auth/authContext';
import { fetchRestaurantData } from '../../services/Restaurants/LoadAllRestaurants';
import { orderService } from '../../services/Orders/orderService';
import NavV2 from '../../components/layout/NavV2';

interface OrderDetails {
    orderId: string;
    totalAmount: number;
    restaurantId: string;
}

interface DeliveryStatus {
    orderId: string;
    success: boolean;
    message: string;
}

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);
    const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([]);
    const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();

    const getOrderDetails = (): OrderDetails[] => {
        try {
            return JSON.parse(sessionStorage.getItem('orderDetail') || '[]');
        } catch (err) {
            console.error('Error parsing order details:', err);
            return [];
        }
    };

    const orderDetails = getOrderDetails();
    const latestOrder = orderDetails.length > 0 ? orderDetails[orderDetails.length - 1] : null;

    const sendConfirmationEmail = async () => {
        if (!latestOrder || !user?.sub) {
            setError('Missing order or user information');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/orders/confirm?email=${encodeURIComponent(user.sub)}&orderId=${encodeURIComponent(latestOrder.orderId)}&totalAmount=${encodeURIComponent(latestOrder.totalAmount.toFixed(2))}`,
                null,
                { headers: { 'Accept': 'application/json' } }
            );

            if (response.status === 200) {
                setIsEmailSent(true);
                setError(null);
                console.log('Confirmation email sent');
            }
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Unexpected error occurred';
            setError(`Email error: ${message}`);
        }
    };

    const createDeliveryForOrder = async (order: OrderDetails) => {
        // Skip if this order already has a delivery created
        if (processedOrderIds.has(order.orderId.toString())) {
            console.log(`Skipping duplicate delivery creation for order: ${order.orderId}`);
            return;
        }

        try {
            const restaurantInfo = await fetchRestaurantData(order.restaurantId);
            const userDestination = await orderService.getOrderById(order.orderId);

            if (restaurantInfo && userDestination) {
                const response = await axios.post('http://localhost:8082/api/v1/delivery/create', null, {
                    params: {
                        orderId: order.orderId.toString(),
                        shopLatitude: restaurantInfo.data.latitude,
                        shopLongitude: restaurantInfo.data.longitude,
                        destinationLatitude: userDestination.latitude,
                        destinationLongitude: userDestination.longitude
                    }
                });

                if (response.status === 200) {
                    setDeliveryStatuses(prev => [...prev, {
                        orderId: order.orderId.toString(),
                        success: true,
                        message: 'Delivery created'
                    }]);
                    // Mark this order as processed
                    setProcessedOrderIds(prev => new Set(prev).add(order.orderId.toString()));

                    // Save processed order IDs to localStorage to prevent recreation on page refresh
                    const savedProcessedOrders = new Set([
                        ...Array.from(JSON.parse(localStorage.getItem('processedDeliveryOrders') || '[]')),
                        order.orderId.toString()
                    ]);
                    localStorage.setItem('processedDeliveryOrders', JSON.stringify(Array.from(savedProcessedOrders)));
                }
            }
        } catch (error) {
            console.error('Delivery error:', error);
            setDeliveryStatuses(prev => [...prev, {
                orderId: order.orderId.toString(),
                success: false,
                message: 'Delivery failed'
            }]);
        }
    };

    // Load previously processed orders on component mount
    useEffect(() => {
        try {
            const savedProcessedOrders = JSON.parse(localStorage.getItem('processedDeliveryOrders') || '[]');
            setProcessedOrderIds(new Set(savedProcessedOrders));
        } catch (err) {
            console.error('Error loading processed orders:', err);
        }
    }, []);

    useEffect(() => {
        if (latestOrder && user?.sub && !isEmailSent) {
            sendConfirmationEmail();
        }
    }, [latestOrder, isEmailSent, user]);

    useEffect(() => {
        if (orderDetails.length > 0 && !isCreatingDelivery) {
            setIsCreatingDelivery(true);

            const processDeliveries = async () => {
                // Filter out orders that already have deliveries
                const unprocessedOrders = orderDetails.filter(
                    order => !processedOrderIds.has(order.orderId.toString())
                );

                if (unprocessedOrders.length === 0) {
                    console.log('All orders already have deliveries created');
                    setIsCreatingDelivery(false);
                    return;
                }

                // Process only orders that don't have deliveries yet
                for (const order of unprocessedOrders) {
                    await createDeliveryForOrder(order);
                }

                setIsCreatingDelivery(false);
            };

            processDeliveries();
        }
    }, [orderDetails, processedOrderIds]);

    // For displaying all order statuses, including previously processed ones
    useEffect(() => {
        const updateDisplayStatuses = () => {
            const currentStatuses = [...deliveryStatuses];
            const displayedOrderIds = new Set(currentStatuses.map(status => status.orderId));

            // Add placeholder statuses for orders that were processed in previous sessions
            orderDetails.forEach(order => {
                const orderId = order.orderId.toString();
                if (processedOrderIds.has(orderId) && !displayedOrderIds.has(orderId)) {
                    currentStatuses.push({
                        orderId,
                        success: true,
                        message: 'Delivery already created'
                    });
                }
            });

            setDeliveryStatuses(currentStatuses);
        };

        updateDisplayStatuses();
    }, [processedOrderIds, orderDetails]);

    const handleTrackOrder = (e) => {
        e.preventDefault();
        console.log('Navigating to track page');
        // Force navigation by changing the window location directly
        window.location.href = '/track';
    };

    const handleReturnHome = (e) => {
        e.preventDefault();
        console.log('Navigating to home');
        // Force navigation by changing the window location directly
        window.location.href = '/';
    };

    return (
        <div className=" bg-white">
            <NavV2/>
            <div className="max-w-2xl mx-auto mt-10 p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for your order. It's being processed.
                        {isEmailSent && ' A confirmation email has been sent.'}
                    </p>
                    {error && <p className="text-red-500 mb-6">{error}</p>}

                    {orderDetails.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                            <h2 className="text-xl font-semibold mb-3">Order Details</h2>
                            {orderDetails.map((order, index) => (
                                <div key={index} className={index > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
                                    <p className="text-gray-700">Order ID: {order.orderId}</p>
                                    <p className="text-gray-700">Restaurant ID: {order.restaurantId}</p>
                                    <p className="text-gray-700">Total: ${order.totalAmount.toFixed(2)}</p>
                                    <div className="mt-2">
                                        {processedOrderIds.has(order.orderId.toString()) ? (
                                            <span className="text-green-500 text-sm">✓ Delivery created</span>
                                        ) : (
                                            <span className="text-blue-500 text-sm">⟳ Pending delivery</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleTrackOrder}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                        >
                            Track Order
                        </button>
                        <button
                            onClick={handleReturnHome}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;