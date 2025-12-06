import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

interface Category {
    _id: string;
    name: string;
}

const ArtworkEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userInfo } = useStore();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [artist, setArtist] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            const fetchData = async () => {
                try {
                    // Fetch categories
                    const { data: categoriesData } = await api.get('/categories');
                    setCategories(categoriesData);

                    // Fetch artwork
                    const { data } = await api.get(`/artworks/${id}`);
                    setTitle(data.title);
                    setPrice(data.price);
                    setImage(data.image);
                    setArtist(typeof data.artist === 'string' ? data.artist : data.artist?.name || '');
                    setCategory(data.category?._id || data.category);
                    setCountInStock(data.stock);
                    setDescription(data.description);
                } catch (error) {
                    console.error(error);
                    showToast('Failed to load artwork data', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, navigate, userInfo]);

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };

            const { data } = await api.post('/upload', formData, config);
            setImage(`http://localhost:5000${data.imagePath}`);
            showToast('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error uploading image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/artworks/${id}`, {
                title,
                price,
                image,
                // Don't send artist - it shouldn't be changed via admin edit
                category,
                description,
                stock: countInStock,
            });
            showToast('Artwork updated successfully!', 'success');
            navigate('/admin/artworks');
        } catch (error) {
            console.error(error);
            showToast('Error updating artwork', 'error');
        }
    };

    if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 font-serif">Edit Artwork</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Form */}
                    <div>
                        <form onSubmit={submitHandler}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Title *</label>
                                <input
                                    type="text"
                                    placeholder="Enter artwork title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Artist</label>
                                <input
                                    type="text"
                                    value={artist}
                                    readOnly
                                    className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Artist cannot be changed after creation</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Category *</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Price ($) *</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Stock *</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(Number(e.target.value))}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Image *</label>

                                {/* File Upload Button */}
                                <div className="mb-3">
                                    <label className="cursor-pointer inline-block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={uploadFileHandler}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        <span className={`px-4 py-2 rounded-md font-medium transition inline-flex items-center gap-2 ${uploading
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                            }`}>
                                            {uploading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    📁 Choose Image from Computer
                                                </>
                                            )}
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Max size: 5MB (JPG, PNG, GIF, WebP)</p>
                                </div>

                                {/* Or use URL */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or use image URL</span>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-3"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    💡 Or use{' '}
                                    <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Imgur
                                    </a>
                                    {' / '}
                                    <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        Unsplash
                                    </a>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Description *</label>
                                <textarea
                                    placeholder="Enter artwork description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                ></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-3 rounded-md font-bold hover:bg-gray-800 transition"
                                >
                                    Update Artwork
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/artworks')}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md font-bold hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - Preview */}
                    <div>
                        <div className="sticky top-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-700">Preview</h2>
                            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                                {/* Image Preview */}
                                <div className="mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={title || 'Artwork preview'}
                                            className="w-full h-64 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Details Preview */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {title || 'Untitled'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        by {artist || 'Unknown Artist'}
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        ${price.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Category: {categories.find(c => c._id === category)?.name || 'Not selected'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Stock: {countInStock} available
                                    </p>
                                    {description && (
                                        <p className="text-sm text-gray-700 mt-4 pt-4 border-t">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkEditPage;
