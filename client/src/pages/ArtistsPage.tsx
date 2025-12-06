import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

interface Artist {
    _id: string;
    name: string;
    bio?: string;
    profileImage?: string;
}

interface PaginatedResponse {
    artists: Artist[];
    page: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}

import { getImageUrl } from '../utils/image';

const ArtistsPage: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const fetchArtists = async () => {
            setLoading(true);
            try {
                const { data } = await api.get<PaginatedResponse>('/artists', {
                    params: {
                        page,
                        limit: 20,
                        search: searchQuery
                    }
                });
                setArtists(data.artists);
                setTotalPages(data.pages);
                setTotal(data.total);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load artists');
                setLoading(false);
            }
        };

        fetchArtists();
    }, [page, searchQuery]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
            setPage(1); // Reset to page 1 when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 border rounded-lg transition ${i === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    const startIndex = (page - 1) * 20 + 1;
    const endIndex = Math.min(page * 20, total);

    return (
        <div className="min-h-screen bg-stone-50 py-16">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 font-serif text-gray-900">Our Artists</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Discover the talented creators behind the masterpieces. Explore their portfolios and find the perfect addition to your collection.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search artists by name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
                        <p className="text-red-600 text-lg">{error}</p>
                    </div>
                ) : artists.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="mb-6 text-gray-200">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <p className="text-xl text-gray-900 font-serif mb-2">
                            {searchQuery ? 'No artists found' : 'No artists available'}
                        </p>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try a different search term' : 'We are currently curating our list of artists. Check back soon!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {startIndex}-{endIndex} of {total} artists
                        </div>

                        {/* Artists List */}
                        <div className="space-y-4 mb-8">
                            {artists.map((artist, index) => (
                                <motion.div
                                    key={artist._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Link
                                        to={`/artists/${artist._id}`}
                                        className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6 group"
                                    >
                                        <div className="flex items-start gap-5">
                                            {/* Profile Picture */}
                                            <div className="flex-shrink-0">
                                                {artist.profileImage ? (
                                                    <img
                                                        src={getImageUrl(artist.profileImage)}
                                                        alt={artist.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-primary transition-colors"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 group-hover:border-primary transition-colors">
                                                        <span className="text-gray-600 text-xl font-bold font-serif">
                                                            {artist.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Artist Info */}
                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                                                    {artist.name}
                                                </h3>
                                                {artist.bio && (
                                                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                        {artist.bio}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow Icon */}
                                            <div className="flex-shrink-0 self-center">
                                                <svg
                                                    className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    {renderPageNumbers()}
                                </div>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Next
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ArtistsPage;
