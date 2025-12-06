import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Share2 } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

import { getImageUrl } from '../../utils/image';

interface Artwork {
    _id: string;
    title: string;
    category: {
        name: string;
    };
    price: number;
    image: string;
    stock: number;
}

const ArtistArtworkListPage: React.FC = () => {
    const { userInfo } = useStore();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        fetchArtworks();
    }, [userInfo]);

    const fetchArtworks = async () => {
        if (userInfo?._id) {
            try {
                const { data } = await api.get(`/artists/${userInfo._id}/artworks`);
                setArtworks(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load artworks');
                setLoading(false);
            }
        }
    };

    const handleDelete = async (id: string, title: string) => {
        const confirmed = await confirm({
            title: 'Delete Artwork',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await api.delete(`/artworks/${id}`);
                setArtworks(artworks.filter(art => art._id !== id));
                showToast('Artwork deleted successfully', 'success');
            } catch (err: any) {
                showToast(err.response?.data?.message || 'Failed to delete artwork', 'error');
            }
        }
    };

    const handleShare = async (id: string, title: string) => {
        const shareUrl = `${window.location.origin}/artwork/${id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out "${title}" on ArtGallery`,
                    text: `I thought you might like this artwork: ${title}`,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('Link copied to clipboard!', 'success');
            } catch (err) {
                showToast('Failed to copy link', 'error');
            }
        }
    };

    return (
        <>
            <ConfirmDialogComponent />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-serif">My Artworks</h1>
                    <Link
                        to="/artist/artworks/new"
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add New Artwork
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading artworks...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : artworks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-4">You haven't uploaded any artworks yet.</p>
                        <Link
                            to="/artist/artworks/new"
                            className="text-primary hover:underline font-medium"
                        >
                            Upload your first artwork
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {artworks.map((artwork) => (
                                    <tr key={artwork._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={getImageUrl(artwork.image)}
                                                alt={artwork.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{artwork.category?.name || 'Uncategorized'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${artwork.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{artwork.stock}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleShare(artwork._id, artwork.title)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Share"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/artist/artworks/${artwork._id}/edit`)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(artwork._id, artwork.title)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default ArtistArtworkListPage;
