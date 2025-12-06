import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Check, X } from 'lucide-react';
import api from '../../api/axios';
import useStore from '../../store/useStore';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

const UserListPage: React.FC = () => {
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            const fetchUsers = async () => {
                try {
                    const { data } = await api.get('/auth/users');
                    setUsers(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [navigate, userInfo]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 font-serif">Users</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.isAdmin ? <Check className="text-green-500" size={20} /> : <X className="text-red-500" size={20} />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-red-600 hover:text-red-900">
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

export default UserListPage;
