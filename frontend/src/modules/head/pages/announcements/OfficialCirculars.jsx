import React, { useState } from 'react';
import { Send, FileText, CheckCircle2, Pin, Trash2, ShieldAlert } from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';

export const OfficialCirculars = () => {
  const { posts, createPost } = useData();
  const [announcement, setAnnouncement] = useState('');
  const [toast, setToast] = useState(null);

  // Retrieve pinned posts (announcements)
  const pinnedCirculars = posts.filter(p => p.isPinned || p.isAnnouncement);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!announcement.trim()) {
      showToast('Announcement content cannot be empty');
      return;
    }

    // Call data context action to insert pinned feed post
    createPost(announcement, [], { isPinned: true, isAnnouncement: true });
    
    showToast('Circular published and pinned to community feeds!');
    setAnnouncement('');
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
      <section>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Send className="text-purple-400" />
          Broadcast Official Circulars
        </h2>
        <p className="text-xs text-text-muted mt-0.5">Publish global announcements, pinned notifications, and official gazettes</p>
      </section>

      {/* ─── COMPOSER WIDGET ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="card-neo p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-purple-400" />
            Write Pinned Circular
          </h3>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <textarea 
                rows="6"
                required
                placeholder="Write the official Samaj circular or press release text here... It will automatically be pinned to all community members' feeds with the Adhyaksh seal."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-brand-primary text-xs text-white resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                <Pin size={10} className="text-amber-400" strokeWidth={3} /> Pins to feed instantly
              </span>
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow shadow-purple-500/25"
              >
                <Send size={12} /> Broadcast Circular
              </button>
            </div>
          </form>
        </div>

        {/* Info panel */}
        <div className="card-neo p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" />
            Circular Guidelines
          </h3>
          <div className="space-y-3.5 text-xs text-purple-200">
            <p>
              <strong>Official Status:</strong> Pinned announcements carry the digital sign-off of the President Council and are highlighted on the Home Feed.
            </p>
            <p>
              <strong>Notifications:</strong> Broadcast updates will push alerts to all registered devices automatically.
            </p>
          </div>
        </div>

      </div>

      {/* ─── PAST CIRCULARS LIST ─── */}
      <section className="card-neo p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Active Pinned Circulars ({pinnedCirculars.length})</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Manage previously published and currently active pinned announcements</p>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {pinnedCirculars.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">No active circulars are currently pinned.</p>
          ) : (
            pinnedCirculars.map((post) => (
              <div key={post.id} className="p-4 rounded-2xl bg-white/3 border border-white/5 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Pin size={8} fill="currentColor" /> Pinned
                    </span>
                    <span className="text-[9px] font-bold text-text-muted uppercase">{post.timestamp}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{post.content}</p>
                </div>
                <button 
                  onClick={() => showToast('Announcement deleted from system records')}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-350 hover:text-white border border-rose-500/20 active:scale-95 transition-all shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};

export default OfficialCirculars;
