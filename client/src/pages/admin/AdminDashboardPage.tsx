import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 font-serif">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link to="/admin/artworks" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-2">Manage Artworks</h2>
                    <p className="text-gray-600">Add, edit, or delete artworks.</p>
                </Link>
                <Link to="/admin/categories" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-2">Manage Categories</h2>
                    <p className="text-gray-600">Add, edit, or delete categories.</p>
                </Link>
                <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-2">Manage Orders</h2>
                    <p className="text-gray-600">View and update order status.</p>
                </Link>
                <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-2">Manage Users</h2>
                    <p className="text-gray-600">View and manage users.</p>
                </Link>
                <Link to="/admin/terms" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold mb-2">Manage Terms & Conditions</h2>
                    <p className="text-gray-600">Create and manage terms versions.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
