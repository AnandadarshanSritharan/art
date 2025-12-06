import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';

interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
}

// Helper function to get full image URL
const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // If it's a relative path, prepend the server URL
    return `http://localhost:5000${imagePath}`;
};

const CategoryListPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { confirm, ConfirmDialogComponent } = useConfirm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load categories');
            showToast('Failed to load categories', 'error');
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete the category "${name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(categories.filter(cat => cat._id !== id));
                showToast('Category deleted successfully', 'success');
            } catch (err: any) {
                showToast(err.response?.data?.message || 'Failed to delete category', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ConfirmDialogComponent />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-serif">Manage Categories</h1>
                <Link
                    to="/admin/categories/new"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    Add New Category
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading categories...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No categories yet. Create your first category!</p>
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
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {category.image ? (
                                            <img
                                                src={getImageUrl(category.image)}
                                                alt={category.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            {category.description || 'No description'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id, category.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
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

export default CategoryListPage;
