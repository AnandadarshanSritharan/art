import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';
import { useToast } from '../../components/ToastProvider';

import { getImageUrl } from '../../utils/image';

interface Category {
    _id: string;
    name: string;
}

const ArtistArtworkFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userInfo } = useStore();
    const { showToast } = useToast();
    const isEditMode = Boolean(id);

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState<string[]>([]);
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(1);
    const [description, setDescription] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [medium, setMedium] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userInfo || !userInfo.isArtist) {
            navigate('/login');
            return;
        }

        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
                showToast('Failed to fetch categories', 'error');
            }
        };

        fetchCategories();

        if (isEditMode) {
            const fetchArtwork = async () => {
                try {
                    const { data } = await api.get(`/artworks/${id}`);
                    // Verify ownership
                    if (data.artist._id !== userInfo._id && data.artist !== userInfo._id) {
                        setError('You do not have permission to edit this artwork');
                        return;
                    }

                    setTitle(data.title);
                    setPrice(data.price);
                    // Handle legacy single image or new images array
                    if (data.images && data.images.length > 0) {
                        setImages(data.images);
                    } else if (data.image) {
                        setImages([data.image]);
                    }
                    setCategory(data.category?._id || data.category);
                    setCountInStock(data.stock);
                    setDescription(data.description);
                    setDimensions(data.dimensions || '');
                    setMedium(data.medium || '');
                } catch (error) {
                    console.error('Failed to fetch artwork', error);
                    setError('Failed to load artwork details');
                }
            };
            fetchArtwork();
        }
    }, [id, isEditMode, navigate, userInfo]);

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validate total images count
        if (images.length + files.length > 5) {
            showToast('You can upload a maximum of 5 images', 'error');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 5 * 1024 * 1024) {
                showToast(`File ${file.name} is too large (max 5MB)`, 'error');
                return;
            }
            formData.append('images', file);
        }

        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`,
                },
            };

            const { data } = await api.post('/upload/multiple', formData, config);
            setImages([...images, ...data.imagePaths]);
            showToast('Images uploaded successfully', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error uploading images', 'error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (price <= 0) {
            setError('Price must be greater than 0');
            showToast('Price must be greater than 0', 'error');
            setLoading(false);
            return;
        }

        if (countInStock < 0 || !Number.isInteger(countInStock)) {
            setError('Stock must be a non-negative integer');
            showToast('Stock must be a non-negative integer', 'error');
            setLoading(false);
            return;
        }

        if (images.length === 0) {
            setError('Please upload at least one image');
            showToast('Please upload at least one image', 'error');
            setLoading(false);
            return;
        }

        try {
            const artworkData = {
                title,
                price,
                image: images[0], // Main image for backward compatibility
                images,
                category,
                description,
                stock: countInStock,
                dimensions,
                medium,
            };

            if (isEditMode) {
                await api.put(`/artworks/${id}`, artworkData);
                showToast('Artwork updated successfully!', 'success');
            } else {
                await api.post('/artworks', artworkData);
                showToast('Artwork created successfully!', 'success');
            }
            navigate('/artist/artworks');
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to save artwork';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/artist/artworks')}
                    className="text-primary hover:underline"
                >
                    Back to My Artworks
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 font-serif">
                    {isEditMode ? 'Edit Artwork' : 'Add New Artwork'}
                </h1>

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
                                        placeholder="1"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(Number(e.target.value))}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Dimensions</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 24x36 inches"
                                        value={dimensions}
                                        onChange={(e) => setDimensions(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Medium</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Oil on Canvas"
                                        value={medium}
                                        onChange={(e) => setMedium(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Images (Max 5) *</label>

                                {/* File Upload Button */}
                                <div className="mb-3">
                                    <label className="cursor-pointer inline-block w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={uploadFileHandler}
                                            className="hidden"
                                            disabled={uploading || images.length >= 5}
                                        />
                                        <span className={`w-full px-4 py-3 rounded-md font-medium transition flex items-center justify-center gap-2 border border-dashed ${uploading || images.length >= 5
                                            ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-gray-300'
                                            : 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700 cursor-pointer'
                                            }`}>
                                            <Upload size={20} />
                                            {uploading ? 'Uploading...' : images.length >= 5 ? 'Max images reached' : 'Upload Images'}
                                        </span>
                                    </label>
                                </div>

                                {/* Image List */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt={`Upload ${index + 1}`}
                                                    className="w-full h-full object-cover rounded border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                                >
                                                    <X size={14} />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                                        Main
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Description *</label>
                                <textarea
                                    placeholder="Tell the story behind this artwork..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                ></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading || uploading}
                                    className="flex-1 bg-primary text-white py-3 rounded-md font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : isEditMode ? 'Update Artwork' : 'Create Artwork'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/artist/artworks')}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md font-bold hover:bg-gray-300 transition"
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
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                                {/* Image Preview */}
                                <div className="mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
                                    {images.length > 0 ? (
                                        <img
                                            src={getImageUrl(images[0])}
                                            alt={title || 'Artwork preview'}
                                            className="w-full h-auto max-h-[500px] object-contain mx-auto"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                                            No image selected
                                        </div>
                                    )}
                                </div>

                                {/* Details Preview */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                            {title || 'Untitled Artwork'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            by {userInfo?.name}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-baseline border-b pb-3">
                                        <p className="text-2xl font-bold text-primary">
                                            ${price > 0 ? price.toFixed(2) : '0.00'}
                                        </p>
                                        <span className="text-sm bg-gray-200 px-2 py-1 rounded text-gray-700">
                                            {categories.find(c => c._id === category)?.name || 'Category'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Dimensions:</span> {dimensions || '-'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Medium:</span> {medium || '-'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Stock:</span> {countInStock}
                                        </div>
                                    </div>

                                    {description && (
                                        <div className="pt-3 border-t">
                                            <p className="text-sm text-gray-700 italic line-clamp-4">
                                                "{description}"
                                            </p>
                                        </div>
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

export default ArtistArtworkFormPage;
