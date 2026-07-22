import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const ChatRouteWrapper = () => {
  const params = useParams();
  const id = params.id || params.chatId || params.memberId;

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Prevent infinite loops if URL is exactly what we would navigate to
  if (id === 'member') {
    return <Navigate to={`/member/chat`} replace />;
  }

  if (id.length > 20) {
    // Likely a MongoDB ObjectId for a user or conversation
    return <Navigate to={`/member/chat/member/${id}`} replace />;
  } else if (id.startsWith('c')) {
    // Legacy mock chat ID (c1, c2, c3)
    return <Navigate to={`/member/chat`} replace />;
  } else {
    // Fallback
    return <Navigate to={`/member/chat/member/${id}`} replace />;
  }
};

export default ChatRouteWrapper;
