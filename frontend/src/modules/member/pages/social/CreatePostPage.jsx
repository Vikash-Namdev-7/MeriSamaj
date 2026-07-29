import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Camera, X, Send, Mic, Radio, Users, 
  Heart, Sparkles, Folder, Layers, ImagePlus, UploadCloud, Play, 
  Trash2, Monitor, Smartphone, Link, AlertCircle 
} from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';

const Instagram = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size || "24"}
    height={props.size || "24"}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Youtube = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size || "24"}
    height={props.size || "24"}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);



const CreatePostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createPost, currentUser, addStory } = useData();

  const createStoryMode = location.state?.createStoryMode || false;

  // Tabs: 'post' | 'story'
  const [activeTab, setActiveTab] = useState(createStoryMode ? 'story' : 'post');

  // Input states
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Normal');
  const [isPinned, setIsPinned] = useState(false);
  const [feedType, setFeedType] = useState('city');
  const [locationInput, setLocationInput] = useState(currentUser?.city || '');
  
  // Media attachments: array of { type: 'image'|'video'|'youtube'|'instagram', url: string, file?: File }
  const [attachments, setAttachments] = useState([]);
  const [mediaLink, setMediaLink] = useState('');
  
  // Story specific states
  const [storyText, setStoryText] = useState('');

  // Upload emulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Auto detect pasted media link format
  useEffect(() => {
    if (!mediaLink.trim()) return;

    const link = mediaLink.trim();
    let type = 'image';
    let cleanUrl = link;

    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      type = 'youtube';
    } else if (link.includes('instagram.com/')) {
      type = 'instagram';
    } else if (link.match(/\.(mp4|webm|ogg|mov)$/i) || link.includes('video')) {
      type = 'video';
    } else {
      type = 'image'; // default fallback for raw image links
    }

    // Add media attachment
    if (activeTab === 'story') {
      // Story allows exactly 1 media attachment
      setAttachments([{ type, url: cleanUrl }]);
    } else {
      setAttachments(prev => [...prev, { type, url: cleanUrl }]);
    }

    setMediaLink('');
  }, [mediaLink, activeTab]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Handle uploaded files (images, videos, gifs)
  const handleFiles = (files) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Emulate progress bar
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 200);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    files.forEach(file => {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result;
        const item = { type, url, file };
        if (activeTab === 'story') {
          setAttachments([item]);
        } else {
          setAttachments(prev => [...prev, item]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePublish = async () => {
    const mediaUrls = attachments.map(att => att.url);

    if (activeTab === 'post') {
      if (!caption.trim() && mediaUrls.length === 0) return;

      const payloadOptions = {
        title: `${category} Update`,
        category,
        city: locationInput.trim() || currentUser?.city || 'Indore',
        audience: 'all',
        likes: [],
        comments: [],
        images: mediaUrls, // arrays of images/videos/links are stored here
        feedType,
        isPinned,
      };

      try {
        await createPost(caption.trim() || "Shared media", mediaUrls, payloadOptions);
        navigate(-1);
      } catch (err) {
        alert(`Post creation failed: ${err.message}`);
      }
    } else if (activeTab === 'story') {
      // storyBg is either the media attachment URL, or default background gradient
      const storyBg = attachments.length > 0 ? attachments[0].url : 'linear-gradient(135deg, #f472b6 0%, #7c3aed 100%)';
      addStory(storyBg, storyText.trim());
      navigate(-1);
    }
  };

  // Extract YouTube ID for embed preview
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const params = new URLSearchParams(url.split('?')[1]);
      videoId = params.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const categories = ['Normal', 'Announcement', 'Event', 'Blood Donation', 'Emergency'];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col text-slate-800 select-none pb-8 md:pb-0 font-sans">
      
      {/* Hidden File Upload Element */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*,video/*" 
        multiple={activeTab === 'post'} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* HEADER SECTION — Glass Morphism */}
      <header className="h-14 bg-white/85 backdrop-blur-xl border-b border-purple-100/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-[0_2px_12px_rgba(124,58,237,0.03)] gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 hover:bg-purple-50 transition-colors press-scale shrink-0">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="min-w-0 text-left">
            <h1 className="font-extrabold text-[16px] tracking-tight text-slate-800 whitespace-nowrap">Create Content</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider hidden sm:block truncate">Share Post & Story</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70">
          <button
            onClick={() => { setActiveTab('post'); setAttachments([]); }}
            className={`px-3.5 py-1.5 rounded-lg text-[11.5px] font-extrabold transition-all press-scale ${
              activeTab === 'post' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Post
          </button>
          <button
            onClick={() => { setActiveTab('story'); setAttachments([]); }}
            className={`px-3.5 py-1.5 rounded-lg text-[11.5px] font-extrabold transition-all press-scale ${
              activeTab === 'story' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Story
          </button>
        </div>

        {/* Publish Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePublish}
            disabled={isUploading || (activeTab === 'post' && !caption.trim() && attachments.length === 0)}
            className={`px-4 py-2 rounded-xl text-[12px] font-extrabold tracking-wide transition-all press-scale flex items-center gap-1.5 ${
              isUploading || (activeTab === 'post' && !caption.trim() && attachments.length === 0)
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:brightness-105'
            }`}
          >
            <Send size={13} strokeWidth={2.5} />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 space-y-5 text-left animate-fade-in">
        
        {/* Ultra Compact Micro Bar */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-xl py-1.5 px-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles size={13} className="text-purple-600 shrink-0" />
            <span className="text-[11px] font-extrabold text-slate-700 truncate">
              {activeTab === 'post' ? 'Create Feed Post' : 'Create 24h Story'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-semibold text-slate-500 truncate">
              📍 {currentUser?.city || 'Indore'}
            </span>
          </div>

          <span className="bg-white border border-slate-200/80 px-2 py-0.5 rounded-md text-[9px] font-extrabold text-purple-700 shrink-0 ml-2">
            {activeTab === 'post' ? 'Public' : '24 Hours'}
          </span>
        </div>
        
        <div className="flex flex-col gap-5">
          
          {/* Post Content Area */}
          {activeTab === 'post' && (
            <div className="bg-white rounded-[26px] border border-slate-200/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              
              {/* Creator details */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[13px] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.initials || 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-slate-800">{currentUser?.name || 'Community Member'}</h3>
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">Sharing to Samaj Feed</p>
                </div>
              </div>

              {/* Caption Text Box */}
              <textarea
                placeholder="What's on your mind? Share news, events, or announcements..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[13.5px] font-medium text-slate-800 placeholder-slate-400 outline-none h-32 resize-none leading-relaxed transition-all focus:border-purple-500/50 focus:bg-white"
              />

              {/* Category Options */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">Post Category</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {categories.map(cat => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-1.5 rounded-full border text-[11px] font-extrabold transition-all shrink-0 press-scale ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pin Options */}
              {['Announcement', 'Emergency', 'Event'].includes(category) && (
                <div className="flex items-center gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
                  <input 
                    type="checkbox" 
                    id="pinPost" 
                    checked={isPinned} 
                    onChange={(e) => setIsPinned(e.target.checked)} 
                    className="w-4 h-4 text-purple-600 rounded border-amber-300 focus:ring-purple-500"
                  />
                  <label htmlFor="pinPost" className="text-[11.5px] font-extrabold text-amber-900">Pin post to top of community feed</label>
                </div>
              )}

              {/* Feed Scope details */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">Target Audience</label>
                <div className="flex gap-1.5 bg-slate-100/80 rounded-2xl p-1 border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setFeedType('city')}
                    className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl transition-all press-scale ${
                      feedType === 'city' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📍 City Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedType('community')}
                    className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl transition-all press-scale ${
                      feedType === 'community' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👥 Community
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedType('both')}
                    className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl transition-all press-scale ${
                      feedType === 'both' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🌐 Both (City & Community)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Story Content Area */}
          {activeTab === 'story' && (
            <div className="bg-white rounded-[26px] border border-slate-200/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[13px] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.initials || 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-slate-800">{currentUser?.name || 'Community Member'}</h3>
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">Designing interactive story</p>
                </div>
              </div>

              {/* Story Overlay Text Box */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">Story Overlay Text</label>
                <textarea
                  placeholder="Type overlay text to show on your story..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[13.5px] font-medium text-slate-800 placeholder-slate-400 outline-none h-24 resize-none leading-relaxed transition-all focus:border-purple-500/50 focus:bg-white"
                />
              </div>

            </div>
          )}

          {/* MEDIA UPLOAD AREA */}
          <div className="bg-white rounded-[26px] border border-slate-200/80 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-0.5">Attach Media & Content Links</label>

            {/* Drag Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                isDragging 
                  ? 'border-purple-500 bg-purple-50/40' 
                  : 'border-purple-200/70 bg-purple-50/20 hover:bg-purple-50/50'
              }`}
            >
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100">
                <UploadCloud size={24} className="animate-bounce" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-slate-800">Upload image, video, or GIF</p>
                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Drag & drop files or click to browse</p>
              </div>
              <div className="flex gap-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-2.5 mt-1 w-full justify-center">
                <span>PNG, JPG, WEBP</span>
                <span>•</span>
                <span>MP4, WEBM (Max 15MB)</span>
              </div>
            </div>

            {/* Upload Progress Bar Emulation */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* URL Paste Media Input */}
            <div className="space-y-2">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block px-1">Paste Media or Social URL</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                  <Link size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Paste YouTube links, Instagram links, or direct MP4/JPG URLs..."
                    value={mediaLink}
                    onChange={(e) => setMediaLink(e.target.value)}
                    className="bg-transparent outline-none w-full text-[12px] text-slate-700 placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal px-1">
                Supported formats: YouTube (embed player), Instagram posts/reels (link preview), direct image URLs, and MP4 direct videos.
              </p>
            </div>

            {/* List of attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Attachments ({attachments.length})</span>
                  {activeTab === 'story' && <span className="text-[9px] text-amber-600 font-semibold">Story mode: Max 1 media</span>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-2.5 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-550 relative">
                          {att.type === 'image' && <img src={att.url} className="w-full h-full object-cover" alt="Thumbnail" />}
                          {att.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-slate-100"><Play size={14} className="text-indigo-500" /></div>}
                          {att.type === 'youtube' && <Youtube size={16} className="text-rose-500" />}
                          {att.type === 'instagram' && <Instagram size={16} className="text-pink-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate capitalize">{att.type} Source</p>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{att.url}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 active:scale-90 transition-all shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};

export default CreatePostPage;
