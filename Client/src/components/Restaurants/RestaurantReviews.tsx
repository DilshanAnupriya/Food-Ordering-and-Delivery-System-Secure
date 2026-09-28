import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { useAuth } from '../../services/auth/authContext';

interface Review {
    review_id: string;
    customer_id: string;
    customer_name: string;
    restaurant_id: string;
    review_content: string;
    rating: number;
    created_at: string;
}

interface RestaurantReviewsProps {
    restaurantId: string;
}

export const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({ restaurantId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [rating, setRating] = useState<number>(5);
    const [reviewContent, setReviewContent] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchReviews = async () => {
        if (!restaurantId) return;
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8082/api/v1/restaurant-reviews/${restaurantId}/list?searchText=&page=0&size=20`);
            const data = await res.json();
            if (data.code === 200 && data.data && data.data.dataList) {
                setReviews(data.data.dataList);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [restaurantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewContent.trim()) return;

        try {
            setSubmitting(true);
            setMessage(null);

            const payload = {
                customer_id: user?.userId || '00019655-c2ba-4560-9977-ea8017ba204f',
                customer_name: user?.username || 'hirun',
                restaurant_id: restaurantId,
                review_content: reviewContent,
                rating: rating
            };

            const res = await fetch('http://localhost:8082/api/v1/restaurant-reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage('Review submitted successfully!');
                setReviewContent('');
                fetchReviews();
            } else {
                const errData = await res.json();
                setMessage(errData.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="border-t border-gray-200 pt-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="text-orange-500" size={28} />
                            Customer Reviews ({reviews.length})
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">See what customers are saying about this restaurant</p>
                    </div>
                </div>

                {/* Submit Review Box */}
                <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-6 mb-10 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Leave a Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-2xl focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={24}
                                            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                            <textarea
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                rows={3}
                                placeholder="Share your dining experience..."
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                required
                            />
                        </div>

                        {message && (
                            <p className="text-sm font-medium text-green-600">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow transition-colors disabled:opacity-50"
                        >
                            <Send size={18} />
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
                        No reviews yet for this restaurant. Be the first to leave one!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div
                                key={rev.review_id}
                                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{rev.customer_name}</h4>
                                            <span className="text-xs text-gray-400">
                                                {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200">
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-bold text-gray-700">{rev.rating}</span>
                                    </div>
                                </div>

                                {/* Render review content */}
                                <div
                                    className="text-gray-700 mt-3 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: rev.review_content }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
