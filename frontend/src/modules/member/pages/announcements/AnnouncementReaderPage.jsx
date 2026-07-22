import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { axiosPrivate } from '../../../../core/api/axiosPrivate';

export const AnnouncementReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [channelRes, messagesRes] = await Promise.all([
          axiosPrivate.get(`/member/announcements/${id}`),
          axiosPrivate.get(`/member/announcements/${id}/messages`)
        ]);
        setChannel(channelRes.data.data.channel);
        setMessages(messagesRes.data.data.messages.reverse() || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!channel?.conversationId) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
    const token = localStorage.getItem('auth_token');
    if (token) {
      socketRef.current.emit('authenticate', { token });
    }

    socketRef.current.emit('join_conversation', channel.conversationId);

    socketRef.current.on('chat:new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      // Mark new message as seen
      if (socketRef.current) {
        socketRef.current.emit('chat:mark_seen', {
          conversationId: channel.conversationId,
          messageIds: [msg._id]
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [channel]);

  // Mark all unread messages as seen on load
  useEffect(() => {
    if (messages.length > 0 && channel?.conversationId && socketRef.current) {
      const unreadIds = messages
        .filter(m => !m.seenBy?.some(s => s.userId === localStorage.getItem('userId'))) // Assuming userId is available or we just pass all ids since backend handles it
        .map(m => m._id);
      
      if (unreadIds.length > 0) {
        socketRef.current.emit('chat:mark_seen', {
          conversationId: channel.conversationId,
          messageIds: unreadIds
        });
      }
    }
  }, [messages, channel]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!channel) {
    return <div className="p-8 text-center text-red-500">Channel not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 bg-white border-b sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft size={22} />
          </button>
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-gray-900 leading-tight truncate max-w-[200px]">
              {channel.name}
            </h2>
            <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
              {channel.description || 'Official Broadcast Channel'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Info size={22} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 pb-20">
            <Megaphone className="h-12 w-12 text-gray-300" />
            <p className="text-sm">No announcements yet.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isLast = index === messages.length - 1;
            const isPinned = msg.isPinned;
            return (
              <div key={msg._id} className="flex flex-col">
                <div className={`self-start max-w-[85%] border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 ${isPinned ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-100' : 'bg-white border-gray-100'}`}>
                  {isPinned && (
                    <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold uppercase mb-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      Pinned
                    </div>
                  )}
                  <p className="text-[14px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 pl-1">
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </span>
                {isLast && <div ref={messagesEndRef} className="h-2" />}
              </div>
            );
          })
        )}
      </div>

      {/* Read Only Footer */}
      <div className="bg-gray-100 p-3 text-center border-t border-gray-200 shrink-0">
        <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5">
          <Info size={14} /> Only Community Admins can send messages
        </p>
      </div>
    </div>
  );
};

export default AnnouncementReaderPage;
