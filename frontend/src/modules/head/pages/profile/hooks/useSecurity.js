import { useState, useEffect } from 'react';
import { updatePassword, toggleTwoFactorAuth, getActiveSessions, logoutSession, getAuditLogs } from '../services/securityService';

export const useSecurity = () => {
  const [sessions, setSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionData, logData] = await Promise.all([
          getActiveSessions(),
          getAuditLogs()
        ]);
        setSessions(sessionData);
        setAuditLogs(logData);
      } catch (error) {
        console.error("Failed to load security data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const changePassword = async (currentPass, newPass) => {
    setActionLoading(true);
    try {
      const res = await updatePassword(currentPass, newPass);
      return res.success;
    } finally {
      setActionLoading(false);
    }
  };

  const toggle2FA = async (enabled, method) => {
    setActionLoading(true);
    try {
      const res = await toggleTwoFactorAuth(enabled, method);
      return res.success;
    } finally {
      setActionLoading(false);
    }
  };

  const terminateSession = async (sessionId) => {
    setActionLoading(true);
    try {
      const res = await logoutSession(sessionId);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
      return res.success;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    sessions,
    auditLogs,
    loading,
    actionLoading,
    changePassword,
    toggle2FA,
    terminateSession
  };
};
