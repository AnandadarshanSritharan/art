import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../components/ToastProvider';

const CategoryFormPage: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();

    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const { data } = await api.get(`/categories`);
            const category = data.find((cat: any) => cat._id === id);
            if (category) {
                setName(category.name);
                setDescription(category.description || '');
                setImage(category.image || '');
                setImagePreview(category.image || '');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load category');
            showToast('Failed to load category', 'error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                showToast('Please select a valid image file', 'error');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                showToast('File size must be less than 5MB', 'error');
                return;
            }

            setImageFile(file);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploading(false);
            return data.imagePath;
        } catch (err: any) {
            setUploading(false);
            throw new Error(err.response?.data?.message || 'Failed to upload image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let finalImagePath = image;

            // Upload image if file is selected
            if (imageFile) {
                finalImagePath = await uploadImage();
            }

            const categoryData = {
                name,
                description,
                image: finalImagePath,
            };

            if (isEditMode) {
                await api.put(`/categories/${id}`, categoryData);
                showToast('Category updated successfully', 'success');
            } else {
                await api.post('/categories', categoryData);
                showToast('Category created successfully', 'success');
            }
            navigate('/admin/categories');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save category';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 font-serif">
                    {isEditMode ? 'Edit Category' : 'Create New Category'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Abstract, Landscape, Portrait"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Brief description of this category"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                        </label>

                        {/* File Upload */}
                        <div className="mb-4">
                            <label htmlFor="imageFile" className="block text-sm text-gray-600 mb-2">
                                Upload from Computer
                            </label>
                            <input
                                type="file"
                                id="imageFile"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Accepted formats: JPEG, PNG, GIF, WebP (Max 5MB)
                            </p>
                        </div>

                        {/* OR Divider */}
                        <div className="flex items-center my-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-sm text-gray-500">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* URL Input */}
                        <div>
                            <label htmlFor="image" className="block text-sm text-gray-600 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                id="image"
                                value={image}
                                onChange={(e) => {
                                    setImage(e.target.value);
                                    setImagePreview(e.target.value);
                                    setImageFile(null); // Clear file if URL is entered
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Leave empty to use a random gradient background
                            </p>
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.src = '';
                                        e.currentTarget.alt = 'Failed to load image';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading Image...' : loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/categories')}
                            disabled={loading || uploading}
                            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormPage;
