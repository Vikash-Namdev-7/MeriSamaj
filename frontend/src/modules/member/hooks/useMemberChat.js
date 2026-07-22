/**
 * useMemberChat.js
 * State management hook for 1-to-1 Community Member Chat.
 * Handles conversation list, messages, and real-time socket updates.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { memberChatService } from '../../../core/api/memberChatService';
import { useChatSocket } from './useChatSocket';
import { useAuth } from '../../../core/auth/useAuth';

/**
 * For the conversation list (ChatListPage)
 */
export const useMemberConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const { user } = useAuth();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberChatService.getConversations();
      setConversations(res.data?.data?.conversations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Socket: update conversation list when a new message arrives (bring to top)
  const { isConnected } = useChatSocket({
    onNewMessage: (msg) => {
      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === msg.conversationId?.toString());
        if (idx === -1) {
          // Unknown conversation — refresh
          fetch();
          return prev;
        }
        const updated = { ...prev[idx], lastMessageAt: msg.createdAt, lastMessagePreview: msg.message || '📷' };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
    }
  });

  const openConversation = useCallback(async (targetUserId) => {
    const res = await memberChatService.openConversation(targetUserId);
    return res.data?.data;
  }, []);

  return { conversations, loading, error, refresh: fetch, openConversation, isConnected };
};

/**
 * For the chat room (ChatRoomPage) — loads and manages messages for one conversation
 */
export const useMemberChat = (conversationId) => {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(1);
  const { user } = useAuth();
  const LIMIT = 50;

  // ── Load messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (pageNum = 1, prepend = false) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await memberChatService.getMessages(conversationId, { page: pageNum, limit: LIMIT });
      const fetched = res.data?.data?.messages || [];
      const total   = res.data?.data?.total || 0;
      setMessages(prev => prepend ? [...fetched, ...prev] : fetched);
      setHasMore(total > pageNum * LIMIT);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    fetchMessages(1);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOlderMessages = useCallback(() => {
    if (hasMore && !loading) fetchMessages(page + 1, true);
  }, [fetchMessages, hasMore, loading, page]);

  // ── Socket integration ────────────────────────────────────────────────────
  const { sendSocketMessage, startTyping, stopTyping, markSeen, isConnected, isUserOnline } = useChatSocket({
    conversationId,

    onNewMessage: (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages(prev => {
        // Deduplicate by _id
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Auto mark as seen
      if (msg.senderId?._id !== user?._id) {
        markSeen([msg._id]);
      }
    },

    onUserTyping: ({ userId: typingUserId, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setTypingUsers(prev =>
        prev.includes(typingUserId) ? prev : [...prev, typingUserId]
      );
    },

    onUserStoppedTyping: ({ userId: typingUserId, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setTypingUsers(prev => prev.filter(id => id !== typingUserId));
    },

    onMessageDeleted: ({ messageId, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setMessages(prev => prev.map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, type: 'deleted', message: 'This message was deleted' }
          : m
      ));
    },

    onMessagesSeen: ({ userId: seenByUserId, messageIds }) => {
      setMessages(prev => prev.map(m =>
        messageIds.includes(m._id)
          ? { ...m, seenBy: [...(m.seenBy || []), { userId: seenByUserId, seenAt: new Date().toISOString() }] }
          : m
      ));
    },

    onMessagesDelivered: ({ userId: deliveredTo }) => {
      setMessages(prev => prev.map(m => ({
        ...m,
        deliveredTo: [...new Set([...(m.deliveredTo || []), deliveredTo])]
      })));
    }
  });

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async ({ text, imageFile, replyTo }) => {
    if (!conversationId) return;
    setSending(true);

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId,
      conversationId,
      senderId: { _id: user._id, name: user.name, avatar: user.avatar },
      message: text || '',
      type: imageFile ? 'image' : 'text',
      mediaUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      replyTo: replyTo || null,
      createdAt: new Date().toISOString(),
      status: 'sending',
      seenBy: [],
      deliveredTo: []
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        if (text) formData.append('message', text);
        formData.append('photo', imageFile);
        if (replyTo) formData.append('replyTo', replyTo);
        res = await memberChatService.sendImageMessage(conversationId, formData);
      } else {
        res = await memberChatService.sendMessage(conversationId, {
          message: text,
          type: 'text',
          replyTo: replyTo || undefined
        });
      }

      const saved = res.data?.data?.message;
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m._id === tempId ? { ...saved, status: 'sent' } : m));

      // Also emit via socket for real-time delivery to other user
      sendSocketMessage({
        message: saved.message,
        type: saved.type,
        mediaUrl: saved.mediaUrl
      });
    } catch (err) {
      // Mark as failed
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId, user, sendSocketMessage]);

  // ── Delete message ─────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId, deleteFor = 'me') => {
    await memberChatService.deleteMessage(messageId, deleteFor);
    if (deleteFor === 'everyone') {
      setMessages(prev => prev.map(m =>
        m._id === messageId
          ? { ...m, isDeleted: true, type: 'deleted', message: 'This message was deleted' }
          : m
      ));
    } else {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
  }, []);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    typingUsers,
    isConnected,
    isUserOnline,
    loadOlderMessages,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    markSeen
  };
};

export default useMemberChat;
