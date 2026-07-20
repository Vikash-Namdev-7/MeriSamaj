import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataProvider';
import { 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Menu, 
  Bell,
  ClipboardList,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { useVoting } from './VotingContext';
import { votingInstructions, votingGuidelines, securityFeatures } from './mockVotingData';

const VotingPage = () => {
  const navigate = useNavigate();
  const { setMobileMenuOpen, getUnreadCountForModule } = useData();
  const { elections, votedElections, loading, error, refresh } = useVoting();

  const activeElections = elections.filter(e => e.status === 'Active');
  const firstActiveElection = activeElections.find(e => e.status === 'Active'); // Find first one rather than hardcoded 'el1'
  const pastElections = elections.filter(e => e.status === 'Completed' || e.status === 'Closed');

  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds countdown
  const [isVotingEnded, setIsVotingEnded] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsVotingEnded(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Translated names for simulated results
  const simulatedResults = [
    { name: "Rajesh Sharma", votes: "1,253", percentage: 28, color: "bg-emerald-500", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", initials: "RS" },
    { name: "Suresh Yadav", votes: "2,145", percentage: 48, color: "bg-purple-600", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face", initials: "SY" },
    { name: "Manish Gupta", votes: "876", percentage: 19, color: "bg-amber-500", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", initials: "MG" },
    { name: "Ajay Singh", votes: "266", percentage: 5, color: "bg-rose-500", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", initials: "AS" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-text-primary mb-2">Failed to load elections</h2>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <button onClick={refresh} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-1 press-scale">
            <Menu size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary tracking-tight">Samaj Voting</h1>
        </div>
        <button onClick={() => navigate('/member/notifications?module=voting')} className="p-1 press-scale relative">
          <Bell size={22} className="text-text-primary" />
          {getUnreadCountForModule('voting') > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full" />
          )}
        </button>
      </div>

      <div className="px-4 pt-4 max-w-4xl mx-auto space-y-6">
        
        {/* Purple Hero Banner */}
        <div className="bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] text-white rounded-[28px] p-6 relative overflow-hidden shadow-xl shadow-purple-500/10 border border-purple-400/15">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-4 max-w-[65%]">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Samaj Elections</h2>
                <p className="text-xs text-purple-100/80 leading-relaxed mt-1">
                  Vote for the bright future of your community
                </p>
              </div>
              <button 
                onClick={() => navigate('/member/voting/el1')}
                className="bg-white text-purple-900 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md press-scale hover:bg-purple-50 transition-all hover:shadow-lg"
              >
                Vote Now
              </button>
            </div>
            
            {/* Ballot Placement Illustration SVG */}
            <div className="shrink-0 relative z-10">
              <svg viewBox="0 0 100 100" className="w-24 h-24 text-white opacity-95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Ballot Box */}
                <rect x="25" y="55" width="50" height="35" rx="3" fill="rgba(255,255,255,0.08)" className="stroke-white" />
                <path d="M35 55V42h30v13" />
                {/* Slot */}
                <line x1="42" y1="42" x2="58" y2="42" strokeWidth="4" className="stroke-amber-400" />
                {/* Hand and Ballot Paper */}
                <g className="animate-pulse">
                  <rect x="44" y="22" width="12" height="18" rx="1" fill="white" className="stroke-purple-800" />
                  <line x1="47" y1="27" x2="53" y2="27" stroke="gray" strokeWidth="0.8" />
                  <line x1="47" y1="32" x2="53" y2="32" stroke="gray" strokeWidth="0.8" />
                </g>
                <path d="M82 25c-4-4-11-4-15 0L52 38l3 6 10-10c1.5-1.5 4-1.5 5 0s1.5 4 0 5L58 51" className="stroke-white" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Upcoming/Active Election Section (जल्द आ रहे चुनाव matching Screen 1) */}
        {activeElections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Upcoming Elections</h3>
              <button 
                onClick={() => navigate('/member/voting/list')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center cursor-pointer"
              >
                View All &gt;
              </button>
            </div>
            
            <div className="space-y-3">
              {activeElections.slice(0, 1).map(elec => (
                <div 
                  key={elec.id}
                  onClick={() => navigate(`/member/voting/${elec.id}`)}
                  className="bg-card rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-purple-200 transition-colors animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{elec.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-1">
                        {elec.startDate} - {elec.endDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-[10px] font-bold uppercase !px-2.5 !py-1">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Horizontal Candidates Section (उम्मीदवार matching Screen 1) */}
        {firstActiveElection && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Candidates</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {firstActiveElection.candidates.map(candidate => (
                <div 
                  key={candidate.id}
                  onClick={() => navigate(`/member/voting/${firstActiveElection.id}`)}
                  className="flex flex-col items-center text-center shrink-0 w-20 cursor-pointer group"
                >
                  <div className="relative">
                    <Avatar 
                      initials={candidate.initials} 
                      src={candidate.avatar} 
                      size="lg" 
                      className="border-2 border-transparent group-hover:border-purple-500 transition-all duration-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white border border-white">
                      <CheckCircle2 size={10} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-text-primary mt-2 truncate w-full group-hover:text-purple-800">
                    {candidate.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Process Flow Section (वोटिंग करने की प्रक्रिया matching middle section) */}
        <div className="bg-card rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-text-primary">Voting Process</h3>
            <p className="text-[10px] text-text-secondary">Contribute to community elections in simple steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
            {votingInstructions.map((inst) => (
              <div 
                key={inst.id} 
                className="bg-surface rounded-2xl p-4 border border-gray-100 relative text-center flex flex-col items-center justify-start space-y-2 hover:shadow-sm transition-all"
              >
                <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {inst.step}
                </div>
                <h4 className="text-[11px] font-bold text-text-primary">{inst.title}</h4>
                <p className="text-[10px] text-text-secondary leading-relaxed text-center">{inst.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. List of Elections (चुनाव सूची matching Screen 3) */}
        <div className="space-y-3">
          <h3 id="election-list-section" className="text-sm font-bold text-text-primary pt-2 scroll-mt-4">Election List</h3>
          
          {/* Active List */}
          {activeElections.map(active => (
            <div 
              key={active.id}
              onClick={() => navigate(`/member/voting/${active.id}`)}
              className="card-std p-4 border border-gray-100 hover:border-purple-200 cursor-pointer relative overflow-hidden"
            >
              {votedElections[active.id] && (
                <div className="absolute right-0 top-0 bg-emerald-600 text-white text-[9px] font-bold uppercase py-0.5 px-3 rounded-bl-lg flex items-center gap-0.5">
                  Voted
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xs font-bold text-purple-900">{active.title}</h4>
                <Badge variant="warning" className="text-[9px] font-bold">Active</Badge>
              </div>
              <p className="text-[10px] text-text-secondary">
                {active.startDate} - {active.endDate}
              </p>
            </div>
          ))}

          {/* Past Elections */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider pt-2">Past Elections</h4>
            {pastElections.map(past => (
              <div 
                key={past.id}
                onClick={() => navigate(`/member/voting/${past.id}`)}
                className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hover:border-gray-200 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{past.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-1">
                    {past.startDate} - {past.endDate}
                  </p>
                </div>
                <Badge variant="default" className="text-[9px] font-bold bg-gray-200 text-gray-700">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </div>



        {/* 7. Bottom Sections Grid: Guidelines, Results & Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Important Information */}
          <div className="bg-card rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Important Information</h3>
            </div>
            
            <div className="space-y-3.5 my-2">
              {votingGuidelines.map((guide, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 bg-purple-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-purple-700" />
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary leading-relaxed">
                    {guide.title}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100 text-[10px] text-amber-700 flex gap-1.5 items-start mt-2">
              <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <span>All rules are approved by the Social Welfare Council.</span>
            </div>
          </div>

          {/* Real-time Results */}
          <div className="bg-card rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2.5 flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Real-time Results</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isVotingEnded ? 'bg-red-50 text-red-655 border border-red-100' : 'bg-purple-50 text-purple-700'}`}>
                {isVotingEnded ? 'Ended' : 'Live'}
              </span>
            </div>

            {/* Countdown Banner */}
            {!isVotingEnded ? (
              <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] text-purple-750 font-extrabold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                  <Clock size={12} className="animate-pulse" /> Time remaining until results
                </span>
                <span className="text-[15px] font-black text-purple-950 font-mono tracking-widest">
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-2xl p-2.5 flex items-center justify-center gap-1.5 text-center text-[10px] text-emerald-700 font-bold">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Voting has ended. Results are completed.</span>
              </div>
            )}

            <div className="space-y-3.5 my-2">
              {simulatedResults.map((candidate, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-2">
                      <Avatar initials={candidate.initials} src={candidate.avatar} size="sm" />
                      <span className="font-bold text-text-primary">{candidate.name}</span>
                    </div>
                    {isVotingEnded ? (
                      <span className="text-text-secondary font-bold">Ended</span>
                    ) : (
                      <span className="text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-[6px]">Secret</span>
                    )}
                  </div>
                  {/* Progress Bar (Hidden or set width to 0% as per requirements) */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${candidate.color} rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `0%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-card rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Security Features</h3>
            </div>

            <div className="space-y-3.5 my-2">
              {securityFeatures.map(feat => (
                <div key={feat.id} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={12} className="text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-text-primary">{feat.title}</h4>
                    <p className="text-[9px] text-text-secondary leading-normal mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VotingPage;
