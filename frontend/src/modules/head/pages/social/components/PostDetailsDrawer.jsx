import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, MessageSquare, User, Calendar, MapPin, Building2, 
  Trash2, RefreshCw, AlertCircle, ShieldCheck, Film, Image as ImageIcon,
  Clock, ExternalLink, ThumbsUp
} from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';
import { headSocialService } from '../services/headSocialService';

export const PostDetailsDrawer = ({ postId, isOpen, onClose, onPostAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'likes' | 'comments'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchDetails();
    } else {
      setDetails(null);
      setError(null);
    }
  }, [isOpen, postId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await headSocialService.getPostDetails(postId);
      if (res.success) {
        setDetails(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!window.confirm('Are you sure you want to soft delete this post?')) return;
    try {
      setActionLoading(true);
      await headSocialService.softDeletePost(postId);
      await fetchDetails();
      if (onPostAction) onPostAction('delete', postId);
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await headSocialService.restorePost(postId);
      await fetchDetails();
      if (onPostAction) onPostAction('restore', postId);
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const post = details?.post;
  const likes = details?.likes || [];
  const comments = details?.comments || [];

  const authorName = post?.userId?.name || post?.authorId?.name || 'Anonymous User';
  const authorAvatar = post?.userId?.avatar || post?.authorId?.avatar;
  const cityName = post?.cityId?.name || post?.userId?.city || 'Indore';
  const communityName = post?.communityId?.name || 'Agrawal Samaj';

  const isDeleted = post?.isDeleted;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Post Moderation Details</h3>
                  <p className="text-xs text-slate-400">Live single-source record from Member Panel</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Fetching live post details & engagement...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <h4 className="text-base font-semibold text-slate-800">Error Loading Details</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-md">{error}</p>
                <button
                  onClick={fetchDetails}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : post ? (
              <div className="flex-1 overflow-y-auto">
                {/* Status Alert Banner */}
                {isDeleted && (
                  <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between text-rose-700">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>This post is currently Soft-Deleted and hidden from standard feeds.</span>
                    </div>
                    <button
                      onClick={handleRestore}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Restoring...' : 'Restore Post'}
                    </button>
                  </div>
                )}

                {/* Author & Meta Summary */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={authorAvatar} name={authorName} className="w-12 h-12 text-base font-bold shadow-sm" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{authorName}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {cityName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-emerald-500" /> {communityName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isDeleted 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isDeleted ? 'Deleted' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Posted: {new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Feed Scope:</span>
                      <span className="capitalize px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium">
                        {post.feedType || 'city'} Feed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engagement Metrics Tabs Header */}
                <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'overview'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Post Content</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('likes')}
                    className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'likes'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Likes ({details.likesCount ?? likes.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'comments'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    <span>Comments ({details.commentsCount ?? comments.length})</span>
                  </button>
                </div>

                {/* Tab Content Panes */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Full Post Text */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Post Content Text</h5>
                        <p className="text-slate-800 text-base leading-relaxed whitespace-pre-line font-medium">
                          {post.content}
                        </p>
                      </div>

                      {/* Media Attachments Gallery */}
                      {((post.media && post.media.length > 0) || (post.images && post.images.length > 0)) && (
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-slate-500" /> Media Attachments ({post.media?.length || post.images?.length})
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {post.media && post.media.length > 0 ? (
                              post.media.map((item, idx) => (
                                <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-200">
                                  {item.type === 'video' ? (
                                    <video src={item.url} controls className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                                  )}
                                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] uppercase font-bold rounded">
                                    {item.type}
                                  </div>
                                </div>
                              ))
                            ) : (
                              post.images.map((img, idx) => (
                                <div key={idx} className="rounded-xl overflow-hidden bg-slate-100 aspect-video border border-slate-200">
                                  <img src={img} alt={`Post image ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'likes' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Users Who Liked This Post</h5>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Total: {likes.length}
                        </span>
                      </div>

                      {likes.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <Heart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-medium text-slate-600">No likes registered yet on this post.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                          {likes.map((likeItem) => {
                            const u = likeItem.userId || {};
                            return (
                              <div key={likeItem._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <Avatar src={u.avatar} name={u.name || 'Member'} className="w-10 h-10 text-sm font-semibold" />
                                  <div>
                                    <h6 className="font-semibold text-slate-800 text-sm">{u.name || 'Member User'}</h6>
                                    <p className="text-xs text-slate-500">{u.city || u.community || 'Verified Member'}</p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {new Date(likeItem.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Comments Thread</h5>
                        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                          Total: {comments.length}
                        </span>
                      </div>

                      {comments.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-medium text-slate-600">No comments posted yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((comment) => {
                            const u = comment.userId || {};
                            return (
                              <div key={comment._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                                <Avatar src={u.avatar} name={u.name || 'User'} className="w-9 h-9 text-xs font-semibold mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h6 className="font-bold text-slate-800 text-sm">{u.name || 'Anonymous'}</h6>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 text-sm mt-1.5 leading-relaxed font-normal">
                                    {comment.content || comment.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Footer Action Controls */}
            {post && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  ID: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{post._id}</code>
                </div>

                <div className="flex items-center gap-3">
                  {isDeleted ? (
                    <button
                      onClick={handleRestore}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Restore Post</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSoftDelete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Soft Delete Post</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
