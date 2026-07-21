import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, MessageCircle, Eye, Share2, Bookmark, 
  Trash2, ShieldAlert, Award, Pin, CheckCircle2, XCircle, 
  AlertTriangle, Clock, MapPin, Building2, User, Play, ExternalLink
} from 'lucide-react';
import axios from 'axios';

// Private Axios instance mapping helper (or fallback)
const getAuthHeaders = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('admin_jwt='))?.split('=')[1] || '';
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const [postRes, commentRes] = await Promise.all([
        axios.get(`/api/v1/admin/social/posts/${id}`, getAuthHeaders()),
        axios.get(`/api/v1/admin/social/comments?postId=${id}`, getAuthHeaders())
      ]);
      if (postRes.data.success) {
        setPost(postRes.data.data);
        setEditContent(postRes.data.data.content);
        setEditCategory(postRes.data.data.category);
      }
      if (commentRes.data.success) {
        setComments(commentRes.data.data);
      }
    } catch (err) {
      setError('Failed to load post details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.patch(`/api/v1/admin/social/posts/${id}`, {
        content: editContent,
        category: editCategory
      }, getAuthHeaders());
      if (res.data.success) {
        setPost(res.data.data);
        setIsEditing(false);
        showSuccess('Post updated successfully!');
      }
    } catch (err) {
      setError('Failed to update post.');
    }
  };

  const handleTogglePin = async () => {
    try {
      const res = await axios.post(`/api/v1/admin/social/posts/${id}/pin`, {}, getAuthHeaders());
      if (res.data.success) {
        setPost(res.data.data);
        showSuccess(res.data.data.isPinned ? 'Post pinned successfully!' : 'Post unpinned successfully!');
      }
    } catch (err) {
      setError('Action failed.');
    }
  };

  const handleToggleFeature = async () => {
    try {
      const res = await axios.post(`/api/v1/admin/social/posts/${id}/feature`, {}, getAuthHeaders());
      if (res.data.success) {
        setPost(res.data.data);
        showSuccess(res.data.data.isFeatured ? 'Post featured successfully!' : 'Post unfeatured successfully!');
      }
    } catch (err) {
      setError('Action failed.');
    }
  };

  const handleToggleHide = async () => {
    try {
      const res = await axios.post(`/api/v1/admin/social/posts/${id}/hide`, {}, getAuthHeaders());
      if (res.data.success) {
        setPost(res.data.data);
        showSuccess(res.data.data.status === 'archived' ? 'Post hidden successfully!' : 'Post made visible!');
      }
    } catch (err) {
      setError('Action failed.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await axios.delete(`/api/v1/admin/social/posts/${id}`, getAuthHeaders());
      if (res.data.success) {
        navigate(-1);
      }
    } catch (err) {
      setError('Failed to delete post.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/api/v1/admin/social/comments/${commentId}`, getAuthHeaders());
      setComments(prev => prev.filter(c => c._id !== commentId));
      showSuccess('Comment deleted.');
    } catch (err) {
      setError('Action failed.');
    }
  };

  const handleModerateComment = async (commentId, action) => {
    try {
      await axios.post(`/api/v1/admin/social/comments/${commentId}/${action}`, {}, getAuthHeaders());
      fetchPostDetails();
      showSuccess(`Comment ${action}d successfully.`);
    } catch (err) {
      setError('Action failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-2" />
        <h2 className="text-xl font-bold text-slate-800">Post Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-55 pb-16 p-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-[13px] font-bold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-50 bg-rose-50 text-rose-800 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-rose-100 animate-fade-in">
          <AlertTriangle size={16} className="text-rose-500" />
          <span className="text-[13px] font-bold">{error}</span>
          <button onClick={() => setError('')} className="ml-2 text-rose-500 font-extrabold">&times;</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-xs">
          <ArrowLeft size={18} className="text-slate-700" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-850">Post Verification & Moderation</h1>
          <p className="text-[12.5px] text-slate-400 font-bold mt-0.5">Post ID: {post._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Post Contents & Media */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            {/* Author details card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center rounded-2xl">
                  {post.userId?.name ? post.userId.name.substring(0, 2).toUpperCase() : 'M'}
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-slate-800 flex items-center gap-1.5">
                    {post.userId?.name || 'Unknown User'}
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-extrabold uppercase">{post.userId?.role || 'member'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    Posted on {new Date(post.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase ${
                post.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                post.status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {post.status}
              </span>
            </div>

            {/* Editing / Content Block */}
            <div className="py-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase">Post Content</label>
                    <textarea 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full mt-1.5 p-4 border border-slate-200 rounded-2xl text-[13.5px] font-medium text-slate-700 focus:outline-indigo-500 min-h-32" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-1.5">Category</label>
                    <select 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="p-3 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 bg-white"
                    >
                      <option value="Notice">Notice</option>
                      <option value="Event">Event</option>
                      <option value="Business">Business</option>
                      <option value="Matrimony">Matrimony</option>
                      <option value="Achievement">Achievement</option>
                      <option value="Obituary">Obituary</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-[12.5px] hover:bg-indigo-700 transition-colors">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-[12.5px] hover:bg-slate-200 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10.5px] font-extrabold uppercase">{post.category}</span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10.5px] font-extrabold uppercase">Feed: {post.feedType || 'city'}</span>
                  </div>
                  <p className="text-[14.5px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              )}
            </div>

            {/* Media Attachments Section */}
            {post.media && post.media.length > 0 && (
              <div className="pb-4">
                <h5 className="text-[11px] font-black text-slate-400 uppercase mb-3">Attachments ({post.media.length})</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.media.map((med, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-xs">
                      {med.type === 'video' ? (
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <video src={med.url} controls className="w-full h-full object-cover" />
                        </div>
                      ) : med.type === 'youtube' ? (
                        <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center p-3 text-center">
                          <Play size={32} className="text-red-500 fill-red-500 mb-1" />
                          <span className="text-[11px] font-bold text-white truncate max-w-full">YouTube Embed Link</span>
                          <a href={med.url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-1 hover:text-indigo-400">
                            Open Video <ExternalLink size={10} />
                          </a>
                        </div>
                      ) : med.type === 'instagram' ? (
                        <div className="aspect-video bg-indigo-900 flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-[11px] font-bold text-pink-400 mb-1">Instagram Embed Link</span>
                          <a href={med.url} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-1 hover:text-indigo-400">
                            View Post <ExternalLink size={10} />
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-video">
                          <img src={med.url} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments List Moderation */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-[14px] font-black text-slate-800 mb-4 pb-3 border-b border-slate-100 uppercase tracking-wider">Comments list ({comments.length})</h3>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-slate-400 font-bold">No comments on this post yet.</div>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-9 h-9 bg-slate-50 text-slate-600 font-black text-xs flex items-center justify-center rounded-xl border border-slate-150">
                      {c.userId?.name ? c.userId.name.substring(0,2).toUpperCase() : 'M'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-[13px] font-black text-slate-800">{c.userId?.name || 'Member'}</h6>
                          <p className="text-[10.5px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {c.status === 'hidden' ? (
                            <button onClick={() => handleModerateComment(c._id, 'approve')} className="p-1 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50/50" title="Make Visible">
                              <CheckCircle2 size={15} />
                            </button>
                          ) : (
                            <button onClick={() => handleModerateComment(c._id, 'reject')} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" title="Hide Comment">
                              <XCircle size={15} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteComment(c._id)} className="p-1 text-slate-450 hover:text-rose-600 rounded-lg hover:bg-rose-50/50" title="Delete Comment">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-600 font-medium mt-1 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Post Analytics & Quick Actions */}
        <div className="space-y-6">
          {/* Post Metrics Stats */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h4 className="text-[12.5px] font-black text-slate-800 uppercase mb-4 tracking-wider">Post Analytics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase">Likes</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{post.likesCount || 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase">Comments</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{post.commentsCount || 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase">Views</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{post.viewsCount || 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase">Shares</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{post.sharesCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3.5">
            <h4 className="text-[12.5px] font-black text-slate-800 uppercase tracking-wider mb-2">Actions Panel</h4>

            <button 
              onClick={() => setIsEditing(true)} 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 font-extrabold text-[12.5px] text-slate-700 rounded-xl transition-all"
            >
              Edit Post Caption
            </button>

            <button 
              onClick={handleTogglePin} 
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 border font-extrabold text-[12.5px] rounded-xl transition-all ${
                post.isPinned 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Pin size={15} className={post.isPinned ? 'fill-amber-600' : ''} />
              {post.isPinned ? 'Unpin Post' : 'Pin Post'}
            </button>

            <button 
              onClick={handleToggleFeature} 
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 border font-extrabold text-[12.5px] rounded-xl transition-all ${
                post.isFeatured 
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/50' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Award size={15} />
              {post.isFeatured ? 'Unfeature Post' : 'Feature Post'}
            </button>

            <button 
              onClick={handleToggleHide} 
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 border font-extrabold text-[12.5px] rounded-xl transition-all ${
                post.status === 'archived'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={15} />
              {post.status === 'archived' ? 'Make Post Public' : 'Hide Post'}
            </button>

            <button 
              onClick={handleDelete} 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 hover:bg-rose-100/60 font-extrabold text-[12.5px] text-rose-700 rounded-xl transition-all"
            >
              <Trash2 size={15} />
              Delete Post
            </button>
          </div>

          {/* Location & Metadata Details */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-[12.5px] font-black text-slate-800 uppercase tracking-wider mb-2">Scope Metadata</h4>
            <div className="flex items-center gap-3">
              <MapPin size={17} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">City Location</span>
                <span className="text-[13px] font-bold text-slate-700">{post.cityId?.name || 'Indore'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={17} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Community Samaj</span>
                <span className="text-[13px] font-bold text-slate-700">{post.communityId?.name || 'Namdev Samaj'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={17} className="text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Author Email</span>
                <span className="text-[13px] font-bold text-slate-700">{post.userId?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
