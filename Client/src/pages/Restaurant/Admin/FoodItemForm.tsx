import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X,  AlertCircle } from 'lucide-react';
import { FoodItem, FoodItemRequest } from '../../../services/Restaurants/Fooditems';

interface FoodItemFormProps {
    onClose: () => void;
    onSubmit: (foodItem: FoodItemRequest) => Promise<void>;
    categories: string[];
    restaurantId: string;
    initialData?: FoodItem;
    isEditing?: boolean;
}

const FoodItemForm: React.FC<FoodItemFormProps> = ({
                                                       onClose,
                                                       onSubmit,
                                                       categories,
                                                       restaurantId,
                                                       initialData,
                                                       isEditing = false
                                                   }) => {
    const [formData, setFormData] = useState<FoodItemRequest>({
        name: '',
        type: '',
        category: categories.length > 0 ? categories[0] : '',
        price: 0,
        discount: 0,
        imageUrl: '',
        description: '',
        available: true,
        restaurantId
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // If editing, populate form with initial data
    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                name: initialData.name,
                type: initialData.type,
                category: initialData.category,
                price: initialData.price,
                discount: initialData.discount,
                imageUrl: initialData.imageUrl || '',
                description: initialData.description || '',
                available: initialData.available,
                restaurantId: initialData.restaurantId
            });
        }
    }, [isEditing, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            // Handle number inputs
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field when user makes a change
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.type.trim()) newErrors.type = 'Type is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.discount < 0 || formData.discount > 100) newErrors.discount = 'Discount must be between 0 and 100';
        if (!formData.description.trim()) newErrors.description = 'Description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ form: 'Failed to save food item. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {errors.form && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                        <AlertCircle size={18} />
                        <span>{errors.form}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name*
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="Enter food item name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category*
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.category ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                        </div>

                        {/* Type */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Type*
                            </label>
                            <input
                                type="text"
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.type ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="e.g., Vegetarian, Non-Veg, Dessert"
                            />
                            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
                        </div>

                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price*
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="0.00"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                        </div>

                        {/* Discount */}
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                id="discount"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.discount ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="0"
                            />
                            {errors.discount && <p className="mt-1 text-sm text-red-500">{errors.discount}</p>}
                        </div>

                        {/* Image URL */}
                        <div className="col-span-2">
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="imageUrl"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="https://example.com/food-image.jpg"
                                />
                                {formData.imageUrl && (
                                    <div className="w-12 h-12 rounded border border-gray-300 overflow-hidden">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.currentTarget.src = "/api/placeholder/48/48")}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Leave blank to use a placeholder image</p>
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="Describe the food item..."
                            ></textarea>
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Availability */}
                        <div className="col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="available"
                                    name="available"
                                    checked={formData.available}
                                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                                    Available for ordering
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 ${
                                loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditing ? 'Update Food Item' : 'Save Food Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default FoodItemForm;