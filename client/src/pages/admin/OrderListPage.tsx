import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useStore from '../../store/useStore';

interface Order {
    _id: string;
    user: { name: string };
    createdAt: string;
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
}

const OrderListPage: React.FC = () => {
    const { userInfo } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            const fetchOrders = async () => {
                try {
                    const { data } = await api.get('/orders');
                    setOrders(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [navigate, userInfo]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 font-serif">Orders</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user && order.user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.createdAt.substring(0, 10)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalPrice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {order.isPaid ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Not Paid</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {order.isDelivered ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Not Delivered</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link to={`/order/${order._id}`} className="text-indigo-600 hover:text-indigo-900">
                                            Details
                                        </Link>
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

export default OrderListPage;
