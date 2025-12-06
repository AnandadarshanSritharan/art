import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isArtist?: boolean;
    bio?: string;
    profileImage?: string;
    socialLinks?: {
        website?: string;
        instagram?: string;
        twitter?: string;
    };
    token: string;
}

interface CartItem {
    product: string;
    title: string;
    image: string;
    price: number;
    qty: number;
    stock: number;
}

interface ShippingAddress {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
    landmark?: string;
    orderNotes?: string;
    specialInstructions?: string;
}

interface AppState {
    userInfo: User | null;
    cartItems: CartItem[];
    shippingAddress: ShippingAddress | null;
    notificationTrigger: number;
    setUserInfo: (user: User | null) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    saveShippingAddress: (address: ShippingAddress) => void;
    clearCart: () => void;
    logout: () => void;
    refreshNotifications: () => void;

    // Chat State
    activeChat: string | null;
    isChatOpen: boolean;
    unreadMessageCount: number;
    openChat: (recipientId: string) => void;
    closeChat: () => void;
    setUnreadMessageCount: (count: number) => void;
    messageRefreshTrigger: number;
    refreshMessages: () => void;
    socket: Socket | null;
    setSocket: (socket: Socket | null) => void;
}

const useStore = create<AppState>((set) => ({
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')!)
        : null,
    cartItems: localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems')!)
        : [],
    shippingAddress: localStorage.getItem('shippingAddress')
        ? JSON.parse(localStorage.getItem('shippingAddress')!)
        : null,
    notificationTrigger: 0,
    setUserInfo: (user) => {
        set({ userInfo: user });
        if (user) {
            localStorage.setItem('userInfo', JSON.stringify(user));
        } else {
            localStorage.removeItem('userInfo');
        }
    },
    addToCart: (item) =>
        set((state) => {
            const existItem = state.cartItems.find((x) => x.product === item.product);
            let newCartItems;
            if (existItem) {
                newCartItems = state.cartItems.map((x) =>
                    x.product === existItem.product ? item : x
                );
            } else {
                newCartItems = [...state.cartItems, item];
            }
            localStorage.setItem('cartItems', JSON.stringify(newCartItems));
            return { cartItems: newCartItems };
        }),
    removeFromCart: (id) =>
        set((state) => {
            const newCartItems = state.cartItems.filter((x) => x.product !== id);
            localStorage.setItem('cartItems', JSON.stringify(newCartItems));
            return { cartItems: newCartItems };
        }),
    saveShippingAddress: (address) =>
        set(() => {
            localStorage.setItem('shippingAddress', JSON.stringify(address));
            return { shippingAddress: address };
        }),
    clearCart: () =>
        set(() => {
            localStorage.removeItem('cartItems');
            return { cartItems: [] };
        }),
    logout: () =>
        set(() => {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('cartItems'); // Optional: clear cart on logout
            localStorage.removeItem('shippingAddress');
            return { userInfo: null, cartItems: [], shippingAddress: null };
        }),
    refreshNotifications: () =>
        set((state) => ({
            notificationTrigger: state.notificationTrigger + 1,
        })),

    // Chat State
    activeChat: null,
    isChatOpen: false,
    unreadMessageCount: 0,
    messageRefreshTrigger: 0,
    openChat: (recipientId) => set({ activeChat: recipientId, isChatOpen: true }),
    closeChat: () => set({ isChatOpen: false, activeChat: null }),
    setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),
    refreshMessages: () => set((state) => ({ messageRefreshTrigger: state.messageRefreshTrigger + 1 })),
    socket: null,
    setSocket: (socket) => set({ socket }),
}));

export default useStore;
