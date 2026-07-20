import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, BarChart2, Users, FileText, Image as ImageIcon, 
  Video, Heart, MessageCircle, Eye, ArrowRight, UserPlus, 
  UserMinus, MessageSquare, Play, Clock, TrendingUp 
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { AnimatedPage } from '../../components/layout/AnimatedPage';
import { Avatar } from '../../components/common/Avatar';

export default function SocialInsightsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, members, posts, toggleFollowMember } = useData();

  // Find out if a specific tab was requested via navigation state (default to 'followers')
  const initialTab = location.state?.activeTab || 'followers';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Set page scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Guarantee mock data is present
  const stats = {
    posts: currentUser?.stats?.posts ?? 42,
    videos: currentUser?.stats?.videos ?? 12,
    images: currentUser?.stats?.images ?? 128,
    followers: currentUser?.stats?.followers ?? 1240,
    following: currentUser?.stats?.following ?? 350,
    likesReceived: currentUser?.stats?.likesReceived ?? '12.4K',
    commentsReceived: currentUser?.stats?.commentsReceived ?? 856,
    profileVisits: currentUser?.stats?.profileVisits ?? '3.2K'
  };

  // Define tab configuration
  const tabs = [
    { id: 'followers', label: 'Followers', value: stats.followers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', activeBg: 'bg-purple-600' },
    { id: 'following', label: 'Following', value: stats.following, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', activeBg: 'bg-indigo-600' },
    { id: 'posts', label: 'Posts', value: stats.posts, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', activeBg: 'bg-emerald-600' },
    { id: 'images', label: 'Images', value: stats.images, icon: ImageIcon, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', activeBg: 'bg-amber-600' },
    { id: 'videos', label: 'Videos', value: stats.videos, icon: Video, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', activeBg: 'bg-rose-600' },
    { id: 'likes', label: 'Likes', value: stats.likesReceived, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', activeBg: 'bg-pink-600' },
    { id: 'comments', label: 'Comments', value: stats.commentsReceived, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-600' },
    { id: 'visits', label: 'Visits', value: stats.profileVisits, icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', activeBg: 'bg-teal-600' },
  ];

  // Dummy detailed datasets
  const mockFollowersList = [
    { id: 'm1', name: 'Vikash Namdev', username: '@vikash_namdev', city: 'Bhopal', role: 'Active Member', avatar: null, initials: 'VN', isFollowingBack: true },
    { id: 'm3', name: 'Ankit Verma', username: '@ankit_verma', city: 'Ujjain', role: 'Life Member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', initials: 'AV', isFollowingBack: false },
    { id: 'm4', name: 'Sunil Gupta', username: '@sunil_gupta', city: 'Indore', role: 'Premium Member', avatar: null, initials: 'SG', isFollowingBack: true },
    { id: 'm5', name: 'Amit Agrawal', username: '@amit_agrawal', city: 'Dewas', role: 'Executive Member', avatar: null, initials: 'AA', isFollowingBack: false },
    { id: 'm6', name: 'Neha Sharma', username: '@neha_sharma', city: 'Indore', role: 'Active Member', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', initials: 'NS', isFollowingBack: true },
  ];

  const mockFollowingList = [
    { id: 'm1', name: 'Vikash Namdev', username: '@vikash_namdev', city: 'Bhopal', avatar: null, initials: 'VN' },
    { id: 'm3', name: 'Ankit Verma', username: '@ankit_verma', city: 'Ujjain', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', initials: 'AV' },
    { id: 'm7', name: 'Rajesh Agrawal', username: '@rajesh_agrawal', city: 'Indore', avatar: null, initials: 'RA' },
  ];

  const mockMyPosts = [
    { id: 'p1', content: 'Celebrating our community festival today! Happy Ganesh Chaturthi to all members of our Samaj! May Bappa bless us all. 🪔✨', date: '2 hours ago', likes: 24, comments: 5, reads: '1.2k' },
    { id: 'p2', content: 'Attended the Samaj Annual General Meeting (AGM) today. Excited about the upcoming youth development initiatives and new community building plans!', date: '1 day ago', likes: 42, comments: 12, reads: '2.5k' },
    { id: 'p3', content: 'Great success at the Blood Donation Camp organized by the youth group. Thank you to all the volunteers who showed up and supported this noble cause! ❤️🩸', date: '3 days ago', likes: 56, comments: 8, reads: '3.1k' },
  ];

  const mockMyImages = [
    { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop', caption: 'Samaj Marriage Meet', date: '2 days ago' },
    { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop', caption: 'Festival Celebrations', date: '5 days ago' },
    { url: 'https://images.unsplash.com/photo-1609137144814-411a76c07a0c?q=80&w=600&auto=format&fit=crop', caption: 'Ganesh Pooja setup', date: '1 week ago' },
    { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop', caption: 'Annual General Meet', date: '2 weeks ago' },
  ];

  const mockMyVideos = [
    { thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop', duration: '02:45', title: 'Independence Day Cultural Dance Event', date: '1 week ago', views: '2.4k' },
    { thumbnail: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600&auto=format&fit=crop', duration: '05:12', title: 'Samaj Silver Jubilee celebration highlights', date: '3 weeks ago', views: '4.8k' },
  ];

  const mockLikesList = [
    { name: 'Sunil Gupta', action: 'liked your post', time: '10 mins ago', postExcerpt: '"Celebrating our community festival today..."', initials: 'SG' },
    { name: 'Amit Agrawal', action: 'liked your post', time: '1 hour ago', postExcerpt: '"Attended the Samaj Annual General Meeting..."', initials: 'AA' },
    { name: 'Neha Sharma', action: 'liked your photo', time: '4 hours ago', postExcerpt: 'Festival Celebrations photo', initials: 'NS' },
    { name: 'Vikash Namdev', action: 'liked your post', time: '1 day ago', postExcerpt: '"Great success at the Blood Donation Camp..."', initials: 'VN' },
  ];

  const mockCommentsList = [
    { name: 'Neha Sharma', text: 'Great initiative by the youth! Proud of you all. 👏👏', time: '2 hours ago', postExcerpt: 'Blood Donation Camp post', initials: 'NS' },
    { name: 'Vikash Namdev', text: 'Ganpati Bappa Morya! 🙏', time: '3 hours ago', postExcerpt: 'Ganesh Chaturthi post', initials: 'VN' },
    { name: 'Ankit Verma', text: 'Excellent progress report. Looking forward to the next meet.', time: '1 day ago', postExcerpt: 'Samaj AGM post', initials: 'AV' },
  ];

  const mockVisitsList = [
    { date: 'Monday', count: 184, growth: '+15%' },
    { date: 'Tuesday', count: 242, growth: '+24%' },
    { date: 'Wednesday', count: 310, growth: '+12%' },
    { date: 'Thursday', count: 288, growth: '-8%' },
    { date: 'Friday', count: 320, growth: '+18%' },
    { date: 'Saturday', count: 410, growth: '+32%' },
    { date: 'Sunday', count: 390, growth: '+5%' },
  ];

  // Helper toggle follow mock action
  const [followingMap, setFollowingMap] = useState({
    m1: true,
    m3: true,
    m7: true,
  });

  const handleFollowToggle = (id) => {
    setFollowingMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
        
        {/* Header */}
        <div className="responsive-fixed-top z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/30 shadow-sm" style={{ paddingTop: 'var(--spacing-safe-top)' }}>
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 rounded-full press-scale text-gray-600 hover:bg-slate-50">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-[16px] font-bold text-text-primary">Social Insights</h1>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-brand-primary">
              <BarChart2 size={16} />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="pt-20 px-4 max-w-lg mx-auto w-full space-y-4">
          
          {/* Profile Strength & Summary */}
          <div className="card-neo p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Engagement Level</p>
                <h2 className="text-[18px] font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  Excellent Progress <TrendingUp size={16} className="text-emerald-500" />
                </h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
                <span className="text-[14px] font-black text-brand-primary">85%</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-primary to-brand-glow rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium pt-1">Your profile strength is higher than 92% of members in {currentUser?.community || 'your community'}.</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all press-scale ${
                    isSelected 
                      ? 'bg-gradient-to-br from-brand-primary to-brand-glow border-brand-primary text-white shadow-md shadow-purple-300/40' 
                      : `bg-white ${tab.border} hover:bg-slate-50/50`
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                    isSelected ? 'bg-white/18 text-white' : `${tab.bg} ${tab.color}`
                  }`}>
                    <Icon size={15} />
                  </div>
                  <span className={`text-[13px] font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {tab.value}
                  </span>
                  <span className={`text-[8.5px] font-bold uppercase tracking-wide mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details Content Block */}
          <div className="card-neo bg-white min-h-[300px] overflow-hidden">
            {/* Header of Detail Block */}
            <div className="px-5 py-4 border-b border-purple-50/40 bg-slate-50/40 flex items-center justify-between">
              <h3 className="text-[13.5px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {activeTab === 'followers' && <>👥 Followers Details</>}
                {activeTab === 'following' && <>👤 Following List</>}
                {activeTab === 'posts' && <>📝 Published Posts</>}
                {activeTab === 'images' && <>🖼️ Shared Images</>}
                {activeTab === 'videos' && <>🎥 Videos Analytics</>}
                {activeTab === 'likes' && <>❤️ Likes Activity</>}
                {activeTab === 'comments' && <>💬 Comments Activity</>}
                {activeTab === 'visits' && <>👁️ Profile Visits Log</>}
              </h3>
              <span className="text-[11px] font-bold text-brand-primary px-2.5 py-0.5 rounded-full bg-purple-50">
                {activeTab === 'followers' && `${mockFollowersList.length} Accounts`}
                {activeTab === 'following' && `${Object.values(followingMap).filter(Boolean).length} Active`}
                {activeTab === 'posts' && `${mockMyPosts.length} Items`}
                {activeTab === 'images' && `${mockMyImages.length} Photos`}
                {activeTab === 'videos' && `${mockMyVideos.length} Uploads`}
                {activeTab === 'likes' && 'Recent'}
                {activeTab === 'comments' && `${mockCommentsList.length} Feedbacks`}
                {activeTab === 'visits' && 'Weekly'}
              </span>
            </div>

            {/* List Render Area */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  
                  {/* FOLLOWERS TAB */}
                  {activeTab === 'followers' && (
                    <div className="divide-y divide-slate-100/60">
                      {mockFollowersList.map(follower => {
                        const isFollowing = followingMap[follower.id];
                        return (
                          <div key={follower.id} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                            <div className="flex items-center gap-3">
                              <Avatar initials={follower.initials} avatar={follower.avatar} size="sm" />
                              <div>
                                <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{follower.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{follower.username} &bull; {follower.city}</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleFollowToggle(follower.id)}
                              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all press-scale ${
                                isFollowing 
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                  : 'bg-purple-600 text-white shadow-xs shadow-purple-200 hover:bg-purple-700'
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserMinus size={12} />
                                  Unfollow
                                </>
                              ) : (
                                <>
                                  <UserPlus size={12} />
                                  Follow back
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* FOLLOWING TAB */}
                  {activeTab === 'following' && (
                    <div className="divide-y divide-slate-100/60">
                      {mockFollowingList.map(following => {
                        const isFollowing = followingMap[following.id] ?? true;
                        if (!isFollowing) return null;
                        return (
                          <div key={following.id} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                            <div className="flex items-center gap-3">
                              <Avatar initials={following.initials} avatar={following.avatar} size="sm" />
                              <div>
                                <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{following.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{following.username} &bull; {following.city}</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleFollowToggle(following.id)}
                              className="px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1.5 transition-all press-scale"
                            >
                              <UserMinus size={12} />
                              Unfollow
                            </button>
                          </div>
                        );
                      })}
                      {Object.values(followingMap).filter(Boolean).length === 0 && (
                        <div className="text-center py-10 space-y-2">
                          <span className="text-[32px]">👤</span>
                          <p className="text-[12px] text-slate-400 font-semibold">You are not following anyone.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* POSTS TAB */}
                  {activeTab === 'posts' && (
                    <div className="space-y-3.5">
                      {mockMyPosts.map(post => (
                        <div key={post.id} className="bg-slate-50/50 rounded-2xl p-4 border border-purple-50/30 flex flex-col justify-between">
                          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2.5 text-[11px] text-slate-400 font-bold">
                            <div className="flex items-center gap-1.5">
                              <Clock size={11} />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>❤️ {post.likes} Likes</span>
                              <span>💬 {post.comments} Comments</span>
                              <span>👁️ {post.reads} Reads</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IMAGES TAB */}
                  {activeTab === 'images' && (
                    <div className="grid grid-cols-2 gap-3">
                      {mockMyImages.map((img, idx) => (
                        <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-xs h-32 bg-slate-50">
                          <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                            <h4 className="text-white text-[11.5px] font-bold truncate leading-tight">{img.caption}</h4>
                            <span className="text-white/60 text-[9px] font-medium mt-0.5">{img.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VIDEOS TAB */}
                  {activeTab === 'videos' && (
                    <div className="space-y-4">
                      {mockMyVideos.map((vid, idx) => (
                        <div key={idx} className="bg-slate-50/40 rounded-2xl overflow-hidden border border-slate-100 shadow-xs">
                          <div className="relative h-40 bg-black">
                            <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 shadow-md flex items-center justify-center text-brand-primary cursor-pointer press-scale">
                                <Play size={20} className="fill-brand-primary ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/75 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                              {vid.duration}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-[13px] font-bold text-slate-800 leading-snug">{vid.title}</h4>
                            <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-bold mt-1.5">
                              <span>📅 {vid.date}</span>
                              <span>👁️ {vid.views} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LIKES TAB */}
                  {activeTab === 'likes' && (
                    <div className="divide-y divide-slate-100/60">
                      {mockLikesList.map((like, idx) => (
                        <div key={idx} className="flex gap-3 py-3.5 first:pt-1 last:pb-1">
                          <Avatar initials={like.initials} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-0.5">
                              <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{like.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">{like.time}</span>
                            </div>
                            <p className="text-[12px] text-slate-600">
                              {like.action} <span className="italic font-bold text-purple-900">{like.postExcerpt}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMMENTS TAB */}
                  {activeTab === 'comments' && (
                    <div className="divide-y divide-slate-100/60">
                      {mockCommentsList.map((comm, idx) => (
                        <div key={idx} className="flex gap-3 py-3.5 first:pt-1 last:pb-1">
                          <Avatar initials={comm.initials} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-0.5">
                              <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{comm.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">{comm.time}</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                              <p className="text-[12.5px] text-slate-700 leading-relaxed font-medium">"{comm.text}"</p>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-bold mt-1.5">
                              On your post: <span className="italic">{comm.postExcerpt}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VISITS TAB */}
                  {activeTab === 'visits' && (
                    <div className="space-y-4">
                      {/* Interactive Bar Chart Representation */}
                      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl p-4 border border-purple-100/30">
                        <h4 className="text-[12px] font-bold text-indigo-900 mb-4 flex items-center gap-1">
                          📊 Last 7 Days Activity
                        </h4>
                        <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
                          {mockVisitsList.map((v, i) => {
                            // Find percentage relative to max visits (410)
                            const heightPct = `${(v.count / 410) * 100}%`;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                <div className="group relative w-full flex justify-center">
                                  <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-20 transition-all">
                                    {v.count}
                                  </div>
                                  <div 
                                    className="w-full rounded-t-md bg-gradient-to-t from-brand-primary to-indigo-400/80 shadow-xs hover:opacity-90 transition-all cursor-pointer"
                                    style={{ height: heightPct }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{v.date.substring(0, 3)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Log stats list */}
                      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
                        {mockVisitsList.map((v, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3">
                            <span className="text-[12.5px] font-bold text-slate-700">{v.date}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-black text-slate-800">{v.count} visits</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                v.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {v.growth}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </AnimatedPage>
  );
}
