import React, { useState, useEffect } from 'react';
import { Loader2, X, Check } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import { groupService } from '../../../../../core/api/groupService';

const JoinRequestsSheet = ({ onClose, groupId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getJoinRequests(groupId);
      setRequests(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch join requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [groupId]);

  const handleAction = async (reqId, action) => {
    try {
      if (action === 'approve') {
        await groupService.approveJoinRequest(groupId, reqId);
      } else {
        await groupService.rejectJoinRequest(groupId, reqId);
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          <h2 className="font-bold text-gray-900 text-[17px]">Join Requests</h2>
          <div className="w-5" />
        </div>

        <div className="px-5 py-4 flex flex-col h-full space-y-4">
          {error && <div className="text-red-500 text-[13px] text-center font-semibold bg-red-50 p-2 rounded-xl">{error}</div>}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" /></div>
            ) : requests.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-[13px]">No pending join requests</div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={req.user?.avatar} fallback={req.user?.name} size="md" />
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">{req.user?.name}</p>
                        <p className="text-[12px] text-gray-500">{req.user?.familyId?.headName ? `C/o ${req.user.familyId.headName}` : 'Member'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => handleAction(req._id, 'reject')}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[12.5px] font-bold hover:bg-gray-200"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAction(req._id, 'approve')}
                        className="flex-1 py-1.5 bg-brand-primary text-white rounded-lg text-[12.5px] font-bold shadow-sm hover:bg-brand-primary/90"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestsSheet;
