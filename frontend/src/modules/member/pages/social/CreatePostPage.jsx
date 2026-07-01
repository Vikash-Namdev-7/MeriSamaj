import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, X, Send, Mic, Square, Radio, Check, Users, Heart, Sparkles, Folder, Grid, Layers, ImagePlus } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';

const MOCK_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', label: 'Indore Meetup' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', label: 'Samaj Bhawan Event' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800', label: 'Community Service' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', label: 'Youth Conference' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', label: 'Health Camp' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800', label: 'Matrimonial Meet' }
];

const CreatePostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createPost, currentUser, addStory } = useData();

  // Route composition modes
  const createStoryMode = location.state?.createStoryMode || false;
  const initialFeedType = location.state?.feedType || 'city';

  // Creator Sub-Tabs: 'post' | 'story' | 'voice'
  const [creatorTab, setCreatorTab] = useState(createStoryMode ? 'story' : 'post');
  
  // Post states
  const [text, setText] = useState('');
  const [activeCategory, setActiveCategory] = useState('Notice');
  const [feedTypeSelection, setFeedTypeSelection] = useState(initialFeedType);
  const [locationInput, setLocationInput] = useState(currentUser.city || '');
  
  // Gallery states
  const [localUploadedImages, setLocalUploadedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([MOCK_GALLERY[0].url]);
  const [previewImage, setPreviewImage] = useState(MOCK_GALLERY[0].url);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const fileInputRef = useRef(null);

  // Story background state
  const [storyBg, setStoryBg] = useState(MOCK_GALLERY[1].url);

  // Voice Broadcast states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Merge uploaded images and stock photos for select grid
  const galleryItems = [...localUploadedImages, ...MOCK_GALLERY.map(img => img.url)];

  useEffect(() => {
    if (selectedImages.length > 0) {
      setPreviewImage(selectedImages[selectedImages.length - 1]);
    }
  }, [selectedImages]);

  // Handle Photo Grid Selection
  const handlePhotoSelect = (url) => {
    if (isMultiSelect) {
      if (selectedImages.includes(url)) {
        // Don't allow empty selection list
        if (selectedImages.length > 1) {
          setSelectedImages(prev => prev.filter(img => img !== url));
        }
      } else {
        setSelectedImages(prev => [...prev, url]);
      }
    } else {
      setSelectedImages([url]);
    }
  };

  // Handle local device image selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Generate local browser resource URLs
    const urls = files.map(file => URL.createObjectURL(file));

    // Prepend to uploaded items list to show at beginning of the grid
    setLocalUploadedImages(prev => [...urls, ...prev]);

    if (isMultiSelect) {
      setSelectedImages(prev => [...prev, ...urls]);
    } else {
      setSelectedImages(urls);
    }
  };

  const handlePublish = () => {
    if (creatorTab === 'post') {
      if (!text.trim()) return;

      const payloadOptions = {
        title: `${activeCategory} Update`,
        category: activeCategory,
        city: locationInput.trim() || currentUser.city,
        audience: 'all',
        likes: 0,
        comments: 0,
        views: 1,
        isLiked: false,
        images: selectedImages,
        feedType: feedTypeSelection,
        author: {
          name: currentUser.name,
          initials: currentUser.initials,
          avatar: currentUser.avatar,
          isVerified: true
        }
      };

      createPost(text.trim(), selectedImages, payloadOptions);
      navigate(-1);
    } else if (creatorTab === 'story') {
      addStory(storyBg, text.trim());
      navigate(-1);
    }
  };

  // Voice Broadcast triggers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        createPost("Voice Broadcast", [], { 
          type: 'audio', 
          audioUrl,
          category: 'Notice',
          title: 'Voice Announcement',
          feedType: feedTypeSelection,
          author: {
            name: currentUser.name,
            initials: currentUser.initials,
            avatar: currentUser.avatar,
            isVerified: true
          }
        });
        
        stream.getTracks().forEach(track => track.stop());
        navigate(-1);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Please allow microphone permissions to record a Voice Broadcast.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const categories = ['Notice', 'Event', 'Matrimony', 'Business', 'Achievement', 'Women', 'Youth', 'Obituary'];

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden text-white select-none">
      
      {/* Hidden File Picker Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        multiple 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* ─── INSTAGRAM HEADER ─── */}
      <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-black z-30 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 active:opacity-60">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-[16px] tracking-tight">
          {creatorTab === 'post' && 'New Post'}
          {creatorTab === 'story' && 'New Story'}
          {creatorTab === 'voice' && 'Voice Broadcast'}
        </span>
        <button
          onClick={handlePublish}
          disabled={creatorTab === 'post' && !text.trim()}
          className={`font-bold text-[15px] transition-opacity ${
            creatorTab === 'post' && !text.trim() ? 'opacity-30 cursor-not-allowed' : 'text-[#0095F6] active:opacity-60'
          }`}
        >
          {creatorTab === 'voice' ? '' : 'Share'}
        </button>
      </div>

      {/* ─── CREATOR CONTENT VIEWPORT ─── */}
      <div className="flex-1 overflow-y-auto bg-black flex flex-col">
        
        {/* POST MODE */}
        {creatorTab === 'post' && (
          <div className="flex flex-col flex-1">
            {/* Top Image Preview & Caption Block */}
            <div className="relative aspect-square w-full bg-slate-900 shrink-0 overflow-hidden">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Caption Area */}
            <div className="p-4 border-y border-white/10 bg-black flex gap-3.5 shrink-0">
              <Avatar initials={currentUser.initials} size="sm" color="bg-brand-primary text-white" />
              <textarea
                placeholder="Write a caption..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-transparent text-[14px] text-white placeholder-white/40 outline-none flex-1 h-14 resize-none font-medium leading-relaxed"
                autoFocus
              />
            </div>

            {/* Post Details & Settings Section */}
            <div className="p-4 bg-black space-y-4 shrink-0">
              {/* Category selector */}
              <div>
                <span className="text-[11.5px] font-bold text-white/50 uppercase tracking-wider block mb-2 px-0.5">Post Category</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                  {categories.map(cat => {
                    const isSelected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4.5 py-2.5 rounded-full border text-[11px] font-bold transition-all shrink-0 active:scale-95 ${
                          isSelected 
                            ? 'border-white bg-white text-black shadow-sm'
                            : 'border-white/15 bg-black text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feed selection */}
              <div>
                <span className="text-[11.5px] font-bold text-white/50 uppercase tracking-wider block mb-2 px-0.5">Target Feed Section</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedTypeSelection('city')}
                    className={`flex-1 py-3 text-[12.5px] font-bold rounded-2xl border transition-all active:scale-95 ${
                      feedTypeSelection === 'city' ? 'bg-[#0095F6] text-white border-transparent' : 'bg-black text-white border-white/15'
                    }`}
                  >
                    📍 City Feed ({currentUser.city})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedTypeSelection('community')}
                    className={`flex-1 py-3 text-[12.5px] font-bold rounded-2xl border transition-all active:scale-95 ${
                      feedTypeSelection === 'community' ? 'bg-[#0095F6] text-white border-transparent' : 'bg-black text-white border-white/15'
                    }`}
                  >
                    👥 Community Feed ({currentUser.community})
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <MapPin size={18} className="text-white/40" />
                <input
                  type="text"
                  placeholder="Add location..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-[13px] text-white placeholder-white/30 font-semibold"
                />
              </div>
            </div>

            {/* Gallery Selector Header */}
            <div className="px-4 py-3 border-t border-white/10 bg-black flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-[14px] font-bold text-white">
                <span>Recent Photos</span>
                <Folder size={15} className="text-white/60" />
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/10 text-white/80 hover:bg-white/15 active:scale-95 transition-all"
                >
                  <ImagePlus size={12} />
                  <span>Upload</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsMultiSelect(!isMultiSelect);
                    setSelectedImages([previewImage]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors active:scale-95 ${
                    isMultiSelect ? 'bg-[#0095F6] text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  <Layers size={12} />
                  <span>Select Multiple</span>
                </button>
              </div>
            </div>

            {/* Photo Grid selector */}
            <div className="grid grid-cols-3 gap-0.5 bg-white/5 pb-20">
              {galleryItems.map((url, idx) => {
                const isSelected = selectedImages.includes(url);
                const selectIndex = selectedImages.indexOf(url);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handlePhotoSelect(url)}
                    className="relative aspect-square cursor-pointer active:opacity-80 transition-opacity overflow-hidden bg-zinc-900"
                  >
                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#0095F6] text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-md">
                          {isMultiSelect ? selectIndex + 1 : '✓'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STORY MODE */}
        {creatorTab === 'story' && (
          <div className="flex flex-col flex-1">
            {/* Story Background Preview */}
            <div className="relative aspect-[9/16] w-full max-h-[60vh] bg-slate-900 shrink-0 overflow-hidden">
              <img src={storyBg} alt="Story Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
              
              {/* Text Overlay Preview */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
                <span className="text-white text-[19px] font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] bg-black/40 px-6 py-4 rounded-3xl backdrop-blur-xs leading-relaxed max-w-[85%]">
                  {text.trim() || 'Tap text box to write overlay...'}
                </span>
              </div>
            </div>

            {/* Story Text Overlay Input */}
            <div className="p-4 border-y border-white/10 bg-black flex gap-3.5 shrink-0">
              <textarea
                placeholder="Write text overlay for story..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-transparent text-[14px] text-white placeholder-white/40 outline-none flex-1 h-14 resize-none font-medium leading-relaxed"
              />
            </div>

            {/* Gallery Background Selector Header */}
            <div className="px-4 py-3 bg-black flex items-center justify-between shrink-0">
              <span className="text-[13px] font-bold text-white/60">Choose Story Background</span>
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/10 text-white/80 hover:bg-white/15 active:scale-95 transition-all"
              >
                <ImagePlus size={12} />
                <span>Upload</span>
              </button>
            </div>

            {/* Story Background Grid Selector */}
            <div className="grid grid-cols-3 gap-0.5 bg-white/5 pb-20">
              {galleryItems.map((url, idx) => {
                const isSelected = storyBg === url;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setStoryBg(url)}
                    className="relative aspect-square cursor-pointer active:opacity-80 transition-opacity overflow-hidden bg-zinc-900"
                  >
                    <img src={url} alt="Story Background Gallery" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/30 border-4 border-[#0095F6]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VOICE BROADCAST MODE */}
        {creatorTab === 'voice' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black min-h-[50vh]">
            <div className="mb-8 text-center px-4">
              <h3 className="text-[18px] font-bold text-white mb-2">Voice Broadcast</h3>
              <p className="text-[13px] text-white/50 max-w-[240px] mx-auto leading-relaxed">
                Hold the microphone button to record an announcement. It will be posted directly to your target feed.
              </p>
            </div>

            {/* Target Feed for Voice broadcast */}
            <div className="w-full max-w-[320px] mb-8">
              <span className="text-[11.5px] font-bold text-white/50 uppercase tracking-wider block mb-2.5 px-0.5 text-center">Broadcast Feed</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeedTypeSelection('city')}
                  className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    feedTypeSelection === 'city' ? 'bg-white text-black border-transparent' : 'bg-black text-white/70 border-white/10'
                  }`}
                >
                  City Feed
                </button>
                <button
                  type="button"
                  onClick={() => setFeedTypeSelection('community')}
                  className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    feedTypeSelection === 'community' ? 'bg-white text-black border-transparent' : 'bg-black text-white/70 border-white/10'
                  }`}
                >
                  Community Feed
                </button>
              </div>
            </div>

            {/* Recording Animation */}
            {isRecording ? (
              <div className="flex flex-col items-center animate-fade-in mb-8">
                <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-rose-500/20 border-4 border-rose-400/30">
                  <Mic size={40} className="text-white" />
                </div>
                <span className="text-[20px] font-bold font-mono text-rose-500">{formatDuration(recordingDuration)}</span>
                <span className="text-[12px] text-white/40 mt-1">Recording active</span>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-white/10">
                  <Mic size={40} className="text-white/40" />
                </div>
                <span className="text-[20px] font-bold text-white/30 font-mono">00:00</span>
                <span className="text-[12px] text-white/40 mt-1">Ready to record</span>
              </div>
            )}

            {/* Hold-to-record trigger button */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-48 py-4 rounded-full font-bold text-[13.5px] shadow-lg transition-all select-none press-scale ${
                isRecording 
                  ? 'bg-rose-600 text-white shadow-rose-600/25 scale-105'
                  : 'bg-[#0095F6] text-white shadow-[#0095F6]/25'
              }`}
            >
              {isRecording ? 'Release to Send' : 'Hold to Record'}
            </button>
          </div>
        )}

      </div>

      {/* ─── BOTTOM INSTAGRAM SELECTOR TAB BAR ─── */}
      <div className="h-16 border-t border-white/10 bg-black flex items-center justify-center relative shrink-0 z-30 pb-safe">
        <div className="flex gap-8 px-6 text-[12px] font-bold uppercase tracking-wider">
          <button 
            onClick={() => {
              setCreatorTab('post');
              setText('');
            }}
            className={`transition-colors py-2 ${creatorTab === 'post' ? 'text-[#0095F6]' : 'text-white/40 hover:text-white/70'}`}
          >
            Post
          </button>
          <button 
            onClick={() => {
              setCreatorTab('story');
              setText('');
            }}
            className={`transition-colors py-2 ${creatorTab === 'story' ? 'text-[#0095F6]' : 'text-white/40 hover:text-white/70'}`}
          >
            Story
          </button>
          <button 
            onClick={() => {
              setCreatorTab('voice');
              setText('');
            }}
            className={`transition-colors py-2 ${creatorTab === 'voice' ? 'text-[#0095F6]' : 'text-white/40 hover:text-white/70'}`}
          >
            Voice
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreatePostPage;
