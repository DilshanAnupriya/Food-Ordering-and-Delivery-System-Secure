import React, { useState, useCallback } from 'react';
import sectionWrapper from "../../hoc/SectionWrapper.tsx";

// Define interface for component props
interface CategorySearchProps {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string) => void;
    searchText?: string; // Optional
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Optional
}

/**
 * CategorySearch component for displaying and selecting food categories
 */
const WrapperCategorySearch: React.FC<CategorySearchProps> = ({
                                                           categories,
                                                           selectedCategory,
                                                           onCategoryChange,
                                                       }) => {
    // Animation states
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // Memoize the handler to prevent unnecessary re-renders
    const handleCategoryClick = useCallback((category: string, e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent default behavior to avoid page reload
        e.preventDefault();
        e.stopPropagation(); // Also stop propagation to prevent event bubbling

        // Only update if different from current selection
        if (category !== selectedCategory) {
            // Call the parent handler to update selected category
            onCategoryChange(category);
        }
    }, [selectedCategory, onCategoryChange]);

    return (
        <div className="mb-10 w-full mt-5 ">
            <div className="relative w-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl shadow-lg">
                {/* Decorative food pattern background */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="food-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                                <path d="M10,10 L15,15 M5,15 L15,5" strokeWidth="1" stroke="white" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#food-pattern)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 py-8 px-6 md:px-8">
                    <h3 className="text-white font-bold text-2xl mb-6 pl-2 tracking-wide">
                        Explore Our Menu
                    </h3>

                    <div className="flex overflow-x-auto pb-3 scrollbar-hide gap-3">
                        {categories && categories.map((category) => (
                            <button
                                key={category}
                                type="button" // Explicitly set button type to prevent form submission
                                className={`
                  px-6 py-3 rounded-lg mr-1 whitespace-nowrap transition-all duration-300 font-medium
                  transform hover:-translate-y-1 relative
                  ${
                                    selectedCategory === category
                                        ? 'text-orange-500 bg-white shadow-md border-b-2 border-orange-500'
                                        : 'text-white bg-orange-800/40 backdrop-blur-sm hover:bg-white/20'
                                }
                `}
                                onClick={(e) => handleCategoryClick(category, e)}
                                onMouseEnter={() => setHoveredCategory(category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                <span className="relative z-10">
                  {category}
                    {selectedCategory === category && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-400"></span>
                    )}
                </span>

                                {/* Hover animation */}
                                {hoveredCategory === category && selectedCategory !== category && (
                                    <span className="absolute inset-0 bg-white/10 rounded-lg transform scale-105 animate-pulse"></span>
                                )}

                                {/* Selected state indicator */}
                                {selectedCategory === category && (
                                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategorySearch = sectionWrapper( WrapperCategorySearch)
export default React.memo(CategorySearch); // Use memo to prevent unnecessary re-renders