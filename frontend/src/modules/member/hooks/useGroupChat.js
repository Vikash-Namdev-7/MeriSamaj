/**
 * useGroupChat.js
 * State management hook for Group Chat.
 * Handles group messages, socket updates, permissions, typing, and member events.
 */
import { useState, useEffect, useCallback } from 'react';
import { groupService } from '../../../core/api/groupService';
import { useChatSocket } from './useChatSocket';
import { useAuth } from '../../../core/auth/useAuth';

/**
 * @param {string} conversationId - Group conversation ID
 * @param {Object} group          - Group document (for permission checks)
 */
export const useGroupChat = (conversationId, group) => {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore]         = useState(false);
  const [page, setPage]               = useState(1);
  const [members, setMembers]         = useState(group?.members || []);
  const { user } = useAuth();
  const LIMIT = 50;

  // ── Load messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (pageNum = 1, prepend = false) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await groupService.getGroupMessages(conversationId, { page: pageNum, limit: LIMIT });
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

  // ── Socket ─────────────────────────────────────────────────────────────────
  const { sendSocketMessage, startTyping, stopTyping, markSeen, isConnected, isUserOnline } = useChatSocket({
    conversationId,

    onNewMessage: (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderId?._id !== user?._id) markSeen([msg._id]);
    },

    onUserTyping: ({ userId: typingUserId, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setTypingUsers(prev => prev.includes(typingUserId) ? prev : [...prev, typingUserId]);
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
          ? { ...m, seenBy: [...(m.seenBy || []), { userId: seenByUserId }] }
          : m
      ));
    },

    // Member events
    onMemberJoined: ({ userId: joinedId, name }) => {
      setMembers(prev => prev.some(m => (m.userId?._id || m.userId) === joinedId) ? prev : [...prev, { userId: joinedId, name, role: 'member' }]);
    },
    onMemberLeft: ({ userId: leftId }) => {
      setMembers(prev => prev.filter(m => (m.userId?._id || m.userId)?.toString() !== leftId?.toString()));
    },
    onMemberAdded: ({ user: addedUser }) => {
      setMembers(prev => prev.some(m => (m.userId?._id || m.userId)?.toString() === addedUser?._id?.toString()) ? prev : [...prev, { userId: addedUser, role: 'member' }]);
    },
    onMemberRemoved: ({ userId: removedId }) => {
      setMembers(prev => prev.filter(m => (m.userId?._id || m.userId)?.toString() !== removedId?.toString()));
    },
    onMemberPromoted: ({ userId: promotedId, role }) => {
      setMembers(prev => prev.map(m =>
        (m.userId?._id || m.userId)?.toString() === promotedId?.toString() ? { ...m, role } : m
      ));
    },
    onMemberDemoted: ({ userId: demotedId, role }) => {
      setMembers(prev => prev.map(m =>
        (m.userId?._id || m.userId)?.toString() === demotedId?.toString() ? { ...m, role } : m
      ));
    }
  });

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async ({ text, imageFile, replyTo }) => {
    if (!conversationId) return;
    setSending(true);

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
        res = await groupService.sendGroupImageMessage(conversationId, formData);
      } else {
        res = await groupService.sendGroupMessage(conversationId, {
          message: text,
          type: 'text',
          replyTo: replyTo || undefined
        });
      }
      const saved = res.data?.data?.message;
      setMessages(prev => prev.map(m => m._id === tempId ? { ...saved, status: 'sent' } : m));
    } catch (err) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId, user]);

  // ── Delete message ─────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId, deleteFor = 'me') => {
    await groupService.deleteGroupMessage(messageId, deleteFor);
    if (deleteFor === 'everyone') {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, isDeleted: true, type: 'deleted', message: 'This message was deleted' } : m
      ));
    } else {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
  }, []);

  // ── Pin / Unpin ────────────────────────────────────────────────────────────
  const pinMessage = useCallback(async (messageId) => {
    await groupService.pinMessage(messageId);
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned: true } : m));
  }, []);

  const unpinMessage = useCallback(async (messageId) => {
    await groupService.unpinMessage(messageId);
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isPinned: false } : m));
  }, []);

  // ── Permission helper ──────────────────────────────────────────────────────
  const ROLE_LEVEL = { head: 4, admin: 3, moderator: 2, member: 1 };

  const myMember = members.find(m => (m.userId?._id || m.userId)?.toString() === user?._id?.toString());
  const myRole   = myMember?.role || 'member';
  const myLevel  = ROLE_LEVEL[myRole] || 1;

  const canPerform = useCallback((permissionKey) => {
    const permissions = group?.chatPermissions || {};
    const required = permissions[permissionKey] || 'admin';
    return myLevel >= (ROLE_LEVEL[required] || 3);
  }, [group, myLevel]);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    typingUsers,
    members,
    myRole,
    isConnected,
    isUserOnline,
    canPerform,
    loadOlderMessages,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    startTyping,
    stopTyping,
    markSeen
  };
};

export default useGroupChat;
