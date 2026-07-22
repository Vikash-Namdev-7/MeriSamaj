import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { headAnnouncementApi } from '../../services/headAnnouncementApi';
import { ArrowLeft, Send, Megaphone, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

export const HeadAnnouncementChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [channelData, messagesData] = await Promise.all([
          headAnnouncementApi.getChannelById(id),
          headAnnouncementApi.getMessages(id)
        ]);
        setChannel(channelData.channel);
        setMessages(messagesData.messages.reverse() || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Phase 1 Socket integration
  useEffect(() => {
    if (!channel?.conversationId) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    const token = localStorage.getItem('head_auth_token');
    if (token) {
      socketRef.current.emit('authenticate', { token });
    }

    socketRef.current.emit('join_conversation', channel.conversationId);

    socketRef.current.on('chat:new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [channel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await headAnnouncementApi.postMessage(id, { message: newMessage });
      setNewMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!channel) {
    return <div className="p-8 text-center text-red-500">Channel not found</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white border-x border-gray-200">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/head/announcements')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{channel.name}</h2>
            <p className="text-xs text-gray-500">{channel.description}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Info size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            No announcements yet.
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg._id} className="flex flex-col gap-1 items-end">
              <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
              </div>
              <span className="text-[10px] text-gray-400 pr-1">
                {format(new Date(msg.createdAt), 'h:mm a')}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-3 bg-white border-t shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type an announcement..."
            className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="h-10 w-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeadAnnouncementChatPage;
