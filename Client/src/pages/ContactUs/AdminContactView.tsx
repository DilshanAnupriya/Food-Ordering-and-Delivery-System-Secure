import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSideBar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { motion } from 'framer-motion';
import { Search, Trash2, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    comment: string;
}

const AdminContactView: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            const filtered = messages.filter(message =>
                message.name.toLowerCase().includes(searchText.toLowerCase()) ||
                message.email.toLowerCase().includes(searchText.toLowerCase()) ||
                message.comment.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredMessages(filtered);
        }
    }, [searchText, messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8082/api/v1/contactus/fetch/all`);
            if (response.data) {
                const validMessages = response.data.filter(
                    (msg: ContactMessage) => msg.id && msg.name && msg.email && msg.comment
                );
                setMessages(validMessages);
                setFilteredMessages(validMessages);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch contact messages');
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
                                <p className="text-gray-600 mt-1">Manage customer inquiries and feedback</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    placeholder="Search messages by name, email, or content..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Messages Content */}
                        <div className="bg-white rounded-lg shadow-sm">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h3 className="font-medium text-red-800">Error</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-8 text-center">
                                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                                        <Mail className="text-gray-500" size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Messages Found</h3>
                                    <p className="text-gray-500">There are no contact messages to display.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredMessages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-6 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">{message.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{message.email}</p>
                                                    <p className="text-gray-700 mt-3">{message.comment}</p>
                                                </div>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete message"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminContactView;