import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

interface Artwork {
    _id: string;
    title: string;
    price: number;
    category: { name: string };
    artist: {
        _id: string;
        name: string;
    } | string;
}

const ArtworkListPage: React.FC = () => {
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            const fetchArtworks = async () => {
                try {
                    const { data } = await api.get('/artworks');
                    setArtworks(data);
                } catch (error) {
                    console.error(error);
                    showToast('Failed to load artworks', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchArtworks();
        }
    }, [navigate, userInfo]);

    const deleteHandler = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Artwork',
            message: 'Are you sure you want to delete this artwork? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await api.delete(`/artworks/${id}`);
                setArtworks(artworks.filter((x) => x._id !== id));
                showToast('Artwork deleted successfully', 'success');
            } catch (error) {
                console.error(error);
                showToast('Failed to delete artwork', 'error');
            }
        }
    };

    const createHandler = async () => {
        const confirmed = await confirm({
            title: 'Create New Artwork',
            message: 'Do you want to create a new artwork?',
            confirmText: 'Create',
            type: 'info'
        });

        if (confirmed) {
            try {
                // First, fetch categories to get a valid category ID
                const { data: categories } = await api.get('/categories');

                if (!categories || categories.length === 0) {
                    showToast('Please create at least one category first!', 'error');
                    return;
                }

                // Use the first category as default
                const defaultCategory = categories[0]._id;

                const { data } = await api.post('/artworks', {
                    title: 'New Artwork',
                    price: 99.99,
                    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
                    artist: userInfo?._id, // Use logged-in user's ID
                    category: defaultCategory,
                    description: 'Add your artwork description here...',
                    stock: 1,
                });
                showToast('Artwork created successfully', 'success');
                navigate(`/admin/artwork/${data._id}/edit`);
            } catch (error) {
                console.error(error);
                showToast('Error creating artwork. Make sure categories exist.', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ConfirmDialogComponent />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-serif">Artworks</h1>
                <button
                    onClick={createHandler}
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-800 transition"
                >
                    <Plus size={20} />
                    <span>Create Artwork</span>
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {artworks.map((artwork) => (
                                <tr key={artwork._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artwork._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{artwork.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${artwork.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artwork.category?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof artwork.artist === 'string' ? artwork.artist : artwork.artist.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                                        <Link to={`/admin/artwork/${artwork._id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit size={20} />
                                        </Link>
                                        <button
                                            onClick={() => deleteHandler(artwork._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ArtworkListPage;
