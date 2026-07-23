import React, { useState, useEffect } from 'react';
import { Search, Loader2, X, Check } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import { getMembers } from '../../../services/directoryApi';

const AddMemberSheet = ({ onClose, onAddMembers, groupId }) => {
  const [search, setSearch] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMembers({ search, limit: 15, page: 1 })
      .then(res => setMembersList(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search]);

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleAdd = async () => {
    if (selectedMembers.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAddMembers(selectedMembers);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add members');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          <h2 className="font-bold text-gray-900 text-[17px]">Add Members</h2>
          <button onClick={handleAdd} disabled={submitting || selectedMembers.length === 0}
            className="text-brand-primary font-bold text-[15px] disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col h-full space-y-4">
          {error && <div className="text-red-500 text-[13px] text-center font-semibold bg-red-50 p-2 rounded-xl">{error}</div>}
          
          <div className="relative shrink-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search members to add..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-[13.5px] text-gray-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" /></div>
            ) : membersList.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-[13px]">No members found</div>
            ) : (
              <div className="space-y-2">
                {membersList.map(m => (
                  <div key={m._id} onClick={() => toggleMember(m._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedMembers.includes(m._id) ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatar} fallback={m.name} size="md" />
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">{m.name}</p>
                        <p className="text-[12px] text-gray-500">{m.familyId?.headName ? `C/o ${m.familyId.headName}` : 'Member'}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selectedMembers.includes(m._id) ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'
                    }`}>
                      {selectedMembers.includes(m._id) && <Check size={12} className="text-white" />}
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

export default AddMemberSheet;
