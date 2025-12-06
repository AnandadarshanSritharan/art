import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import api from '../api/axios';
import './AllArtworksPage.css'; // For masonry styles

interface Artwork {
    _id: string;
    title: string;
    price: number;
    image: string;
    stock: number;
    artist: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    category: {
        _id: string;
        name: string;
    };
}

interface Category {
    _id: string;
    name: string;
}

interface PaginatedResponse {
    artworks: Artwork[];
    page: number;
    pages: number;
    total: number;
    hasMore: boolean;
}

// Helper function to get full image URL
const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
};

const AllArtworksPage: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Filters
    const [showFilters, setShowFilters] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [availability, setAvailability] = useState<'all' | 'in-stock' | 'sold'>('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
    const [priceFilterApplied, setPriceFilterApplied] = useState(false);

    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    // Initialize filters from URL
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        }
    }, [categoryParam]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastArtworkRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== searchInput) {
                setSearchQuery(searchInput);
                setPage(1);
                setArtworks([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch artworks
    useEffect(() => {
        let isMounted = true;
        const fetchArtworks = async () => {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', '24');
                if (searchQuery) params.append('search', searchQuery);

                selectedCategories.forEach(cat => {
                    params.append('category', cat);
                });

                if (availability !== 'all') {
                    params.append('availability', availability);
                }

                if (priceFilterApplied) {
                    params.append('minPrice', priceRange.min.toString());
                    params.append('maxPrice', priceRange.max.toString());
                }

                const { data } = await api.get<PaginatedResponse>('/artworks', { params });

                if (!isMounted) return;

                if (page === 1) {
                    setArtworks(data.artworks);
                } else {
                    setArtworks(prev => [...prev, ...data.artworks]);
                }

                setHasMore(data.hasMore);
                setLoading(false);
                setLoadingMore(false);
            } catch (error) {
                if (!isMounted) return;
                console.error('Failed to fetch artworks', error);
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchArtworks();

        return () => {
            isMounted = false;
        };
    }, [page, searchQuery, selectedCategories, availability, priceFilterApplied]);

    // Reset when filters change
    const handleFilterChange = () => {
        setPage(1);
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId];
            handleFilterChange();
            return newCategories;
        });
    };

    const handleAvailabilityChange = (value: 'all' | 'in-stock' | 'sold') => {
        setAvailability(value);
        handleFilterChange();
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange({ min, max });
        setPriceFilterApplied(true);
        handleFilterChange();
    };

    const breakpointColumns = {
        default: 4,
        1536: 4,
        1280: 3,
        1024: 3,
        768: 2,
        640: 1
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="flex">
                {/* Filter Panel */}
                <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0`}>
                    <div className="p-6 space-y-6 h-screen overflow-y-auto">
                        {/* Search Bar */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Artwork or artist..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Category</h3>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <label key={category._id} className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category._id)}
                                            onChange={() => toggleCategory(category._id)}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Availability Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Availability</h3>
                            <div className="space-y-2">
                                {['all', 'in-stock', 'sold'].map(option => (
                                    <label key={option} className="flex items-center cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={availability === option}
                                            onChange={() => handleAvailabilityChange(option as any)}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition capitalize">
                                            {option === 'all' ? 'All' : option === 'in-stock' ? 'In Stock' : 'Sold'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Price Range</h3>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    onClick={() => handlePriceChange(priceRange.min, priceRange.max)}
                                    className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setSelectedCategories([]);
                                setAvailability('all');
                                setPriceRange({ min: 0, max: 1000000 });
                                setPriceFilterApplied(false);
                                handleFilterChange();
                            }}
                            className="w-full border-2 border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                                    </svg>
                                    {showFilters ? 'Hide' : 'Show'} Filters
                                </button>
                                <h1 className="text-2xl font-bold font-serif text-gray-900">Collection</h1>
                            </div>
                            <p className="text-sm text-gray-500">
                                {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
                            </p>
                        </div>
                    </div>

                    {/* Artworks Grid */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : artworks.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="mb-6 text-gray-200">
                                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <p className="text-xl text-gray-900 font-serif mb-2">No artworks found</p>
                                <p className="text-gray-500">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <>
                                <Masonry
                                    breakpointCols={breakpointColumns}
                                    className="masonry-grid"
                                    columnClassName="masonry-grid-column"
                                >
                                    {artworks.map((artwork, index) => (
                                        <div
                                            key={artwork._id}
                                            ref={index === artworks.length - 1 ? lastArtworkRef : null}
                                            className="mb-6"
                                        >
                                            <Link
                                                to={`/artwork/${artwork._id}`}
                                                className="block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                                            >
                                                <div className="relative overflow-hidden">
                                                    <img
                                                        src={getImageUrl(artwork.image)}
                                                        alt={artwork.title}
                                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    {artwork.stock === 0 && (
                                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                            Sold
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </div>
                                                <div className="p-4">
                                                    <h2 className="text-lg font-bold font-serif text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                                        {artwork.title}
                                                    </h2>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        by <span className="font-medium text-gray-700">{artwork.artist.name}</span>
                                                    </p>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                        <span className="text-xl font-bold text-gray-900 font-serif">
                                                            ${artwork.price.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                                                            {artwork.category.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </Masonry>

                                {/* Loading More Indicator */}
                                {loadingMore && (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                )}

                                {/* No More Results */}
                                {!hasMore && artworks.length > 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No more artworks to load
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllArtworksPage;
