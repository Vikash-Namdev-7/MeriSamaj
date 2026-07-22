import React, { useState, useEffect } from 'react';
import { adminAnnouncementApi } from '../../services/adminAnnouncementApi';
import { getAllCommunities } from '../../services/communityService';
import { Megaphone, Search, Archive, Trash2, Edit2, Loader2, Users, Plus, MoreVertical, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const GlobalChannelModal = ({ isOpen, onClose, onSubmit, initialData = null, communities = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whoCanPost: 'head_only',
    whoCanView: 'everyone',
    communityId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        whoCanPost: initialData.whoCanPost || 'head_only',
        whoCanView: initialData.whoCanView || 'everyone',
        communityId: initialData.communityId?._id || initialData.communityId || ''
      });
    } else {
      setFormData({ name: '', description: '', whoCanPost: 'head_only', whoCanView: 'everyone', communityId: communities[0]?._id || '' });
    }
  }, [initialData, isOpen, communities]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.communityId) {
      toast.error('Please select a community');
      return;
    }
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">{initialData ? 'Edit Global Channel' : 'Create Global Channel'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Community *</label>
            <select required disabled={!!initialData} value={formData.communityId} onChange={e => setFormData({ ...formData, communityId: e.target.value })} className="w-full border rounded-lg p-2 bg-gray-50 outline-none">
              <option value="">Select Community</option>
              {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 outline-none" placeholder="e.g., Festival Updates" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-600 outline-none h-20" placeholder="Optional description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Who can post?</label>
              <select value={formData.whoCanPost} onChange={e => setFormData({ ...formData, whoCanPost: e.target.value })} className="w-full border rounded-lg p-2 bg-white outline-none">
                <option value="head_only">Head Only</option>
                <option value="head_and_admins">Head & Admins</option>
                <option value="moderators">Moderators</option>
                <option value="verified_members">Verified Members</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Who can view?</label>
              <select value={formData.whoCanView} onChange={e => setFormData({ ...formData, whoCanView: e.target.value })} className="w-full border rounded-lg p-2 bg-white outline-none">
                <option value="everyone">Everyone</option>
                <option value="verified_members">Verified Members</option>
                <option value="moderators">Moderators</option>
                <option value="head_and_admins">Head & Admins</option>
                <option value="head_only">Head Only</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {initialData ? 'Save Changes' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminAnnouncementsPage = () => {
  const [channels, setChannels] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ communityId: 'all', search: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const fetchCommunities = async () => {
    try {
      const res = await getAllCommunities();
      setCommunities(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await adminAnnouncementApi.getGlobalChannels(filters);
      setChannels(data.channels || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChannel = async (data) => {
    try {
      if (editingChannel) {
        await adminAnnouncementApi.updateChannel(editingChannel._id, data);
        toast.success('Channel updated successfully');
      } else {
        await adminAnnouncementApi.createChannel(data);
        toast.success('Channel created successfully');
      }
      fetchChannels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleArchive = async (channel) => {
    try {
      await adminAnnouncementApi.archiveChannel(channel._id);
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
    if (!window.confirm('Are you sure you want to completely delete this channel?')) return;
    try {
      await adminAnnouncementApi.deleteChannel(channel._id);
      toast.success('Channel deleted');
      fetchChannels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete channel');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-emerald-600" />
            Global Announcement Channels
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage broadcast channels across all communities.</p>
        </div>
        
        <button
          onClick={() => { setEditingChannel(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shrink-0"
        >
          <Plus size={18} />
          <span>Create Channel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Search by channel name or description..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <select
          name="communityId"
          value={filters.communityId}
          onChange={handleFilterChange}
          className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 outline-none"
        >
          <option value="all">All Communities</option>
          {communities.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          Error loading channels: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-medium text-gray-700">No channels found</p>
            </div>
          ) : (
            channels.map((channel) => (
              <div 
                key={channel._id} 
                className={`bg-white border ${channel.isDefault ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-200'} rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                    <Megaphone size={20} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {channel.isArchived && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                        <Archive size={10} /> Archived
                      </span>
                    )}
                    {channel.isDefault && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">
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
                            <Edit2 size={14} /> Edit
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
                
                <h3 className="font-bold text-gray-900 truncate">{channel.name}</h3>
                <p className="text-xs text-emerald-600 font-medium truncate mb-1">
                  {channel.communityId?.name || 'Unknown Community'}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
                  {channel.description || 'No description provided.'}
                </p>
                
                <div className="mt-4 pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-700">Can Post</span>
                    <span className="uppercase text-[10px] bg-gray-100 px-2 py-0.5 rounded text-center">{channel.whoCanPost.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span>Created</span>
                    <span>{formatDistanceToNow(new Date(channel.createdAt))} ago</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <GlobalChannelModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingChannel(null); }}
        onSubmit={handleSaveChannel}
        initialData={editingChannel}
        communities={communities}
      />
    </div>
  );
};

export default AdminAnnouncementsPage;
