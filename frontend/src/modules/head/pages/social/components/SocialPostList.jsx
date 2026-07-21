import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Calendar, Filter, Eye, Trash2, RefreshCw, AlertCircle, 
  Heart, MessageSquare, Image as ImageIcon, CheckCircle, ShieldAlert,
  ChevronLeft, ChevronRight, X, Building2, MapPin, Sparkles
} from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';
import { headSocialService } from '../services/headSocialService';
import { PostDetailsDrawer } from './PostDetailsDrawer';

export const SocialPostList = ({ feedType, title, subtitle, icon: IconComponent }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jurisdiction, setJurisdiction] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active'); // 'active' | 'deleted' | 'all'

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Drawer State
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        status,
        page,
        limit: 10
      };

      const res = feedType === 'city' 
        ? await headSocialService.getCityFeed(params)
        : await headSocialService.getCommunityFeed(params);

      if (res.success) {
        setPosts(res.data || []);
        setJurisdiction(res.jurisdiction || null);
        setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [feedType, search, status, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSoftDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to soft delete this post?')) return;
    try {
      await headSocialService.softDeletePost(postId);
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Soft delete failed');
    }
  };

  const handleRestore = async (postId) => {
    try {
      await headSocialService.restorePost(postId);
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Restore failed');
    }
  };

  const handleOpenDrawer = (postId) => {
    setSelectedPostId(postId);
    setIsDrawerOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('active');
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              {IconComponent ? <IconComponent className="w-8 h-8 text-indigo-400" /> : <Sparkles className="w-8 h-8 text-indigo-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">{subtitle}</p>
            </div>
          </div>

          {jurisdiction && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-medium text-slate-200">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Assigned Scope: <strong>{jurisdiction.communityName}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or post content..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-4 flex items-center justify-end">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="active">Active Posts</option>
              <option value="deleted">Deleted Posts</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Filter Indicator & Clear button */}
        {(search || status !== 'active') && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filtered search active • Showing matching records
            </span>
            <button
              onClick={resetFilters}
              className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table / Posts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-semibold">Loading live feed posts...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 p-6">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold text-base">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 p-6">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Posts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No posts match your current filter criteria for this assigned feed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Info</th>
                  <th className="py-3.5 px-4">{feedType === 'city' ? 'City' : 'Community'}</th>
                  <th className="py-3.5 px-4">Post Preview</th>
                  <th className="py-3.5 px-4 text-center">Media</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-center">Engagement</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                {posts.map((post) => {
                  const author = post.userId || post.authorId || {};
                  const authorName = author.name || 'Member User';
                  const authorAvatar = author.avatar;
                  const cityName = post.cityId?.name || author.city || 'Indore';
                  const commName = post.communityId?.name || 'Agrawal Samaj';

                  const mediaCount = (post.media?.length || 0) + (post.images?.length || 0);
                  const firstMedia = post.media && post.media.length > 0 ? post.media[0].url : (post.images && post.images.length > 0 ? post.images[0] : null);

                  const isDeleted = post.isDeleted;

                  return (
                    <tr key={post._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={authorAvatar} name={authorName} className="w-9 h-9 text-xs font-bold shadow-xs" />
                          <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{authorName}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{author.phone || author.email || 'Member'}</p>
                          </div>
                        </div>
                      </td>

                      {/* City or Community */}
                      <td className="py-3.5 px-4">
                        {feedType === 'city' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                            <MapPin className="w-3 h-3" /> {cityName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                            <Building2 className="w-3 h-3" /> {commName}
                          </span>
                        )}
                      </td>

                      {/* Content Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-800 text-xs line-clamp-2 leading-snug font-normal">
                          {post.content}
                        </p>
                      </td>

                      {/* Media Thumbnail */}
                      <td className="py-3.5 px-4 text-center">
                        {firstMedia ? (
                          <div className="relative w-10 h-10 mx-auto rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group">
                            <img 
                              src={firstMedia} 
                              alt="Media thumbnail" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100';
                              }}
                            />
                            {mediaCount > 1 && (
                              <span className="absolute inset-0 bg-black/60 text-white font-bold text-[10px] flex items-center justify-center">
                                +{mediaCount - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString()}<br />
                        <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>

                      {/* Engagement Counts */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            <Heart className="w-3 h-3 fill-rose-500" /> {post.likesCount ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                            <MessageSquare className="w-3 h-3" /> {post.commentsCount ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase ${
                          isDeleted
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isDeleted ? 'Deleted' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(post._id)}
                            title="View Details"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isDeleted ? (
                            <button
                              onClick={() => handleRestore(post._id)}
                              title="Restore Post"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(post._id)}
                              title="Soft Delete"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!loading && posts.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing page <strong className="text-slate-800">{pagination.page}</strong> of <strong className="text-slate-800">{pagination.totalPages}</strong> ({pagination.total} total posts)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <PostDetailsDrawer
        postId={selectedPostId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPostAction={() => fetchPosts()}
      />
    </div>
  );
};
