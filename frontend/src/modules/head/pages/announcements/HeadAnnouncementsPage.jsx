import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, Search, Archive, MoreVertical, Loader2, Users, Edit, Trash2, X } from 'lucide-react';
import { headAnnouncementApi } from '../../services/headAnnouncementApi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ChannelModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whoCanPost: 'head_only',
    whoCanView: 'everyone'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        whoCanPost: initialData.whoCanPost || 'head_only',
        whoCanView: initialData.whoCanView || 'everyone'
      });
    } else {
      setFormData({ name: '', description: '', whoCanPost: 'head_only', whoCanView: 'everyone' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">{initialData ? 'Edit Channel' : 'Create Channel'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-600 outline-none" placeholder="e.g., Festival Updates" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-600 outline-none h-20" placeholder="Optional description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who can post?</label>
            <select value={formData.whoCanPost} onChange={e => setFormData({ ...formData, whoCanPost: e.target.value })} className="w-full border rounded-lg p-2 bg-white outline-none">
              <option value="head_only">Community Head Only</option>
              <option value="head_and_admins">Head and Admins</option>
              <option value="moderators">Head, Admins & Moderators</option>
              <option value="verified_members">Verified Members</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who can view?</label>
            <select value={formData.whoCanView} onChange={e => setFormData({ ...formData, whoCanView: e.target.value })} className="w-full border rounded-lg p-2 bg-white outline-none">
              <option value="everyone">Everyone</option>
              <option value="verified_members">Verified Members</option>
              <option value="moderators">Head, Admins & Moderators</option>
              <option value="head_and_admins">Head and Admins</option>
              <option value="head_only">Community Head Only</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const HeadAnnouncementsPage = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await headAnnouncementApi.getChannels();
      setChannels(data.channels || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSaveChannel = async (data) => {
    try {
      if (editingChannel) {
        await headAnnouncementApi.updateChannel(editingChannel._id, data);
        toast.success('Channel updated successfully');
      } else {
        await headAnnouncementApi.createChannel(data);
        toast.success('Channel created successfully');
      }
      fetchChannels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleArchive = async (channel) => {
    try {
      await headAnnouncementApi.archiveChannel(channel._id);
      toast.success(channel.isArchived ? 'Channel restored' : 'Channel archived');
      fetchChannels();
    } catch (err) {
      toast.error('Failed to update archive status');
    }
  };

  const handleDelete = async (channel) => {
    if (channel.isDefault) {
      toast.error('Cannot delete the default announcement channel.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this channel?')) return;
    try {
      await headAnnouncementApi.deleteChannel(channel._id);
      toast.success('Channel deleted');
      fetchChannels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete channel');
    }
  };

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <button onClick={fetchChannels} className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-purple-600" />
            Announcement Channels
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage official broadcast channels for your community.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => { setEditingChannel(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChannels.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-700">No channels found</p>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <div 
              key={channel._id} 
              className={`bg-white border ${channel.isDefault ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'} rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative flex flex-col`}
            >
              <div className="flex justify-between items-start mb-3">
                <div onClick={() => navigate(`/head/announcements/${channel._id}`)} className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 shrink-0 cursor-pointer">
                  <Megaphone size={20} />
                </div>
                
                <div className="flex items-center gap-2">
                  {channel.isArchived && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                      <Archive size={10} /> Archived
                    </span>
                  )}
                  {channel.isDefault && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold uppercase rounded">
                      Default
                    </span>
                  )}
                  
                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(dropdownOpen === channel._id ? null : channel._id)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {dropdownOpen === channel._id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 text-sm">
                        <button onClick={() => { setEditingChannel(channel); setIsModalOpen(true); setDropdownOpen(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => { handleArchive(channel); setDropdownOpen(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                          <Archive size={14} /> {channel.isArchived ? 'Restore' : 'Archive'}
                        </button>
                        {!channel.isDefault && (
                          <button onClick={() => { handleDelete(channel); setDropdownOpen(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div onClick={() => navigate(`/head/announcements/${channel._id}`)} className="cursor-pointer">
                <h3 className="font-bold text-gray-900 truncate">{channel.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
                  {channel.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Subscribers</span>
                </div>
                <span>{formatDistanceToNow(new Date(channel.createdAt))} ago</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ChannelModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingChannel(null); }}
        onSubmit={handleSaveChannel}
        initialData={editingChannel}
      />
    </div>
  );
};

export default HeadAnnouncementsPage;
