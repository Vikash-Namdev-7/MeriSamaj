import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';
import ChatRoomPage from './ChatRoomPage';

const ChatRouteWrapper = () => {
  // Routes use either :memberId or :chatId as param name
  const params = useParams();
  const id = params.id || params.chatId || params.memberId;
  const navigate = useNavigate();
  const { getOrCreateChat } = useData();

  useEffect(() => {
    if (id && !id.startsWith('c')) {
      const resolvedChatId = getOrCreateChat(id);
      navigate(`/member/chat/${resolvedChatId}`, { replace: true });
    }
  }, [id, getOrCreateChat, navigate]);

  if (id && id.startsWith('c')) {
    return <ChatRoomPage chatId={id} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
};

export default ChatRouteWrapper;
