import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Image, Settings, Eye, DollarSign, Share2 } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

interface DashboardStats {
    totalArtworks: number;
    totalViews: number; // Placeholder for now
    totalSales: number; // Placeholder for now
}

const ArtistDashboardPage: React.FC = () => {
    const { userInfo } = useStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalArtworks: 0,
        totalViews: 0,
        totalSales: 0
    });
    const [loading, setLoading] = useState(true);

    const { showToast } = useToast();

    useEffect(() => {
        // ... existing useEffect logic ...
        const fetchStats = async () => {
            // ... existing fetch logic ...
            if (userInfo?._id) {
                try {
                    // Fetch artworks
                    const { data: artworks } = await api.get(`/artists/${userInfo._id}/artworks`);

                    // Fetch orders for this artist
                    const { data: orders } = await api.get('/orders/artist');

                    // Calculate total sales from delivered orders
                    const totalSales = orders
                        .filter((order: any) => order.isDelivered)
                        .reduce((sum: number, order: any) => {
                            // Sum up only the items that belong to this artist
                            const artistItems = order.orderItems.filter((item: any) => {
                                return artworks.some((artwork: any) => artwork._id === item.product);
                            });
                            const orderTotal = artistItems.reduce((itemSum: number, item: any) => {
                                return itemSum + (item.price * item.qty);
                            }, 0);
                            return sum + orderTotal;
                        }, 0);

                    // Calculate total views from all artworks
                    const totalViews = artworks.reduce((sum: number, artwork: any) => {
                        return sum + (artwork.views || 0);
                    }, 0);

                    setStats({
                        totalArtworks: artworks.length,
                        totalViews: totalViews,
                        totalSales: totalSales
                    });
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to fetch stats', error);
                    setLoading(false);
                }
            }
        };
        fetchStats();
    }, [userInfo]);

    const handleShareProfile = async () => {
        if (!userInfo?._id) return;

        const shareUrl = `${window.location.origin}/artist/${userInfo._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${userInfo.name}'s profile on CeyCanvas`,
                    text: `View my artwork collection on CeyCanvas`,
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

    return (
        <div className="container mx-auto px-4 py-8">
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-serif">Artist Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {userInfo?.name}</p>
                        </div>
                        <Link
                            to="/artist/artworks/new"
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add New Artwork
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-lg shadow-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 font-medium">Total Artworks</h3>
                                <Image className="text-primary" size={24} />
                            </div>
                            <p className="text-3xl font-bold">{stats.totalArtworks}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-lg shadow-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 font-medium">Total Views</h3>
                                <Eye className="text-blue-500" size={24} />
                            </div>
                            <p className="text-3xl font-bold">{stats.totalViews}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-lg shadow-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 font-medium">Total Sales</h3>
                                <DollarSign className="text-green-500" size={24} />
                            </div>
                            <p className="text-3xl font-bold">${stats.totalSales}</p>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <h2 className="text-2xl font-bold font-serif mb-6">Manage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            to="/artist/artworks"
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4 group"
                        >
                            <div className="bg-gray-100 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition">
                                <Image size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">My Artworks</h3>
                                <p className="text-gray-600">View, edit, and delete your uploaded artworks</p>
                            </div>
                        </Link>

                        <Link
                            to="/artist/profile/edit"
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4 group"
                        >
                            <div className="bg-gray-100 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Edit Profile</h3>
                                <p className="text-gray-600">Update your bio, profile picture, and social links</p>
                            </div>
                        </Link>

                        <Link
                            to="/artist/orders"
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4 group"
                        >
                            <div className="bg-gray-100 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Manage Orders</h3>
                                <p className="text-gray-600">View and fulfill orders for your artworks</p>
                            </div>
                        </Link>

                        <button
                            onClick={handleShareProfile}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4 group text-left w-full"
                        >
                            <div className="bg-gray-100 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Share My Profile</h3>
                                <p className="text-gray-600">Share your artist profile with the world</p>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ArtistDashboardPage;
