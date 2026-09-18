import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardCheck,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    Save,
    X,
    RefreshCw,
    Search,
    Filter,
    Clock,
    MapPin,
    Phone,
    Package,
} from "lucide-react";
import AdminNavbar from "../../../components/admin/AdminNavbar.tsx";
import AdminSidebar from "../../../components/layout/AdminSideBar.tsx";
import Sidebar from "../../../components/Restaurants/Owner/Sidebar.tsx";

// Order status configurations with icons and colors
const ORDER_STATUS = {
    PLACED: { label: "Placed", color: "bg-indigo-100 text-indigo-800", lightColor: "bg-indigo-50" },
    CONFIRMED: { label: "Accepted", color: "bg-blue-100 text-blue-800", lightColor: "bg-blue-50" },
    PREPARING: { label: "Preparing", color: "bg-yellow-100 text-yellow-800", lightColor: "bg-yellow-50" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800", lightColor: "bg-purple-50" },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", lightColor: "bg-green-50" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", lightColor: "bg-red-50" }
};

// Status Icon component
const StatusIcon = ({ status }) => {
    switch (status) {
        case "PLACED":
            return <ClipboardCheck className="h-4 w-4" />;
        case "ACCEPTED":
            return <Package className="h-4 w-4" />;
        case "CONFIRMED":
            return <Clock className="h-4 w-4" />;
        case "PREPARING":
            return <Package className="h-4 w-4" />;
        case "OUT_FOR_DELIVERY":
            return <MapPin className="h-4 w-4" />;
        case "DELIVERED":
            return <ClipboardCheck className="h-4 w-4" />;
        case "CANCELLED":
            return <X className="h-4 w-4" />;
        default:
            return <Package className="h-4 w-4" />;
    }
};

// Card component for order
const OrderCard = ({ order, onEdit, onDelete, onUpdateStatus, isExpanded, toggleExpand }) => {
    const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800", lightColor: "bg-gray-50" };

    // Format date for better readability
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg shadow-sm mb-4 overflow-hidden transition-all duration-300 ${statusInfo.lightColor} hover:shadow-md`}
        >
            <div className="p-4 cursor-pointer flex justify-between items-center" onClick={toggleExpand}>
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-white p-2 rounded-full shadow-sm">
                        <StatusIcon status={order.status} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                    <span className="font-bold">${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t"
                    >
                        <div className="p-4 bg-white">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                                    <ul className="space-y-2">
                                        {Array.isArray(order.orderItems) && order.orderItems.map((item, index) => (
                                            <li key={item.id || index} className="flex justify-between items-center p-2 rounded bg-gray-50">
                                                <span>{item.quantity}x {item.itemName}</span>
                                                <span className="font-medium">${item.unitPrice ? item.unitPrice.toFixed(2) : "0.00"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">Customer Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-400" /> {order.contactPhone}</p>
                                        <p className="text-sm flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {order.deliveryAddress}</p>
                                        <p className="text-sm flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-400" /> Last Updated: {formatDate(order.lastUpdated)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(order);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(order.orderId);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>

                                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                    <div className="relative inline-block">
                                        <select
                                            className="pl-3 pr-8 py-2 bg-gray-100 border border-gray-300 rounded appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                const newStatus = e.target.value;
                                                if (newStatus) {
                                                    onUpdateStatus(order.orderId, newStatus);
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Update Status</option>
                                            {Object.keys(ORDER_STATUS)
                                                .filter(status => status !== order.status)
                                                .map(status => (
                                                    <option key={status} value={status}>
                                                        {ORDER_STATUS[status].label}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Edit Order Modal
const EditOrderModal = ({ order, formData, handleChange, saveChanges, cancelEdit }) => {
    return order ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Edit Order #{order.orderId}</h2>
                        <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                            <input
                                type="text"
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {Object.keys(ORDER_STATUS).map((status) => (
                                    <option key={status} value={status}>{ORDER_STATUS[status].label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3 justify-end">
                        <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => saveChanges(order.orderId)}
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    ) : null;
};

// Main Component
const RestaurantOrdersNew = () => {
    const { id } = useParams();
    const restaurantId = id || "123"; // Use params or default value
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [formData, setFormData] = useState({
        deliveryAddress: "",
        contactPhone: "",
        status: ""
    });
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            // API URL can be adjusted depending on your environment
            const apiUrl = `http://localhost:8082/api/v1/orders/restaurant/${restaurantId}`;
            const response = await axios.get(apiUrl);

            // Ensure orders is an array
            const ordersData = Array.isArray(response.data) ? response.data : [];
            setOrders(ordersData);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(`Failed to fetch orders: ${err.message || 'Unknown error'}`);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
        } else {
            setError("Restaurant ID is missing");
            setLoading(false);
        }
    }, [restaurantId]);

    // Toggle order expansion
    const toggleOrderExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(
                `http://localhost:8082/api/v1/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // Update the local state to reflect the change
            setOrders(orders.map(order =>
                order.orderId === orderId
                    ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() }
                    : order
            ));

            setError(null);
        } catch (err) {
            console.error('Error updating order status:', err);
            const errorMessage = err.response?.data?.message || 'Failed to update order status. Please try again.';
            setError(errorMessage);
        }
    };

    // Delete order
    const deleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await axios.delete(`http://localhost:8082/api/v1/orders/${orderId}`);

                // Remove the deleted order from local state
                const updatedOrders = orders.filter(order => order.orderId !== orderId);
                setOrders(updatedOrders);
                setError(null);
            } catch (err) {
                console.error('Error deleting order:', err);
                setError('Failed to delete order. Please try again.');
            }
        }
    };

    // Handle starting edit
    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            deliveryAddress: order.deliveryAddress,
            contactPhone: order.contactPhone,
            status: order.status
        });
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Save order updates
    const saveOrderChanges = async (orderId) => {
        try {
            const orderToUpdate = orders.find(order => order.orderId === orderId);
            const updatedOrder = {
                ...orderToUpdate,
                deliveryAddress: formData.deliveryAddress,
                contactPhone: formData.contactPhone,
                status: formData.status
            };

            await axios.put(`http://localhost:8082/api/v1/orders/${orderId}`, updatedOrder);

            // Update local state with the changes
            setOrders(orders.map(order =>
                order.orderId === orderId
                    ? { ...updatedOrder, lastUpdated: new Date().toISOString() }
                    : order
            ));

            // Reset editing state
            setEditingOrder(null);
            setError(null);
        } catch (err) {
            console.error('Error updating order:', err);
            setError('Failed to update order. Please try again.');
        }
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingOrder(null);
    };

    // Refresh orders
    const refreshOrders = async () => {
        setRefreshing(true);
        await fetchOrders();
        setTimeout(() => setRefreshing(false), 800);
    };

    // Filter orders by status and search term
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "" || order.status === filterStatus;
        const matchesSearch = searchTerm === "" ||
            order.orderId.toString().includes(searchTerm) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.contactPhone && order.contactPhone.includes(searchTerm));
        return matchesStatus && matchesSearch;
    });

    return (
        <div >

            <div className="ml-50"> <AdminNavbar/></div>

            <Sidebar/>
            {/* Main Content */}
            <div className="absolute container mx-auto p-4 max-w-6xl  ml-50 mt-20 ">
                {/* Dashboard Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Restaurant Orders</h1>
                            <p className="text-gray-500">View and manage all your customer orders</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            <button
                                onClick={refreshOrders}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                disabled={loading || refreshing}
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders by ID, address or phone"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {Object.keys(ORDER_STATUS).map((status) => (
                                    <option key={status} value={status}>{ORDER_STATUS[status].label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-yellow-50 border border-yellow-200 p-8 rounded-lg text-center"
                        >
                            <h2 className="text-xl font-medium text-yellow-800 mb-2">No Orders Found</h2>
                            <p className="text-yellow-700">There are currently no orders matching your criteria.</p>
                            {filterStatus && (
                                <button
                                    onClick={() => setFilterStatus("")}
                                    className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            <div className="space-y-2">
                                {filteredOrders.map((order) => (
                                    <OrderCard
                                        key={order.orderId}
                                        order={order}
                                        onEdit={handleEdit}
                                        onDelete={deleteOrder}
                                        onUpdateStatus={updateOrderStatus}
                                        isExpanded={expandedOrderId === order.orderId}
                                        toggleExpand={() => toggleOrderExpand(order.orderId)}
                                    />
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingOrder && (
                    <EditOrderModal
                        order={editingOrder}
                        formData={formData}
                        handleChange={handleChange}
                        saveChanges={saveOrderChanges}
                        cancelEdit={cancelEdit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default RestaurantOrdersNew;