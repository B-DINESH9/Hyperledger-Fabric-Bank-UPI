import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      // Prefer direct backend URL to avoid CRA proxy issues; fallback to window origin
      const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001' || window.location.origin;
      const newSocket = io(socketURL, {
        auth: {
          token: localStorage.getItem('token')
        },
        // Prefer WebSocket transport to avoid aborted long-polling requests
        transports: ['websocket'],
        // Explicit path for socket.io server
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelayMax: 3000,
        timeout: 20000,
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join admin room if user is admin
        if (isAdmin) {
          newSocket.emit('join-admin');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Listen for transaction updates
      newSocket.on('transaction-updated', (data) => {
        console.log('Transaction updated:', data);
        if (isAdmin) {
          toast.success(`Transaction ${data.transactionID} updated`);
        }
      });

      // Listen for fraud alerts
      newSocket.on('fraud-detected', (data) => {
        console.log('Fraud detected:', data);
        if (isAdmin) {
          toast.error(`Fraud Alert: ${data.description}`, {
            duration: 6000,
            icon: '🚨'
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user?.upiID, isAdmin]);

  const emitTransactionUpdate = (data) => {
    if (socket && connected) {
      socket.emit('transaction-update', data);
    }
  };

  const emitFraudAlert = (data) => {
    if (socket && connected) {
      socket.emit('fraud-alert', data);
    }
  };

  const value = {
    socket,
    connected,
    emitTransactionUpdate,
    emitFraudAlert
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
