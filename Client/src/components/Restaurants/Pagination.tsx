// components/Restaurants/Pagination.tsx
import React from 'react';
import SectionWrapper from "../../hoc/SectionWrapper.tsx";

interface PaginationProps {
    page: number,
    size: number,
    onPageChange: (page: number) => void,
    totalItems?: number,

}

const Pagination: React.FC<PaginationProps> = ({
                                                   page,
                                                   size,
                                                   totalItems,
                                                   onPageChange,
                                               }) => {
    // Calculate total pages

    const totalPages = Math.ceil(totalItems / size);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers: number[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are fewer than maxPagesToShow
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Calculate range of pages to show
            let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

            // Adjust if we're near the end
            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(0, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    // Modified: Always show pagination even if there's only one page
    // Removed the early return that was hiding pagination when totalPages <= 1

    return (
        <div className="mt-8 flex justify-between items-center mb-10">
            <div className="text-sm text-gray-600">
                Showing {totalItems > 0 ? page * size + 1 : 0} - {Math.min((page + 1) * size, totalItems)} of {totalItems}
            </div>
            <div className="flex space-x-1">
                {/* First page button */}
                <button
                    onClick={() => onPageChange(0)}
                    disabled={page === 0 || totalPages <= 1}
                    className={`px-3 py-1 rounded ${page === 0 || totalPages <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    First
                </button>

                {/* Previous button */}
                <button
                    onClick={() => onPageChange(Math.max(0, page - 1))}
                    disabled={page === 0 || totalPages <= 1}
                    className={`px-3 py-1 rounded ${page === 0 || totalPages <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Prev
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1 rounded ${pageNum === page ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {pageNum + 1}
                    </button>
                ))}

                {/* Next button */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || totalPages <= 1}
                    className={`px-3 py-1 rounded ${page >= totalPages - 1 || totalPages <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Next
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={page >= totalPages - 1 || totalPages <= 1}
                    className={`px-3 py-1 rounded ${page >= totalPages - 1 || totalPages <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Last
                </button>
            </div>
        </div>
    );
};

const WrapperPagination = SectionWrapper(Pagination);
export default WrapperPagination;