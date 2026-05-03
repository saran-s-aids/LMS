import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            // Use conversation-based room joining or general user-room
            newSocket.emit('join_chat', user._id);

            newSocket.on('receive_message', (message) => {
                setMessages((prev) => [...prev, message]);
            });

            return () => newSocket.close();
        }
    }, [user]);

    const sendMessage = (conversationId, message, receiverId) => {
        if (socket && user) {
            const msgData = {
                senderId: user._id,
                conversationId,
                receiverId, // Still needed for Socket.IO targeting
                message,
                timestamp: new Date()
            };
            socket.emit('send_message', msgData);
        }
    };

    return (
        <ChatContext.Provider value={{ socket, messages, setMessages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
