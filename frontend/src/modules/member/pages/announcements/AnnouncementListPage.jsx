import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Search, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { axiosPrivate } from '../../../../core/api/axiosPrivate'; // since I didn't create memberAnnouncementApi yet

export const AnnouncementListPage = ({ searchQuery }) => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const res = await axiosPrivate.get('/member/announcements');
        setChannels(res.data.data.channels || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const filteredChannels = channels.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading channels: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" />
          Community Announcements
        </h2>
        <p className="text-xs text-gray-500">Official broadcast channels from your community leadership.</p>
      </div>

      <div className="space-y-3">
        {filteredChannels.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            <Megaphone className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No announcement channels</p>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <div 
              key={channel._id} 
              onClick={() => navigate(`/member/announcements/${channel._id}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{channel.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{channel.description}</p>
              </div>
              <div className="flex flex-col items-end shrink-0 text-[10px] text-gray-400">
                <span>{formatDistanceToNow(new Date(channel.createdAt))}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementListPage;
