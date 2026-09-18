import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderItem, OrderStatus } from '../../types/Order/order';
import { orderService } from '../../services/Orders/orderService';
import { useAuth } from '../../services/auth/authContext';
import NavigationBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SubNav from '../../components/layout/SubNav';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NavV2 from "../../components/layout/NavV2.tsx";

// Fix for Leaflet icon issue
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number] | null) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

interface CartItem {
  foodItemId: string;
  foodName: string;
  quantity: number;
  price: number;
}

interface CartRestaurantGroup {
  restaurantName: string;
  items: CartItem[];
  totalPrice: number;
}

interface CartData {
  [key: string]: CartRestaurantGroup;
}

// Component for location selection
const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected delivery location</Popup>
    </Marker>
  ) : null;
};

interface FormOrder extends Omit<Order, 'id'> {
  userName: string;
  orderItems: OrderItem[];
}

const OrderForm = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isEditMode = Boolean(orderId);

  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
  const [multipleOrders, setMultipleOrders] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  const userId = user?.userId;

  const [order, setOrder] = useState<FormOrder>({
    userId: user?.userId || '',
    userName: user?.name || '',
    restaurantId: '',
    status: OrderStatus.PLACED,
    deliveryAddress: '',
    longitude: null,
    latitude: null,
    contactPhone: user?.phone || '',
    subtotal: 0,
    deliveryFee: 5,
    tax: 0,
    totalAmount: 0,
    orderItems: []
  });

  // Reference to the map component
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Handle params from URL
    const queryParams = new URLSearchParams(location.search);
    const restaurantId = queryParams.get('restaurantId');


    // Fetch cart data from sessionStorage
    const storedCartData = sessionStorage.getItem('cartRestaurantGroups');

    if (!user?.userId) {
      alert('Please log in to place an order');
      navigate('/login');
      return;
    }

    if (storedCartData) {
      const parsedData: CartData = JSON.parse(storedCartData);
      setCartData(parsedData);

      // Get all restaurant IDs from cart and ensure they are valid
      const allRestaurantIds = Object.keys(parsedData).filter(id => id && id !== 'null' && id !== 'undefined');
      if (allRestaurantIds.length === 0) {
        alert('No valid restaurants found in cart. Redirecting to cart page.');
        navigate('/cart');
        return;
      }
      
      setRestaurantIds(allRestaurantIds);

      // Check if there are multiple restaurants
      if (allRestaurantIds.length > 1) {
        setMultipleOrders(true);
      }

      // If a specific restaurant ID is provided in URL, validate and use it
      if (restaurantId && allRestaurantIds.includes(restaurantId)) {
        const index = allRestaurantIds.indexOf(restaurantId);
        setCurrentRestaurantIndex(index);
        loadRestaurantItems(parsedData, restaurantId);
      } else {
        // Otherwise, start with the first valid restaurant in the list
        loadRestaurantItems(parsedData, allRestaurantIds[0]);
      }
    } else if (isEditMode) {
      fetchOrder();
    } else {
      // If no cart data and not in edit mode, redirect to cart
      alert('No items found in cart. Redirecting to cart page.');
      navigate('/cart');
    }

    setupLocation();
  }, [location.search, isEditMode, navigate, user]);

  const fetchOrder = async () => {
    if (isEditMode) {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId!);
        setOrder(data as FormOrder);

        // Set position if latitude and longitude exist
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        alert('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    }
  };

  const setupLocation = () => {
    // Get user's current location when component mounts
    if (navigator.geolocation && !isEditMode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);

          // Set order's latitude and longitude
          setOrder(prev => ({
            ...prev,
            latitude,
            longitude
          }));

          // Reverse geocode to get address
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default position (if user denies location access)
          setPosition([6.9271, 79.8612]);  
        }
      );
    }

    setMapLoaded(true);
  };

  const loadRestaurantItems = (cartData: CartData, restaurantId: string) => {
    const restaurantData = cartData[restaurantId];

    if (!restaurantData) {
      console.error('Restaurant data not found:', restaurantId);
      return;
    }

    // Convert cart items to order items
    const orderItems: OrderItem[] = restaurantData.items.map(item => ({
      menuItemId: String(item.foodItemId),
      itemName: item.foodName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.price),
      totalPrice: Number(item.price) * Number(item.quantity)
    }));

    // Calculate totals with proper number handling
    const subtotal = Number(restaurantData.totalPrice);
    const tax = Number((subtotal * 0.1).toFixed(2)); // 10% tax
    const deliveryFee = Number(order.deliveryFee);
    const totalAmount = Number((subtotal + tax + deliveryFee).toFixed(2));

    // Update order with restaurant specific data, preserving user data
    setOrder(prev => ({
      ...prev,
      restaurantId: (restaurantId),
      orderItems: orderItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount
    }));

    setLoading(false);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();

      if (data.display_name) {
        setOrder(prev => ({
          ...prev,
          deliveryAddress: data.display_name
        }));
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setOrder(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    // Get address from coordinates
    await reverseGeocode(lat, lng);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // For new orders, keep status as PLACED
    if (!isEditMode && name === 'status') {
      return;
    }

    setOrder({
      ...order,
      [name]: name === 'userId' || name === 'restaurantId' ? parseInt(value) || 0 : value
    });
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...order.orderItems];

    if (field === 'quantity' || field === 'unitPrice') {
      // Fix for NaN - use parseFloat and handle empty values
      const numValue = value === '' ? 0 : parseFloat(value as string);

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: isNaN(numValue) ? 0 : numValue
      };

      // Recalculate total price for this item
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? (isNaN(numValue) ? 0 : numValue) : updatedItems[index].quantity;
        const unitPrice = field === 'unitPrice' ? (isNaN(numValue) ? 0 : numValue) : updatedItems[index].unitPrice;
        updatedItems[index].totalPrice = quantity * unitPrice;
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'menuItemId' ? parseInt(value as string) || 0 : value
      };
    }

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax + order.deliveryFee;

    setOrder({
      ...order,
      orderItems: updatedItems,
      subtotal,
      tax,
      totalAmount
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrder({
      ...order,
      deliveryAddress: e.target.value
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);

          // Set order's latitude and longitude
          setOrder(prev => ({
            ...prev,
            latitude,
            longitude
          }));

          // Reverse geocode to get address
          reverseGeocode(latitude, longitude);

          // Center map on new position
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Required field validation with specific messages
    if (!order.userId) {
      alert('Please log in to place an order');
      return;
    }

    if (!order.restaurantId) {
      alert('Invalid restaurant selection. Please try again');
      return;
    }

    if (!order.deliveryAddress.trim()) {
      alert('Please select a delivery address or use the map to choose a location');
      return;
    }

    if (!order.contactPhone.trim()) {
      alert('Please provide a contact phone number for delivery updates');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-()]{8,}$/;
    if (!phoneRegex.test(order.contactPhone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (order.orderItems.length === 0) {
      alert('Your order must contain at least one item');
      return;
    }

    // Validate coordinates
    if ((order.latitude === null && order.longitude !== null) || 
        (order.latitude !== null && order.longitude === null)) {
      alert('Please select a valid delivery location on the map');
      return;
    }

    // Validate prices
    if (order.subtotal <= 0 || order.totalAmount <= 0) {
      alert('Order amounts must be greater than zero');
      return;
    }

    for (const item of order.orderItems) {
      if (item.quantity <= 0 || item.unitPrice <= 0 || item.totalPrice <= 0) {
        alert('All item quantities and prices must be greater than zero');
        return;
      }
    }

    try {
      // Format data and submit
      const orderData = {
        ...order,
        userId: String(order.userId),
        restaurantId: String(order.restaurantId),
        subtotal: Number(Number(order.subtotal).toFixed(2)),
        deliveryFee: Number(Number(order.deliveryFee).toFixed(2)),
        tax: Number(Number(order.tax).toFixed(2)),
        totalAmount: Number(Number(order.totalAmount).toFixed(2)),
        latitude: order.latitude !== null ? Number(Number(order.latitude).toFixed(6)) : null,
        longitude: order.longitude !== null ? Number(Number(order.longitude).toFixed(6)) : null,
        orderItems: order.orderItems.map(item => ({
          ...item,
          menuItemId: String(item.menuItemId),
          quantity: Number(item.quantity),
          unitPrice: Number(Number(item.unitPrice).toFixed(2)),
          totalPrice: Number(Number(item.totalPrice).toFixed(2))
        }))
      };

      if (isEditMode && orderId) {
        // Update existing order
        await orderService.updateOrder(parseInt(orderId), orderData);
        alert('Order updated successfully!');
        navigate('/orders');
      } else {
        // Create new order
        const createdOrder = await orderService.createOrder(orderData);

        // Store order details in session storage
        const orderDetail = {
          orderId: createdOrder.orderId,
          restaurantId: createdOrder.restaurantId,
          userId: createdOrder.userId,
          totalAmount: createdOrder.totalAmount
        };

        // Get existing orders array or initialize new one
        const existingOrders = JSON.parse(sessionStorage.getItem('orderDetail') || '[]');
        existingOrders.push(orderDetail);
        sessionStorage.setItem('orderDetail', JSON.stringify(existingOrders));

        // Handle multiple restaurant orders
        if (multipleOrders) {
          setCompletedOrders([...completedOrders, createdOrder]);

          if (currentRestaurantIndex < restaurantIds.length - 1) {
            const nextIndex = currentRestaurantIndex + 1;
            setCurrentRestaurantIndex(nextIndex);
            loadRestaurantItems(cartData!, restaurantIds[nextIndex]);
            alert(`Order for ${cartData![restaurantIds[currentRestaurantIndex]].restaurantName} created successfully! Now creating order for ${cartData![restaurantIds[nextIndex]].restaurantName}.`);
            return;
          }
        }

        alert('Order(s) created successfully!');
        // Clear cart data from session storage
        sessionStorage.removeItem('cartRestaurantGroups');
        // Navigate to orders list
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please check all required fields and try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Get current restaurant name
  const currentRestaurantName = cartData && restaurantIds.length > 0
    ? cartData[restaurantIds[currentRestaurantIndex]]?.restaurantName || `Restaurant ${order.restaurantId}`
    : `Restaurant ${order.restaurantId}`;

  return (
    <div className="bg-white relative overflow-hidden">
      <div className="w-full">
        <NavV2 />
      </div>
      <div className="container mx-auto px-4 py-8 bg-white rounded-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            {isEditMode ? 'Edit Order' : 'Create New Order'}
            {multipleOrders && ` (${currentRestaurantIndex + 1}/${restaurantIds.length})`}
          </h1>

          {multipleOrders && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-700">Creating order {currentRestaurantIndex + 1} of {restaurantIds.length} -
                <span className="font-semibold"> {currentRestaurantName}</span>
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-orange-100">
          {/* User Information Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={userId}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={order.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:ring focus:ring-orange-200"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                {isEditMode ? (
                  <select
                    name="status"
                    value={order.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:ring focus:ring-orange-200"
                  >
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={OrderStatus.PLACED}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Restaurant Information</h2>
            <div>
              <label className="block text-gray-700 mb-2">Restaurant</label>
              <input
                type="text"
                value={currentRestaurantName}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
              />
              <input
                type="hidden"
                name="restaurantId"
                value={order.restaurantId || ''}
              />
            </div>
          </div>

          {/* Map and location section */}
          <div className="relative z-10  mb-6 ">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Delivery Location</h2>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors mb-4"
                  >
                    Use My Current Location
                  </button>

                  {/* Map container */}
                  <div className="border border-orange-200 rounded shadow-md" style={{ height: '400px' }}>
                    {mapLoaded && (
                      <MapContainer
                        center={position || [6.9271, 79.8612]} // Default to Colombo if no position
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker
                          position={position}
                          setPosition={setPosition}
                          onLocationSelect={handleLocationSelect}
                        />
                      </MapContainer>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    Click on the map to select delivery location or use your current location
                  </div>
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    name="deliveryAddress"
                    value={order.deliveryAddress}
                    onChange={handleAddressChange}
                    required
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded focus:border-orange-500 focus:ring focus:ring-orange-200"
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Latitude</label>
                    <input
                      type="text"
                      readOnly
                      value={order.latitude !== null ? order.latitude.toFixed(6) : ''}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Longitude</label>
                    <input
                      type="text"
                      readOnly
                      value={order.longitude !== null ? order.longitude.toFixed(6) : ''}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Order Items</h2>

            {order.orderItems.length === 0 ? (
              <div className="text-center py-4 bg-orange-50 rounded border border-orange-200">
                <p className="text-orange-700">No items loaded. Please return to cart and try again.</p>
              </div>
            ) : (
              <div className="bg-white rounded-md shadow-sm overflow-hidden border border-orange-100">
                <table className="min-w-full divide-y divide-orange-200">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-orange-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-orange-700 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-orange-700 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-orange-100">
                    {order.orderItems.map((item, index) => (
                      <tr key={index} className="hover:bg-orange-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                              <div className="text-sm text-gray-500">Item ID: {item.menuItemId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => item.quantity > 1 && handleItemChange(index, 'quantity', item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <span className="text-orange-600">-</span>
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
                            >
                              <span className="text-orange-600">+</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-orange-500">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-500">Order Summary</h2>
            <div className="bg-orange-50 p-4 rounded border border-orange-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-700">Subtotal:</div>
                <div className="text-right text-gray-800">${order.subtotal.toFixed(2)}</div>

                <div className="text-gray-700">Tax (10%):</div>
                <div className="text-right text-gray-800">${order.tax.toFixed(2)}</div>

                <div className="text-gray-700">Delivery Fee:</div>
                <div className="text-right text-gray-800">${order.deliveryFee.toFixed(2)}</div>

                <div className="font-semibold border-t border-orange-200 pt-2 mt-2 text-orange-600">Total:</div>
                <div className="text-right font-semibold border-t border-orange-200 pt-2 mt-2 text-orange-600">${order.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
              disabled={order.orderItems.length === 0}
            >
              {isEditMode ? 'Update Order' : 
                multipleOrders && currentRestaurantIndex < restaurantIds.length - 1
                ? `Place Order & Continue (${currentRestaurantIndex + 1}/${restaurantIds.length})`
                : 'Place Order'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditMode ? '/orders' : '/cart')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              {isEditMode ? 'Cancel' : 'Back to Cart'}
            </button>
          </div>
        </form>

        {/* Information about completed orders */}
        {completedOrders.length > 0 && (
          <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-700 mb-2">Orders Completed</h2>
            <div className="space-y-2">
              {completedOrders.map((completedOrder, index) => (
                <div key={index} className="p-3 bg-white rounded shadow-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Order {completedOrder.id}:</span> {cartData?.[completedOrder.restaurantId]?.restaurantName || 'Restaurant'} - 
                    <span className="text-green-600 font-medium"> ${completedOrder.totalAmount.toFixed(2)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default OrderForm;