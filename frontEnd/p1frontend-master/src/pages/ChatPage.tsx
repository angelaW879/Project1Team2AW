import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Chat } from '../interface/types';
import '../css/chatpage.css';

const ChatPage = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchChats = async () => {
            try {
               const receiverResponse = await fetch(`${config.BASE_URL}/api/chats/receiver/${user?.userId}`, {
                    credentials: 'include',
                });
                const senderResponse = await fetch(`${config.BASE_URL}/api/chats/sender/${user?.userId}`, {
                    credentials: 'include',
                });

                const chatRoomsMap = new Map();

                if (receiverResponse.ok) {
                    const receiverData = await receiverResponse.json();
                    receiverData.forEach((chat: Chat) => {
                        const key = chat.senderId !== user?.userId ? chat.senderId : chat.receiverId;
                        if (!chatRoomsMap.has(key)) {
                            chatRoomsMap.set(key, chat);
                        }
                    });
                }

                if (senderResponse.ok) {
                    const senderData = await senderResponse.json();
                    senderData.forEach((chat: Chat) => {
                        const key = chat.receiverId !== user?.userId ? chat.receiverId : chat.senderId;
                        if (!chatRoomsMap.has(key)) {
                            chatRoomsMap.set(key, chat);
                        }
                    });
                }

                setChats(Array.from(chatRoomsMap.values()));
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
            }
        };

        if (user) {
            fetchChats();
        }
    }, [user]);

    return (
        <div className="chat-page">
            <h1 className="chat-page-title">Chat Rooms</h1>
            {chats.length === 0 ? (
                <p className="no-chats">No chat rooms available.</p>
            ) : (
                <div className="chat-rooms">
                    {chats.map((chat) => (
                        <div key={chat.chatId} className="chat-room">
                            <Link to={`/chat/${chat.senderId !== user?.userId ? chat.senderId : chat.receiverId}`} className="chat-link">
                                Chat with {chat.senderId !== user?.userId ? chat.senderUsername : chat.receiverUsername}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatPage;
