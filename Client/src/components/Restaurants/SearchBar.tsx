import React from "react";

const SearchBar: React.FC = () => {
    return (
        <div className="flex justify-center my-2">
            <div className="relative w-full max-w-md">
                <input
                    type="text"
                    placeholder="Search from menu..."
                    className="w-full px-4 py-2 rounded-full border border-gray-300 pl-10"
                />
                <svg
                    className="w-4 h-4 absolute left-3 top-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;