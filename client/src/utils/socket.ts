import { io, Socket } from 'socket.io-client';
import { getApiUrl } from './config';

let socket: Socket;

export const connectSocket = (userId: string, setSocketCallback: (socket: Socket) => void) => {
    socket = io(getApiUrl());

    socket.on('connect', () => {
        socket.emit('join', userId);

        // Set socket in store AFTER connection and join
        setTimeout(() => {
            setSocketCallback(socket);
        }, 100);
    });

    socket.on('disconnect', () => {
        // Socket disconnected
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket || null;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};
