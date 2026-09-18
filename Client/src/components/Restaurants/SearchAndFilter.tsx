import React from 'react';

interface SearchAndFilterProps {
    searchText: string;
    size?: number;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
                                                                    searchText,
                                                                    size = 10,
                                                                    onSearchChange,
                                                                    onSizeChange
                                                                }) => (
    <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-10">
            <div className="w-[400px] ">
                <label htmlFor="search" className="block text-[12px] font-medium text-gray-700 mb-1">
                    Search Restaurants
                </label>
                <input
                    type="text"
                    id="search"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name, location..."
                    value={searchText}
                    onChange={onSearchChange}
                />
            </div>
            <div className="w-1 md:w-[100px]">
                <label htmlFor="size" className="block text-[12px] font-medium text-gray-700 mb-1">
                    Items per page
                </label>
                <select
                    id="size"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={size}
                    onChange={onSizeChange}
                >

                    <option value="10" >10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    </div>
);
