import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send } from 'lucide-react';
import { Avatar } from './Avatar';
import { useData } from '../../context/DataProvider';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

export const StoryViewer = ({ story, stories = [], onStoryChange, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [likedStories, setLikedStories] = useState({});
  const { sendChatMessage, getOrCreateChat } = useData();
  const [replyText, setReplyText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const isCurrentStoryLiked = story ? !!likedStories[story.id] : false;

  const toggleLike = (e) => {
    e.stopPropagation();
    if (story) {
      setLikedStories(prev => ({
        ...prev,
        [story.id]: !prev[story.id]
      }));
    }
  };

  const handleSendReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed || !story) return;

    const posterId = story.memberId;
    if (posterId === 'me' || posterId === 'u1') {
      setReplyText('');
      return;
    }

    const resolvedChatId = getOrCreateChat(posterId);
    sendChatMessage(resolvedChatId, `Replied to your story: "${trimmed}"`);
    setReplyText('');

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Grouping and index variables
  const currentMemberStories = story ? stories.filter(s => s.memberId === story.memberId) : [];
  const activeStoryIndex = story ? currentMemberStories.findIndex(s => s.id === story.id) : -1;

  // Track unique member IDs in order of stories
  const memberIds = [];
  stories.forEach(s => {
    if (!memberIds.includes(s.memberId)) {
      memberIds.push(s.memberId);
    }
  });
  const currentMemberIndex = story ? memberIds.indexOf(story.memberId) : -1;

  // Horizontal slide transition direction mapping
  const [direction, setDirection] = useState(1);
  const [prevStoryId, setPrevStoryId] = useState(story?.id);

  if (story && story.id !== prevStoryId) {
    const oldIdx = stories.findIndex(s => s.id === prevStoryId);
    const newIdx = stories.findIndex(s => s.id === story.id);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setPrevStoryId(story.id);
  }

  const [isPaused, setIsPaused] = useState(false);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [story?.id]);

  // Auto advance timeline (5 seconds total)
  useEffect(() => {
    if (!story || isPaused) return;

    const duration = 5000;
    const interval = 50; // Update every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          
          // 1. Check if there is another story for the current member
          if (activeStoryIndex !== -1 && activeStoryIndex < currentMemberStories.length - 1) {
            onStoryChange(currentMemberStories[activeStoryIndex + 1]);
          } 
          // 2. If current member's stories are finished, move to the next member's first story
          else if (currentMemberIndex !== -1 && currentMemberIndex < memberIds.length - 1) {
            const nextMemberId = memberIds[currentMemberIndex + 1];
            const nextMemberStories = stories.filter(s => s.memberId === nextMemberId);
            if (nextMemberStories.length > 0) {
              onStoryChange(nextMemberStories[0]);
            } else {
              onClose();
            }
          } 
          // 3. Otherwise close the story viewer
          else {
            onClose();
          }
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story?.id, isPaused, activeStoryIndex, currentMemberIndex, onStoryChange, onClose]);

  if (!story) return null;

  const mockStoryImage = story.image || '';

  const handleTap = (tapDirection) => {
    if (tapDirection === 'right') {
      // Tap right -> next story for current member, or first story of next member, or close
      if (activeStoryIndex < currentMemberStories.length - 1) {
        onStoryChange(currentMemberStories[activeStoryIndex + 1]);
      } else if (currentMemberIndex < memberIds.length - 1) {
        const nextMemberId = memberIds[currentMemberIndex + 1];
        const nextMemberStories = stories.filter(s => s.memberId === nextMemberId);
        if (nextMemberStories.length > 0) {
          onStoryChange(nextMemberStories[0]);
        } else {
          onClose();
        }
      } else {
        onClose();
      }
    } else {
      // Tap left -> previous story for current member, or last story of previous member, or restart
      if (activeStoryIndex > 0) {
        onStoryChange(currentMemberStories[activeStoryIndex - 1]);
      } else if (currentMemberIndex > 0) {
        const prevMemberId = memberIds[currentMemberIndex - 1];
        const prevMemberStories = stories.filter(s => s.memberId === prevMemberId);
        if (prevMemberStories.length > 0) {
          onStoryChange(prevMemberStories[prevMemberStories.length - 1]);
        } else {
          setProgress(0);
        }
      } else {
        setProgress(0);
      }
    }
  };

  return (
    <AnimatePresence>
      {story && (
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.8 }}
        onDragEnd={(event, info) => {
          // Close if dragged down past 100px OR if flicked down with speed
          if (info.offset.y > 100 || (info.offset.y > 20 && info.velocity.y > 300)) {
            onClose();
          }
        }}
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden touch-none"
      >
        
        {/* Full Card sliding container */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={story.memberId}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 280, damping: 28 },
              opacity: { duration: 0.18 }
            }}
            className="absolute inset-0 w-full h-full flex flex-col bg-black"
          >
            {/* Progress Bar Container - ONLY for the current member's stories */}
            <div className="absolute top-0 pt-4 left-0 right-0 z-20 px-2 flex gap-1.5">
              {currentMemberStories.map((s, idx) => {
                let widthPercent = 0;
                if (idx < activeStoryIndex) widthPercent = 100;
                else if (idx === activeStoryIndex) widthPercent = progress;

                return (
                  <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-75"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Header Overlay */}
            <div className="absolute top-0 pt-8 left-0 right-0 z-20 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={story.initials} avatar={story.avatar} size="sm" color="bg-white/10 text-white" />
                <div className="text-white drop-shadow-md">
                  <h4 className="font-bold text-[14px] leading-tight">{story.name}</h4>
                  <p className="text-[11px] opacity-80">{story.timestamp || '2h ago'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Story Image & Text overlay */}
            <div className="flex-1 relative w-full h-full bg-gray-900">
              <img 
                src={mockStoryImage} 
                alt="Story" 
                className="w-full h-full object-cover rounded-b-3xl"
              />
              {/* Text Overlay */}
              {story.text && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10 pointer-events-none">
                  <span className="text-white text-[19px] font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] bg-black/40 px-6 py-4 rounded-3xl backdrop-blur-xs leading-relaxed max-w-[85%]">
                    {story.text}
                  </span>
                </div>
              )}
              {/* Gradient overlays for legibility */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Story Reply Footer */}
            <div className="absolute bottom-0 pb-6 left-0 right-0 z-20 px-4">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Reply to story..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-5 py-3 text-white placeholder-white/60 text-[14px] outline-none focus:bg-black/60 transition-colors"
                  onClick={(e) => e.stopPropagation()} // Prevent closing/advancing when typing
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                {replyText.trim() ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSendReply(); }}
                    className="w-12 h-12 rounded-full bg-indigo-650 text-white flex items-center justify-center press-scale shrink-0 active:scale-95 transition-all shadow-md"
                  >
                    <Send size={20} className="ml-0.5" />
                  </button>
                ) : (
                  <button 
                    onClick={toggleLike}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center press-scale shrink-0 active:scale-95 transition-all"
                  >
                    <Heart 
                      size={22} 
                      className={isCurrentStoryLiked ? "text-rose-500 fill-rose-500" : "text-slate-500"} 
                      fill={isCurrentStoryLiked ? "currentColor" : "none"} 
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Float Sent Toast */}
            {showToast && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 text-white font-black text-[12px] px-5 py-3.5 rounded-full shadow-2xl border border-white/10 z-[60] flex items-center gap-2 backdrop-blur-xs animate-fade-in select-none">
                <span>Reply Sent! 💬</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Static Overlay Tap Targets in the middle viewport */}
        <div className="absolute top-20 bottom-24 left-0 right-0 z-30 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={() => handleTap('left')} />
          <div className="w-2/3 h-full cursor-pointer" onClick={() => handleTap('right')} />
        </div>

      </motion.div>
      )}
    </AnimatePresence>
  );
};
