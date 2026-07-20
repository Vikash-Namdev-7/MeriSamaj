import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, Plus, CheckCircle2, Award, Trash2, X, BarChart3, Clock, Lock, AlertCircle
} from 'lucide-react';
import headVotingService from '../../../../core/api/headVotingService';

export const ElectionCommission = () => {
  const [activeModal, setActiveModal] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const initialForm = {
    title: '', 
    description: '', 
    type: 'Community Election',
    category: 'General',
    startDate: '', 
    endDate: '', 
    candidates: [
      { name: '', age: '', profession: '', shortIntro: '' },
      { name: '', age: '', profession: '', shortIntro: '' }
    ]
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await headVotingService.getElections();
      if (res.status === 'success') {
        setElections(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate || formData.candidates.some(c => !c.name.trim())) {
      showToast('Please fill in all required fields (including candidate names)', true);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await headVotingService.createElection(formData);
      if (res.status === 'success') {
        showToast(`Successfully launched: "${formData.title}"!`);
        setFormData(initialForm);
        setActiveModal(false);
        fetchElections(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create election', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? This can only be done if there are no votes.")) return;
    try {
      await headVotingService.deleteElection(id);
      showToast('Election deleted successfully');
      fetchElections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', true);
    }
  };

  const handleCloseElection = async (id) => {
    if (!window.confirm("Are you sure you want to manually close this election?")) return;
    try {
      await headVotingService.closeElection(id);
      showToast('Election closed successfully');
      fetchElections();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to close', true);
    }
  };

  const handleAddCandidateInput = () => {
    setFormData({ 
      ...formData, 
      candidates: [...formData.candidates, { name: '', age: '', profession: '', shortIntro: '' }] 
    });
  };

  const handleRemoveCandidateInput = (idx) => {
    if (formData.candidates.length <= 2) return;
    const updated = [...formData.candidates];
    updated.splice(idx, 1);
    setFormData({ ...formData, candidates: updated });
  };

  const handleCandidateChange = (idx, field, value) => {
    const updated = [...formData.candidates];
    updated[idx][field] = value;
    setFormData({ ...formData, candidates: updated });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans space-y-6 pb-10">
      
      {/* ─── TOAST ─── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
          toast.isError ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          {toast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 p-6 rounded-2xl shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Vote className="text-indigo-600" /> Election Commission
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">Administer community elections and monitor results in real-time</p>
        </div>
        <button 
          onClick={() => setActiveModal(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-[12px] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus size={15} /> Create Election
        </button>
      </div>

      {/* ─── LOADER / ERROR ─── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          {error}
        </div>
      ) : elections.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 border-dashed rounded-3xl">
          <Vote size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="font-semibold">No elections found for this community.</p>
        </div>
      ) : (
        /* ─── ELECTION CARDS GRID ─── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {elections.map((el) => (
            <div key={el.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-tight pr-4">{el.title}</h3>
                    <p className="text-[10px] text-indigo-600 mt-1 font-bold">{el.type}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                    el.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    el.status === 'Upcoming' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {el.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{el.description}</p>
              </div>

              {/* Candidates & Votes mapping */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 size={12} /> Ballot Statistics
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {el.totalVotes} Votes Cast
                  </span>
                </div>
                
                <div className="space-y-3">
                  {el.candidates.map((c, idx) => {
                    const percent = el.totalVotes > 0 ? Math.round((c.votes / el.totalVotes) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-700">
                          <span className="font-semibold">{c.name}</span>
                          <span className="font-bold text-indigo-600">{c.votes} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-amber-500" /> {el.startDateFormatted} - {el.endDateFormatted}
                </span>
                
                <div className="flex gap-3">
                  {(el.status === 'Upcoming' || el.status === 'Draft' || el.totalVotes === 0) && (
                    <button onClick={() => handleDelete(el.id)} className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                  {el.status === 'Active' && (
                    <button onClick={() => handleCloseElection(el.id)} className="text-amber-500 hover:text-amber-700 transition-colors flex items-center gap-1">
                      <Lock size={12} /> Force Close
                    </button>
                  )}
                  {(el.status === 'Completed' || el.status === 'Closed') && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Results Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── BALLOT SETUP MODAL ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setActiveModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0 mb-4">
                <h3 className="text-md font-black text-slate-800 flex items-center gap-2">
                  <Vote size={18} className="text-indigo-600" />
                  Configure Election
                </h3>
                <button 
                  onClick={() => setActiveModal(false)} 
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateElection} className="overflow-y-auto pr-2 space-y-6 scrollbar-hide text-slate-800">
                
                {/* Section 1: Basic Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-100 pb-1">1. Basic Details</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Election Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Samaj Executive President Election 2026" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description & Instructions</label>
                    <textarea 
                      rows="2"
                      required
                      placeholder="Explain the purpose of this election..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date *</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date *</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Candidates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">2. Candidates</h4>
                    <button 
                      type="button"
                      onClick={handleAddCandidateInput}
                      className="text-[9px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Add Candidate
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.candidates.map((cand, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                        {formData.candidates.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveCandidateInput(idx)}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Candidate Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Full Name"
                              value={cand.name}
                              onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-800 transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Age (Optional)</label>
                            <input 
                              type="number" 
                              placeholder="Age"
                              value={cand.age}
                              onChange={(e) => handleCandidateChange(idx, 'age', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-800 transition-colors"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Profession (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., Social Worker, Businessman"
                              value={cand.profession}
                              onChange={(e) => handleCandidateChange(idx, 'profession', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-800 transition-colors"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Short Bio (Optional)</label>
                            <textarea 
                              rows="1"
                              placeholder="Brief description about the candidate..."
                              value={cand.shortIntro}
                              onChange={(e) => handleCandidateChange(idx, 'shortIntro', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-800 resize-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 shrink-0">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Publishing...</>
                    ) : (
                      'Publish Election'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ElectionCommission;
