import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, ThumbsUp, Trash2, PenLine, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// ─── Star Rating Input ────────────────────────────────────────────────────────
const StarInput = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                >
                    <Star
                        size={28}
                        className={`transition-colors ${
                            star <= (hovered || value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

// ─── Star Display (read-only) ─────────────────────────────────────────────────
const StarDisplay = ({ value, size = 16 }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                className={star <= Math.round(value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'}
            />
        ))}
    </div>
);

// ─── Review Form ──────────────────────────────────────────────────────────────
const ReviewForm = ({ productId, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle]   = useState('');
    const [body, setBody]     = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen]     = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a star rating'); return; }
        if (!body.trim()) { toast.error('Please write your review'); return; }

        setSubmitting(true);
        try {
            await reviewsApi.createReview(productId, { rating, title, body });
            toast.success('Review submitted!');
            setOpen(false);
            setRating(0); setTitle(''); setBody('');
            onSubmitted();
        } catch (err) {
            toast.error(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-terracotta text-white rounded-xl font-semibold hover:bg-brand-terracotta/90 transition-colors shadow-md"
            >
                <PenLine size={18} />
                Write a review
            </button>
        );
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-brand-cream border border-brand-sand rounded-2xl p-6 space-y-4"
        >
            <h3 className="font-serif text-xl font-bold text-brand-black">Your Review</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                <StarInput value={rating} onChange={setRating} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Summarise your experience (optional)"
                    maxLength={120}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 resize-none"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-terracotta text-white rounded-xl font-semibold hover:bg-brand-terracotta/90 disabled:opacity-60 transition-colors"
                >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </motion.form>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductReviews = ({ productId }) => {
    const { user } = useAuth();

    // summary
    const [summary, setSummary] = useState(null);
    // paginated list
    const [reviews, setReviews]   = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage]         = useState(0);
    const PAGE_SIZE = 8;

    // filters
    const [sort, setSort]               = useState('recent');
    const [ratingFilter, setRatingFilter] = useState('');

    // loading
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // ── fetch summary ──
    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const data = await reviewsApi.getSummary(productId);
            setSummary(data);
        } catch {
            // non-critical
        } finally {
            setLoadingSummary(false);
        }
    }, [productId]);

    // ── fetch reviews ──
    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const data = await reviewsApi.getReviews(productId, {
                sort,
                ratingFilter: ratingFilter || undefined,
                page,
                size: PAGE_SIZE,
            });
            setReviews(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch {
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    }, [productId, sort, ratingFilter, page]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // reset to page 0 when filters change
    useEffect(() => { setPage(0); }, [sort, ratingFilter]);

    const handleHelpful = async (reviewId) => {
        if (!user) { toast.error('Please log in to mark reviews as helpful'); return; }
        try {
            const updated = await reviewsApi.markHelpful(reviewId);
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: updated.helpfulCount } : r));
        } catch {
            toast.error('Could not update helpful count');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete your review?')) return;
        try {
            await reviewsApi.deleteReview(reviewId);
            toast.success('Review deleted');
            fetchReviews();
            fetchSummary();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const onReviewSubmitted = () => {
        fetchSummary();
        fetchReviews();
    };

    // ── rating distribution bar widths ──
    const maxCount = summary
        ? Math.max(...Object.values(summary.ratingDistribution || {}), 1)
        : 1;

    return (
        <div className="py-8">
            <h2 className="font-serif text-2xl font-bold text-brand-black mb-8">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ── LEFT: Summary + write review ── */}
                <div className="lg:col-span-1 space-y-6">
                    {loadingSummary ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-16 bg-gray-200 rounded-xl" />
                            <div className="h-32 bg-gray-200 rounded-xl" />
                        </div>
                    ) : summary ? (
                        <>
                            {/* Average */}
                            <div className="text-center bg-brand-cream rounded-2xl p-6 border border-brand-sand">
                                <div className="text-6xl font-bold text-brand-black mb-1">
                                    {(summary.averageRating || 0).toFixed(1)}
                                </div>
                                <StarDisplay value={summary.averageRating || 0} size={22} />
                                <p className="text-gray-500 text-sm mt-2">
                                    {(summary.totalReviews || 0).toLocaleString()} review{summary.totalReviews !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Distribution bars */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = (summary.ratingDistribution || {})[stars] || 0;
                                    const pct   = summary.totalReviews
                                        ? Math.round((count / summary.totalReviews) * 100)
                                        : 0;
                                    return (
                                        <button
                                            key={stars}
                                            onClick={() => setRatingFilter(ratingFilter == stars ? '' : String(stars))}
                                            className={`flex items-center w-full gap-2 rounded-lg px-2 py-1 transition-colors ${
                                                ratingFilter == stars ? 'bg-yellow-50 ring-1 ring-yellow-300' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-sm w-3 text-gray-600">{stars}</span>
                                            <Star size={13} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}

                    {/* Write review button / form */}
                    {user && !summary?.currentUserReviewed && (
                        <ReviewForm productId={productId} onSubmitted={onReviewSubmitted} />
                    )}
                    {user && summary?.currentUserReviewed && (
                        <p className="text-sm text-gray-500 italic">You've already reviewed this product.</p>
                    )}
                    {!user && (
                        <p className="text-sm text-gray-500">
                            <a href="/login" className="text-brand-terracotta font-medium hover:underline">Log in</a> to write a review.
                        </p>
                    )}
                </div>

                {/* ── RIGHT: Review list ── */}
                <div className="lg:col-span-2">
                    {/* Sort / filter controls */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['recent', 'helpful'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setSort(s)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    sort === s
                                        ? 'bg-brand-terracotta text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s === 'recent' ? 'Most Recent' : 'Most Helpful'}
                            </button>
                        ))}
                        {ratingFilter && (
                            <button
                                onClick={() => setRatingFilter('')}
                                className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                            >
                                {ratingFilter} ★ only ✕
                            </button>
                        )}
                    </div>

                    {loadingReviews ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse border-b pb-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                                    <div className="h-16 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Star size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No reviews yet</p>
                            <p className="text-sm mt-1">Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${page}-${sort}-${ratingFilter}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-6">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {/* Avatar initial */}
                                                    <div className="w-9 h-9 rounded-full bg-brand-terracotta/20 flex items-center justify-center text-brand-terracotta font-bold text-sm flex-shrink-0">
                                                        {review.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-gray-900">{review.userName}</span>
                                                            {review.verifiedPurchase && (
                                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                                    <CheckCircle size={12} />
                                                                    Verified Purchase
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <StarDisplay value={review.rating} size={13} />
                                                            {review.title && (
                                                                <span className="text-sm font-medium text-gray-800">
                                                                    {review.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-gray-400">
                                                        {review.createdAt
                                                            ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                              })
                                                            : ''}
                                                    </span>
                                                    {user && user.id === review.userId && (
                                                        <button
                                                            onClick={() => handleDelete(review.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete review"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-gray-700 text-sm leading-relaxed mt-3 ml-11">
                                                {review.body}
                                            </p>

                                            <div className="flex items-center gap-3 mt-3 ml-11">
                                                <span className="text-xs text-gray-500">Helpful?</span>
                                                <button
                                                    onClick={() => handleHelpful(review.id)}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-terracotta transition-colors"
                                                >
                                                    <ThumbsUp size={13} />
                                                    {review.helpfulCount > 0 && (
                                                        <span>({review.helpfulCount})</span>
                                                    )}
                                                    Yes
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8">
                                    <span className="text-sm text-gray-500">
                                        Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalElements} reviews
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(p => p - 1)}
                                            disabled={page === 0}
                                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page >= totalPages - 1}
                                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
