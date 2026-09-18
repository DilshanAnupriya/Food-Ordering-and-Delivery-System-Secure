import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../components/layout/AdminSideBar";
import {
    AlertCircle,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    UserCog,
    Filter,
    RefreshCw,
    Users,
    X
} from "lucide-react";

// Type definitions
interface User {
    userId: string;
    username: string;
    fullName: string;
    enabled: boolean;
    roles: string[];
}

interface PaginatedResponse {
    content: User[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const AdminUser: React.FC = () => {
    // State variables
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    // @ts-ignore
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [searchText, setSearchText] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
    const [updateFormData, setUpdateFormData] = useState({
        fullName: "",
        username: "",
        enabled: true
    });
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // API base URL
    const API_BASE_URL = "http://localhost:8082";

    // Fetch users on component mount and when dependencies change
    useEffect(() => {
        if (!isSessionExpired) {
            fetchUsers();
        }
    }, [page, size, isSessionExpired]);

    // Reset success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle session expiration
    const handleSessionExpired = () => {
        setIsSessionExpired(true);
        setError("Your session has expired. Please log in again.");
    };

    // Fetch users from API
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });

            if (searchText) {
                queryParams.append("searchText", searchText);
            }

            // Use API_BASE_URL constant for endpoint URL
            const response = await fetch(`${API_BASE_URL}/api/v1/users?${queryParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            // Check for session expiration or unauthorized access
            if (response.status === 401 || response.status === 403) {
                handleSessionExpired();
                return;
            }

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                    handleSessionExpired();
                    return;
                }
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            // Try to parse as JSON, with fallback error handling
            let responseData;
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse server response as JSON:", text.substring(0, 100) + "...");
                throw new Error("Server returned an invalid response format. Please try again later.");
            }

            // Check if result has the expected structure
            if (!responseData.data) {
                throw new Error("Received invalid data format from server");
            }

            const data = responseData.data as PaginatedResponse;

            setUsers(data.content);
            setTotalPages(data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            setLoading(false);
        }
    };

    // Filter users based on status and role
    const filteredUsers = users.filter(user => {
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.enabled) ||
            (statusFilter === "inactive" && !user.enabled);

        const matchesRole = roleFilter === "all" ||
            user.roles.some(role => role.includes(roleFilter.toUpperCase()));

        return matchesStatus && matchesRole;
    });

    // Retry authentication
    const handleRetryLogin = () => {
        setError(null);
        setIsSessionExpired(false);
        window.location.href = "/login";
    };

    // Handle opening update modal
    const handleUpdateClick = (user: User) => {
        setSelectedUser(user);
        setUpdateFormData({
            fullName: user.fullName,
            username: user.username,
            enabled: user.enabled
        });
        setShowUpdateModal(true);
    };

    // Handle opening delete modal
    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    // Handle opening role change modal
    const handleRoleClick = (user: User) => {
        setSelectedUser(user);
        const availableRoles = ["ADMIN", "USER", "RESTAURANT_OWNER", "DELIVERY_PERSON"];
        const newRole = availableRoles.find(role => !user.roles.includes("ROLE_" + role)) || "USER";
        setSelectedRole(newRole);
        setShowRoleModal(true);
    };

    // Handle update form input changes
    const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldName = name === "isEnabled" ? "enabled" : name;

        setUpdateFormData({
            ...updateFormData,
            [fieldName]: type === "checkbox" ? checked : value
        });
    };

    // Generic API call handler with improved error handling
    const apiCall = async (url: string, method: string, body?: any) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const headers: HeadersInit = {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            };

            if (body) {
                headers["Content-Type"] = "application/json";
            }

            console.log(`Making ${method} request to ${url} with body:`, body);

            const response = await fetch(`${API_BASE_URL}${url}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });

            if (response.status === 401 || response.status === 403) {
                handleSessionExpired();
                return { success: false };
            }

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("text/html")) {
                    handleSessionExpired();
                    return { success: false };
                }

                let errorMessage = `${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Ignore JSON parsing errors in error responses
                }

                throw new Error(`Request failed: ${errorMessage}`);
            }

            if (method === "DELETE") {
                return { success: true };
            }

            try {
                const result = await response.json();
                return { success: true, data: result };
            } catch (e) {
                return { success: true };
            }
        } catch (err) {
            console.error(`${method} request error:`, err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return { success: false };
        }
    };

    // Handle user update with improved error handling
    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        const payload = {
            ...updateFormData,
            enabled: Boolean(updateFormData.enabled)
        };

        const result = await apiCall(
            `/api/v1/users/${selectedUser.userId}`,
            "PUT",
            payload
        );

        if (result.success) {
            setShowUpdateModal(false);
            setSuccessMessage("User updated successfully");
            fetchUsers();
        }
    };

    // Handle user deletion with improved error handling
    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        const result = await apiCall(
            `/api/v1/users/${selectedUser.userId}`,
            "DELETE"
        );

        if (result.success) {
            setShowDeleteModal(false);
            setSuccessMessage("User deleted successfully");
            fetchUsers();
        }
    };

    // Handle role change with improved error handling
    const handleChangeRole = async () => {
        if (!selectedUser || !selectedRole) return;

        const result = await apiCall(
            `/api/v1/users/change-role`,
            "PATCH",
            {
                userId: selectedUser.userId,
                roleName: selectedRole
            }
        );

        if (result.success) {
            setShowRoleModal(false);
            setSuccessMessage("User role updated successfully");
            fetchUsers();
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = () => {
        setPage(0);
        fetchUsers();
    };

    // Apply filters
    const applyFilters = () => {
        setPage(0);
        setShowFilters(false);
    };

    // Reset filters
    const resetFilters = () => {
        setStatusFilter("all");
        setRoleFilter("all");
        setSearchText("");
        setPage(0);
        fetchUsers();
    };

    // Dropdown animation variant
    const dropdownVariants = {
        hidden: { opacity: 0, height: 0, overflow: "hidden" },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } }
    };

    // Modal animation variant
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    // Table row animation variant
    const tableRowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        })
    };

    // Alert animation variant
    const alertVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    // Show authentication error UI if session expired
    if (isSessionExpired) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center">
                <motion.div
                    className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center text-red-600 mb-4">
                        <AlertCircle size={28} className="mr-3" />
                        <h2 className="text-2xl font-bold">Session Expired</h2>
                    </div>
                    <p className="text-gray-700 mb-8 text-lg">
                        Your session has expired or you are not authorized to access this page.
                        Please log in again to continue.
                    </p>
                    <motion.button
                        onClick={handleRetryLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-blue-800 shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Go to Login
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar />
                <main className="flex-1 overflow-y-auto mt-15 p-6">
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div className="flex items-center">
                                <motion.div
                                    className="bg-blue-100 p-3 rounded-lg mr-4"
                                    whileHover={{ rotate: 10 }}
                                >
                                    <Users size={24} className="text-blue-600" />
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                                    <p className="text-gray-500">Manage users, roles and permissions</p>
                                </div>
                            </div>

                            {/* Search and filter section */}
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchText}
                                        onChange={handleSearchChange}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleSearchSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Search size={16} className="mr-2" />
                                    Search
                                </motion.button>

                                <motion.button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Filter size={16} className="mr-2" />
                                    {showFilters ? "Hide Filters" : "Filters"}
                                </motion.button>

                                <motion.button
                                    onClick={() => fetchUsers()}
                                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                                    whileHover={{ scale: 1.03, rotate: 180 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <RefreshCw size={16} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Filters section */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200"
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Roles</option>
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                                <option value="restaurant_owner">Restaurant Owner</option>
                                                <option value="delivery_person">Delivery Person</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end space-x-2">
                                            <motion.button
                                                onClick={applyFilters}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                Apply
                                            </motion.button>
                                            <motion.button
                                                onClick={resetFilters}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                Reset
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success message */}
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center"
                                    variants={alertVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <CheckCircle size={20} className="mr-3" />
                                    <span className="flex-1">{successMessage}</span>
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="text-green-700 hover:bg-green-100 p-1 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center"
                                    variants={alertVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <AlertCircle size={20} className="mr-3" />
                                    <span className="flex-1">{error}</span>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-red-700 hover:bg-red-100 p-1 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* User table */}
                        <div className="overflow-x-auto bg-white rounded-xl">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">Full Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">Username</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">Roles</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 border-b">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <motion.div
                                                className="flex justify-center items-center"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <RefreshCw size={32} className="text-blue-500" />
                                            </motion.div>
                                            <p className="mt-2 text-gray-500">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <p className="text-gray-500">No users found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.userId}
                                            className="border-b hover:bg-blue-50 transition-colors duration-150"
                                            variants={tableRowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            custom={index}
                                        >
                                            <td className="px-6 py-4">{user.fullName}</td>
                                            <td className="px-6 py-4">{user.username}</td>
                                            <td className="px-6 py-4">
                                                <motion.span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {user.enabled ? 'Active' : 'Inactive'}
                                                </motion.span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role, index) => (
                                                        <motion.span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            {role.replace('ROLE_', '')}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        onClick={() => handleUpdateClick(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                        whileHover={{ scale: 1.15, backgroundColor: "#dbeafe" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title="Edit User"
                                                    >
                                                        <Edit size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleRoleClick(user)}
                                                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                                                        whileHover={{ scale: 1.15, backgroundColor: "#f3e8ff" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title="Change Role"
                                                    >
                                                        <UserCog size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                        whileHover={{ scale: 1.15, backgroundColor: "#fee2e2" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredUsers.length} of {size * totalPages} users
                            </div>
                            <div className="flex items-center space-x-4">
                                <motion.button
                                    onClick={() => page > 0 && setPage(page - 1)}
                                    disabled={page === 0}
                                    className={`p-2 rounded-lg flex items-center ${
                                        page === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    whileHover={page > 0 ? { scale: 1.05 } : {}}
                                    whileTap={page > 0 ? { scale: 0.95 } : {}}
                                >
                                    <ChevronLeft size={20} />
                                    <span className="ml-1">Previous</span>
                                </motion.button>
                                <span className="text-gray-700 font-medium">
                  Page {page + 1} of {totalPages || 1}
                </span>
                                <motion.button
                                    onClick={() => page < totalPages - 1 && setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className={`p-2 rounded-lg flex items-center ${
                                        page >= totalPages - 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    whileHover={page < totalPages - 1 ? { scale: 1.05 } : {}}
                                    whileTap={page < totalPages - 1 ? { scale: 0.95 } : {}}
                                >
                                    <span className="mr-1">Next</span>
                                    <ChevronRight size={20} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Update User Modal */}
            <AnimatePresence>
                {showUpdateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Update User</h2>
                                <motion.button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={updateFormData.fullName}
                                    onChange={handleUpdateInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={updateFormData.username}
                                    onChange={handleUpdateInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="mb-6 flex items-center bg-gray-50 p-3 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="isEnabled"
                                    id="isEnabled"
                                    checked={updateFormData.enabled}
                                    onChange={handleUpdateInputChange}
                                    className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition-all"
                                />
                                <label htmlFor="isEnabled" className="text-gray-700 font-medium">Active Account</label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleUpdateUser}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Update
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete User Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Delete User</h2>
                                <motion.button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center text-red-600 mb-2">
                                    <AlertCircle size={20} className="mr-2" />
                                    <h3 className="font-semibold">Confirm Deletion</h3>
                                </div>
                                <p className="text-gray-700">
                                    Are you sure you want to delete <span className="font-semibold">{selectedUser?.fullName}</span>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleDeleteUser}
                                    className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium shadow-sm transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Change Role Modal */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div
                            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Change User Role</h2>
                                <motion.button
                                    onClick={() => setShowRoleModal(false)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center mb-3">
                                    <UserCog size={20} className="mr-2 text-blue-600" />
                                    <span className="font-semibold text-gray-700">
                    User: <span className="text-blue-600">{selectedUser?.fullName}</span>
                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <p className="text-sm text-gray-600 w-full">Current roles:</p>
                                    {selectedUser?.roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                        >
                      {role.replace('ROLE_', '')}
                    </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Select New Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select a role</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                    <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                                    <option value="DELIVERY_PERSON">Delivery Person</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleChangeRole}
                                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium shadow-sm transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!selectedRole}
                                >
                                    Change Role
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUser;