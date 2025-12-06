import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Share2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import api from '../api/axios';
import useStore from '../store/useStore';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/ToastProvider';
import '../pages/AllArtworksPage.css'; // Import masonry styles

interface Artwork {
    _id: string;
    title: string;
    image: string;
    price: number;
    stock: number;
    category: {
        _id: string;
        name: string;
    };
}

interface Artist {
    _id: string;
    name: string;
    bio?: string;
    profileImage?: string;
    socialLinks?: {
        website?: string;
        instagram?: string;
        twitter?: string;
        facebook?: string;
        whatsapp?: string;
    };
}



const ArtistProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userInfo, openChat } = useStore();
    const { showToast } = useToast();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [artistRes, artworksRes] = await Promise.all([
                    api.get(`/artists/${id}`),
                    api.get(`/artists/${id}/artworks`)
                ]);
                setArtist(artistRes.data);
                setArtworks(artworksRes.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load artist profile');
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleStartChat = () => {
        if (!userInfo) {
            showToast('You need to login to chat with the artist.', 'info');
            navigate('/login');
            return;
        }
        if (artist) {
            openChat(artist._id);
        }
    };

    const handleShareProfile = async () => {
        if (!artist?._id) return;

        const shareUrl = `${window.location.origin}/artist/${artist._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${artist.name}'s profile on ArtGallery`,
                    text: `View this amazing artist's collection on ArtGallery`,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('Profile link copied to clipboard!', 'success');
            } catch (err) {
                showToast('Failed to copy link', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-600">{error || 'Artist not found'}</p>
                <Link to="/artists" className="text-primary hover:underline mt-4 inline-block">
                    Back to Artists
                </Link>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-stone-50">
            {/* Artist Hero Section */}
            <div className="relative overflow-hidden border-b border-gray-200/40">
                {/* Premium Black, Ash & White Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-gray-600/30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-500/20 via-transparent to-transparent"></div>

                {/* Subtle Ash Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-700/10 to-gray-800/20"></div>

                {/* Premium Noise Texture */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                }}></div>

                {/* Geometric Pattern Texture */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 py-12 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 max-w-6xl mx-auto">
                        <div className="flex-shrink-0">
                            {artist.profileImage ? (
                                <img
                                    src={getImageUrl(artist.profileImage)}
                                    alt={artist.name}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-[3px] border-white/90 ring-1 ring-gray-400/20"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-2xl border-[3px] border-white/90 ring-1 ring-gray-400/20">
                                    <span className="text-white text-5xl md:text-6xl font-bold font-serif drop-shadow-lg">
                                        {artist.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-3 tracking-tight drop-shadow-lg">{artist.name}</h1>

                            {artist.bio && (
                                <div className="prose prose-lg mb-6 max-w-3xl">
                                    <p className="whitespace-pre-line leading-relaxed text-base md:text-lg text-gray-100 drop-shadow">{artist.bio}</p>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-center gap-5">
                                {(!userInfo || userInfo._id !== artist._id) && (
                                    <button
                                        onClick={handleStartChat}
                                        className="flex items-center space-x-2 bg-white text-gray-900 px-7 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm"
                                    >
                                        <MessageCircle size={18} />
                                        <span>Contact Artist</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleShareProfile}
                                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm border border-white/20"
                                >
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </button>

                                {artist.socialLinks && (
                                    <div className="flex space-x-5">
                                        {artist.socialLinks?.website && (
                                            <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                                                <span className="sr-only">Website</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                            </a>
                                        )}
                                        {artist.socialLinks?.instagram && (
                                            <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                                                <span className="sr-only">Instagram</span>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                            </a>
                                        )}
                                        {artist.socialLinks?.twitter && (
                                            <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                                                <span className="sr-only">Twitter</span>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                            </a>
                                        )}
                                        {artist.socialLinks?.facebook && (
                                            <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                                                <span className="sr-only">Facebook</span>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                            </a>
                                        )}
                                        {artist.socialLinks?.whatsapp && (
                                            <a
                                                href={`https://wa.me/${artist.socialLinks.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                            >
                                                <span className="sr-only">WhatsApp</span>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Artworks Grid */}
            < div className="container mx-auto px-4 py-16" >
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold font-serif text-gray-900">Artworks by {artist.name}</h2>
                    <span className="text-gray-500">{artworks.length} pieces</span>
                </div>

                {
                    artworks.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="mb-6 text-gray-200">
                                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <p className="text-xl text-gray-900 font-serif mb-2">No artworks yet</p>
                            <p className="text-gray-500">This artist hasn't uploaded any masterpieces yet.</p>
                        </div>
                    ) : (
                        <Masonry
                            breakpointCols={{
                                default: 4,
                                1536: 4,
                                1280: 3,
                                1024: 3,
                                768: 2,
                                640: 1
                            }}
                            className="masonry-grid"
                            columnClassName="masonry-grid-column"
                        >
                            {artworks.map((artwork, index) => (
                                <motion.div
                                    key={artwork._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
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
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                }}
                                            />
                                            {artwork.stock === 0 && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    Sold
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold font-serif text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                                {artwork.title}
                                            </h3>
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
                                </motion.div>
                            ))}
                        </Masonry>
                    )
                }
            </div >
        </div >
    );
};

export default ArtistProfilePage;
