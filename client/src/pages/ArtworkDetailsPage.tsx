import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import ImageZoom from '../components/ImageZoom';

interface Artwork {
    _id: string;
    title: string;
    description: string;
    artist: {
        _id: string;
        name: string;
    } | string;
    price: number;
    image: string;
    images?: string[];
    stock: number;
    category: { name: string };
    dimensions?: string;
    medium?: string;
}

import { getImageUrl } from '../utils/image';

const ArtworkDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const { addToCart } = useStore();
    const viewCounted = React.useRef(false);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const { data } = await api.get(`/artworks/${id}`);
                setArtwork(data);

                // Set initial active image
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                } else {
                    setActiveImage(data.image);
                }

                // Increment view count only once
                if (!viewCounted.current) {
                    viewCounted.current = true;
                    await api.put(`/artworks/${id}/view`).catch(err => console.error('Failed to increment view:', err));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    const handleAddToCart = () => {
        if (artwork) {
            addToCart({
                product: artwork._id,
                title: artwork.title,
                image: artwork.image,
                price: artwork.price,
                qty: 1,
                stock: artwork.stock,
            });
            navigate('/cart');
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!artwork) return <div className="text-center py-10">Artwork not found</div>;

    const images = artwork.images && artwork.images.length > 0 ? artwork.images : [artwork.image];

    const handleNextImage = () => {
        const currentIndex = images.indexOf(activeImage);
        const nextIndex = (currentIndex + 1) % images.length;
        setActiveImage(images[nextIndex]);
    };

    const handlePrevImage = () => {
        const currentIndex = images.indexOf(activeImage);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setActiveImage(images[prevIndex]);
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
                {/* Left Column: Image Gallery */}
                <div className="space-y-4 md:space-y-6">
                    <div className="relative bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                        <ImageZoom
                            src={getImageUrl(activeImage)}
                            alt={artwork.title}
                            className="w-full h-auto object-contain mx-auto"
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`${artwork.title} thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="space-y-6 max-w-xl">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-3 font-serif text-gray-900 leading-tight">{artwork.title}</h1>
                        <p className="text-base text-gray-600 flex items-center space-x-2">
                            <span>by</span>
                            <span className="font-semibold text-gray-900 border-b border-gray-300 pb-0.5 hover:border-primary transition cursor-pointer">
                                {typeof artwork.artist === 'string' ? artwork.artist : artwork.artist.name}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3 md:gap-4 border-b border-gray-100 pb-4">
                        <p className="text-2xl md:text-3xl text-primary font-serif font-bold">Rs {artwork.price.toLocaleString()}</p>
                        {artwork.stock <= 3 && artwork.stock > 0 && (
                            <span className="text-sm font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                                Only {artwork.stock} left!
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Dimensions</span>
                            <span className="font-medium text-gray-900 text-base">{artwork.dimensions || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Medium</span>
                            <span className="font-medium text-gray-900 text-lg">{artwork.medium || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Category</span>
                            <span className="font-medium text-gray-900 text-lg">{artwork.category?.name || 'Uncategorized'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Availability</span>
                            <span className={`font-medium text-lg flex items-center space-x-2 ${artwork.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <span className={`w-2 h-2 rounded-full ${artwork.stock > 0 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                <span>{artwork.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="prose text-gray-600 leading-relaxed">
                        <h3 className="text-base font-bold text-gray-900 font-serif mb-2">About the Artwork</h3>
                        <p className="whitespace-pre-line">{artwork.description}</p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={artwork.stock === 0}
                            className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${artwork.stock > 0
                                ? 'bg-primary hover:bg-gray-800'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {artwork.stock > 0 ? 'Add to Collection' : 'Sold Out'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Secure checkout • Free shipping worldwide • Authenticity guaranteed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetailsPage;
