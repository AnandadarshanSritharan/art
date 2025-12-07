import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArtistRegisterPage from './pages/ArtistRegisterPage';
import ProfilePage from './pages/ProfilePage';
import ArtistDashboardPage from './pages/artist/ArtistDashboardPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistArtworkListPage from './pages/artist/ArtistArtworkListPage';
import ArtistArtworkFormPage from './pages/artist/ArtistArtworkFormPage';
import ArtistProfileEditPage from './pages/artist/ArtistProfileEditPage';
import ArtistOrderListPage from './pages/artist/ArtistOrderListPage';
import AllArtworksPage from './pages/AllArtworksPage';
import ArtworkDetailsPage from './pages/ArtworkDetailsPage';
import CartPage from './pages/CartPage';
import ShippingPage from './pages/ShippingPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CategoryListPage from './pages/admin/CategoryListPage';
import CategoryFormPage from './pages/admin/CategoryFormPage';
import ArtworkListPage from './pages/admin/ArtworkListPage';
import ArtworkEditPage from './pages/admin/ArtworkEditPage';
import OrderListPage from './pages/admin/OrderListPage';
import UserListPage from './pages/admin/UserListPage';
import TermsListPage from './pages/admin/TermsListPage';
import TermsFormPage from './pages/admin/TermsFormPage';
import ChatBox from './components/ChatBox';
import SupportBubble from './components/SupportBubble';
import useStore from './store/useStore';
import { connectSocket, disconnectSocket } from './utils/socket';

const App: React.FC = () => {
  const { userInfo, setSocket } = useStore();

  useEffect(() => {
    if (userInfo) {
      connectSocket(userInfo._id, setSocket);
    } else {
      disconnectSocket();
      setSocket(null);
    }

    // Only disconnect when component unmounts or user logs out
    // Don't disconnect on every re-render
  }, [userInfo?._id, setSocket]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/artist" element={<ArtistRegisterPage />} />
            <Route path="/profile" element={userInfo ? <ProfilePage /> : <Navigate to="/login" />} />

            {/* Artist Routes */}
            <Route path="/artist/dashboard" element={userInfo?.isArtist ? <ArtistDashboardPage /> : <Navigate to="/" />} />
            <Route path="/artist/artworks" element={userInfo?.isArtist ? <ArtistArtworkListPage /> : <Navigate to="/" />} />
            <Route path="/artist/artworks/new" element={userInfo?.isArtist ? <ArtistArtworkFormPage /> : <Navigate to="/" />} />
            <Route path="/artist/artworks/:id/edit" element={userInfo?.isArtist ? <ArtistArtworkFormPage /> : <Navigate to="/" />} />
            <Route path="/artist/profile/edit" element={userInfo?.isArtist ? <ArtistProfileEditPage /> : <Navigate to="/" />} />
            <Route path="/artist/orders" element={userInfo?.isArtist ? <ArtistOrderListPage /> : <Navigate to="/" />} />

            {/* Shop Routes */}
            <Route path="/shop" element={<AllArtworksPage />} />
            <Route path="/artwork/:id" element={<ArtworkDetailsPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/artists/:id" element={<ArtistProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/shipping" element={userInfo ? <ShippingPage /> : <Navigate to="/login" />} />
            <Route path="/placeorder" element={userInfo ? <PlaceOrderPage /> : <Navigate to="/login" />} />
            <Route path="/order/:id" element={userInfo ? <OrderDetailsPage /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={userInfo?.isAdmin ? <AdminDashboardPage /> : <Navigate to="/" />} />
            <Route path="/admin/categories" element={userInfo?.isAdmin ? <CategoryListPage /> : <Navigate to="/" />} />
            <Route path="/admin/categories/new" element={userInfo?.isAdmin ? <CategoryFormPage /> : <Navigate to="/" />} />
            <Route path="/admin/categories/edit/:id" element={userInfo?.isAdmin ? <CategoryFormPage /> : <Navigate to="/" />} />
            <Route path="/admin/artworks" element={userInfo?.isAdmin ? <ArtworkListPage /> : <Navigate to="/" />} />
            <Route path="/admin/artworks/:id/edit" element={userInfo?.isAdmin ? <ArtworkEditPage /> : <Navigate to="/" />} />
            <Route path="/admin/orders" element={userInfo?.isAdmin ? <OrderListPage /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={userInfo?.isAdmin ? <UserListPage /> : <Navigate to="/" />} />
            <Route path="/admin/terms" element={userInfo?.isAdmin ? <TermsListPage /> : <Navigate to="/" />} />
            <Route path="/admin/terms/new" element={userInfo?.isAdmin ? <TermsFormPage /> : <Navigate to="/" />} />
            <Route path="/admin/terms/edit/:id" element={userInfo?.isAdmin ? <TermsFormPage /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Ceycanvas. All rights reserved.</p>
          </div>
        </footer>

        {/* Global Chat Components */}
        {userInfo && (
          <>
            <ChatBox />
          </>
        )}
        <SupportBubble />
      </div>
    </Router>
  );
};

export default App;
