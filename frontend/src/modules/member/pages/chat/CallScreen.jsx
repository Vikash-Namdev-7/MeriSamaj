import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, SwitchCamera, User } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { t } from '../../utils/translations';
import { Avatar } from '../../components/common/Avatar';

const CallScreen = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useData();
  
  const type = searchParams.get('type') || 'voice';
  const rawName = searchParams.get('name') || 'Unknown';
  const name = decodeURIComponent(rawName);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(type === 'video');
  const [duration, setDuration] = useState(0);
  const [callState, setCallState] = useState('ringing'); // ringing, connected, ended

  // Simulate ringing then connecting
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Duration timer
  useEffect(() => {
    let interval;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1E293B] relative overflow-hidden">
      
      {/* Background (blurred avatar for voice, mock camera for video) */}
      <div className="absolute inset-0 z-0">
        {isVideoOn ? (
          <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop" alt="video" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[#0F172A] opacity-90 z-10" />
            <div className="w-full h-full flex items-center justify-center opacity-30 blur-3xl scale-150">
              <Avatar initials={name.substring(0,2).toUpperCase()} size="w-64 h-64" color="bg-brand-primary" />
            </div>
          </>
        )}
      </div>

      {/* ─── HEADER ─── */}
      <div className="relative z-10 pt-16 flex flex-col items-center">
        <div className="flex items-center gap-2 text-white/80 mb-2">
          {type === 'video' ? <Video size={16} /> : <Volume2 size={16} />}
          <span className="text-[14px] font-medium tracking-wide">
            WhatsApp {type === 'video' ? t('Video Call', language) : t('Voice Call', language)}
          </span>
        </div>

        {!isVideoOn && (
          <div className="mt-8 mb-6">
            <Avatar 
              initials={name.substring(0,2).toUpperCase()} 
              size="w-32 h-32 text-[32px]" 
              color="bg-brand-primary/20 text-brand-primary border-4 border-brand-primary/30" 
            />
          </div>
        )}

        <h2 className="text-[28px] font-bold text-white tracking-tight px-6 text-center leading-tight">
          {name}
        </h2>
        
        <p className="text-white/70 text-[16px] font-medium mt-2">
          {callState === 'ringing' && t('Ringing...', language)}
          {callState === 'connected' && formatDuration(duration)}
          {callState === 'ended' && t('Call ended', language)}
        </p>
      </div>

      {/* ─── MINI SELF VIDEO (if video is on) ─── */}
      {isVideoOn && callState === 'connected' && (
        <div className="absolute top-16 right-5 w-28 h-40 bg-gray-900 rounded-xl border border-white/20 overflow-hidden shadow-xl z-20">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop" alt="self" className="w-full h-full object-cover" />
        </div>
      )}

      {/* ─── CONTROLS ─── */}
      <div className="relative z-10 mt-auto pb-12 px-8">
        <div className="bg-[#0F172A]/80 backdrop-blur-xl rounded-full px-6 py-4 flex items-center justify-between shadow-2xl border border-white/10">
          
          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-colors active:scale-95"
            style={{ backgroundColor: !isVideoOn ? 'rgba(255,255,255,0.2)' : 'transparent' }}
          >
            {isVideoOn ? <Video size={28} className="text-white" /> : <VideoOff size={28} className="text-white/60" />}
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-colors active:scale-95"
            style={{ backgroundColor: isMuted ? 'rgba(255,255,255,0.2)' : 'transparent' }}
          >
            {isMuted ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
          </button>

          {isVideoOn && (
            <button className="w-14 h-14 rounded-full flex items-center justify-center transition-colors active:scale-95 text-white">
              <SwitchCamera size={28} />
            </button>
          )}

          <button 
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors active:scale-95 ml-2"
          >
            <PhoneOff size={32} className="text-white" />
          </button>

        </div>
      </div>

    </div>
  );
};

export default CallScreen;
