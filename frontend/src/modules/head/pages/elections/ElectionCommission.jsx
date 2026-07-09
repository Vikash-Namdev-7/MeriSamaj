import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, Plus, CheckCircle2, ChevronRight, Award, Trash2, X, BarChart3, Clock, Lock
} from 'lucide-react';

export const ElectionCommission = () => {
  const [activeModal, setActiveModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Initial Mock Elections
  const [elections, setElections] = useState([
    { 
      id: 'el-1', 
      title: 'Samaj Executive President Election 2026', 
      description: 'Vote to elect the global President for the next two-year term.',
      candidates: [
        { name: 'Shri Mohan Lal Agrawal', votes: 342, initials: 'MA' },
        { name: 'Shri Ramesh Chand Agrawal', votes: 128, initials: 'RA' }
      ], 
      status: 'Active', 
      endDate: 'Jul 20, 2026',
      totalVotes: 470
    },
    { 
      id: 'el-2', 
      title: 'Zonal Coordinator Poll - East Zone', 
      description: 'Select the Kshetriya Prabhari coordinator for the Indore East zone.',
      candidates: [
        { name: 'Shri Ramakant Agrawal', votes: 94, initials: 'RA' },
        { name: 'Shri Kamal Agrawal', votes: 88, initials: 'KA' },
        { name: 'Smt. Asha Agrawal', votes: 24, initials: 'AA' }
      ], 
      status: 'Active', 
      endDate: 'Jul 15, 2026',
      totalVotes: 206
    },
    { 
      id: 'el-3', 
      title: 'Establishment of Pediatric Wing Poll', 
      description: 'Referendum poll on medical wing construction budget approval.',
      candidates: [
        { name: 'Approve Budget', votes: 412, initials: 'AB' },
        { name: 'Reject/Re-audit Budget', votes: 45, initials: 'RB' }
      ], 
      status: 'Completed', 
      endDate: 'Jun 10, 2026',
      totalVotes: 457
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', endDate: '', candidates: ['', '']
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateElection = (e) => {
    e.preventDefault();
    if (!formData.title || formData.candidates.some(c => !c.trim())) {
      showToast('Please fill in required fields');
      return;
    }

    const newElection = {
      id: `el-${Date.now()}`,
      title: formData.title,
      description: formData.description || 'Samaj referendum voting.',
      candidates: formData.candidates.map(name => ({ name, votes: 0, initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() })),
      status: 'Active',
      endDate: formData.endDate || 'Jul 30, 2026',
      totalVotes: 0
    };

    setElections([newElection, ...elections]);
    showToast(`Successfully launched: "${formData.title}"!`);
    setFormData({ title: '', description: '', endDate: '', candidates: ['', ''] });
    setActiveModal(false);
  };

  const handleAddCandidateInput = () => {
    setFormData({ ...formData, candidates: [...formData.candidates, ''] });
  };

  const handleRemoveCandidateInput = (idx) => {
    if (formData.candidates.length <= 2) return;
    const updated = [...formData.candidates];
    updated.splice(idx, 1);
    setFormData({ ...formData, candidates: updated });
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* ─── TOAST ─── */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Vote className="text-purple-400" />
            Election Commission & Refrendums
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Administer elections, coordinate delegate ballots, and declare council results</p>
        </div>
        <button 
          onClick={() => setActiveModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus size={14} /> Launch Voting Ballot
        </button>
      </section>

      {/* ─── ELECTION CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {elections.map((el) => (
          <div key={el.id} className="card-neo p-5 flex flex-col justify-between hover:border-purple-500/20 transition-all space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-black text-white leading-tight pr-12">{el.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                  el.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-text-muted border border-white/5'
                }`}>
                  {el.status}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{el.description}</p>
            </div>

            {/* Candidates & Votes mapping */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5"><BarChart3 size={12} /> Ballot Statistics ({el.totalVotes} Votes)</h4>
              
              <div className="space-y-2.5">
                {el.candidates.map((c, idx) => {
                  const percent = el.totalVotes > 0 ? Math.round((c.votes / el.totalVotes) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-white">
                        <span className="font-semibold">{c.name}</span>
                        <span className="font-bold text-brand-secondary">{c.votes} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-semibold text-text-muted">
              <span className="flex items-center gap-1"><Clock size={11} /> End Date: {el.endDate}</span>
              {el.status === 'Active' ? (
                <button onClick={() => {
                  setElections(prev => prev.map(item => item.id === el.id ? { ...item, status: 'Completed' } : item));
                  showToast(`Declared results and closed voting for ${el.title}`);
                }} className="text-amber-400 hover:text-white transition-colors flex items-center gap-0.5">
                  <Lock size={10} /> Declare & Lock
                </button>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Results Published</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── BALLOT SETUP MODAL ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <Vote size={18} className="text-purple-400" />
                  Initialize Voting Ballot
                </h3>
                <button onClick={() => setActiveModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateElection} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ballot Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Samaj Executive President Election 2026" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</label>
                  <textarea 
                    rows="2"
                    placeholder="Provide short detailed description..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Candidates / Options *</label>
                    <button 
                      type="button"
                      onClick={handleAddCandidateInput}
                      className="text-[9px] font-black text-purple-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {formData.candidates.map((cand, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          required
                          placeholder={`Option / Candidate #${idx + 1}`}
                          value={cand}
                          onChange={(e) => {
                            const updated = [...formData.candidates];
                            updated[idx] = e.target.value;
                            setFormData({...formData, candidates: updated});
                          }}
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                        />
                        {formData.candidates.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveCandidateInput(idx)}
                            className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/20"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Closing Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
                >
                  Create & Initialize Ballot
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ElectionCommission;
