import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Image, RefreshCw } from 'lucide-react';
import { matrimonialService } from '../../services/matrimonialService';

export const ModerationQueue = ({ data }) => {
  const { photos = [], refreshPhotos } = data;
  const [actionId, setActionId] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleModerate = async (profileId, photoId, action) => {
    const key = `${profileId}-${photoId}`;
    setActionId(key);
    try {
      await matrimonialService.moderatePhoto(profileId, photoId, action);
      showToast(`Photo ${action}d ✅`);
      await refreshPhotos?.();
    } catch (err) {
      showToast('Action failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white">Photo Moderation Queue</h3>
          <p className="text-xs text-gray-500 mt-0.5">{photos.length} pending approval</p>
        </div>
        <button onClick={refreshPhotos}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="card-neo p-16 text-center">
          <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
          <h4 className="text-white font-bold">All Clear!</h4>
          <p className="text-gray-500 text-sm mt-1">No photos pending moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map(photo => {
            const key = `${photo.profileId}-${photo.photoId}`;
            const isLoading = actionId === key;

            return (
              <div key={key} className="card-neo overflow-hidden group">
                {/* Photo */}
                <div className="aspect-[3/4] relative overflow-hidden bg-white/5">
                  {photo.url ? (
                    <img src={photo.url} alt="moderation" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={24} className="text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <button onClick={() => handleModerate(photo.profileId, photo.photoId, 'approve')}
                        disabled={isLoading}
                        className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-emerald-400 transition-colors">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      </button>
                      <button onClick={() => handleModerate(photo.profileId, photo.photoId, 'reject')}
                        disabled={isLoading}
                        className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-red-400 transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-2.5">
                  <p className="text-[11px] text-gray-400 font-semibold truncate">{photo.userName}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">
                    {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                {/* Mobile actions */}
                <div className="flex border-t border-white/5 sm:hidden">
                  <button onClick={() => handleModerate(photo.profileId, photo.photoId, 'approve')}
                    className="flex-1 py-2 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/10">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => handleModerate(photo.profileId, photo.photoId, 'reject')}
                    className="flex-1 py-2 text-red-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-500/10 border-l border-white/5">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
