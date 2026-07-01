import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  X, 
  Check, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { useVoting } from './VotingContext';

const PollDetailPage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { elections, votedElections, castVote, getElectionResult } = useVoting();
  
  const election = elections.find(e => e.id === pollId);

  const [timeLeft, setTimeLeft] = useState(15);
  const [isVotingEnded, setIsVotingEnded] = useState(election ? election.status === 'Completed' : false);

  useEffect(() => {
    if (!election) return;
    if (election.status === 'Completed') {
      setIsVotingEnded(true);
      return;
    }
    if (timeLeft <= 0) {
      setIsVotingEnded(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, election]);

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

  // States: 'details' | 'vote' | 'success' | 'results'
  const [viewState, setViewState] = useState(() => {
    if (!election) return 'details';
    const hasVoted = !!votedElections[election.id];
    const isCompleted = election.status === 'Completed';
    return (hasVoted || isCompleted) ? 'results' : 'details';
  });

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidateToShowDetails, setCandidateToShowDetails] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!election) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-3" />
        <h2 className="text-base font-bold text-text-primary">चुनाव नहीं मिला</h2>
        <p className="text-xs text-text-secondary mt-1 mb-6">यह चुनाव उपलब्ध नहीं है या समाप्त हो चुका है।</p>
        <button onClick={() => navigate('/member/voting')} className="btn-primary py-2 px-6 text-xs">
          वोटिंग पोर्टल पर वापस जाएं
        </button>
      </div>
    );
  }

  const isAlreadyVoted = !!votedElections[election.id];
  
  const selectedCandidate = election.candidates.find(c => c.id === selectedCandidateId);

  const handleVoteSubmit = () => {
    if (!selectedCandidateId) return;
    
    // Cast in-memory vote
    castVote(election.id, selectedCandidateId);
    
    // Close modal & transition to Success Screen 7
    setShowConfirmModal(false);
    setViewState('success');
  };

  // Calculate results standings
  const results = getElectionResult(election.id);

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-16">
      
      {/* 1. Top Header Navigation (matching designs) */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (viewState === 'vote') {
                setViewState('details');
              } else {
                navigate('/member/voting');
              }
            }} 
            className="p-1 -ml-1 press-scale"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">
            {viewState === 'details' && 'चुनाव विवरण'}
            {viewState === 'vote' && 'वोट करें'}
            {viewState === 'success' && 'धन्यवाद!'}
            {viewState === 'results' && 'चुनाव परिणाम'}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full font-bold">
          <span className={`w-2 h-2 rounded-full ${election.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {election.status === 'Active' ? 'चालू है' : 'समाप्त'}
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 max-w-xl mx-auto w-full space-y-6">
        
        {/* ==========================================================
            SCREEN 2 & 4: ELECTION DETAILS VIEW (चुनाव विवरण)
           ========================================================== */}
        {viewState === 'details' && (
          <div className="space-y-6">
            {/* Banner Section */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-3xl p-5 border border-purple-700/20 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="warning" className="text-[10px] font-bold">चालू है</Badge>
              </div>
              <h2 className="text-base font-bold text-white">{election.title}</h2>
              
              {/* Date Card Grid inside Banner */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-center text-xs">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="text-purple-200 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Calendar size={11} className="text-amber-400" /> प्रारंभ तिथि
                  </div>
                  <div className="font-bold text-white">{election.startDate}</div>
                  <div className="text-[9px] text-purple-300 mt-0.5">शुक्रवार</div>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="text-purple-200 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Calendar size={11} className="text-amber-400" /> समाप्त तिथि
                  </div>
                  <div className="font-bold text-white">{election.endDate}</div>
                  <div className="text-[9px] text-purple-300 mt-0.5">समाप्त</div>
                </div>
              </div>

              <p className="text-xs text-purple-100/90 leading-relaxed mt-4 pt-1.5 text-center font-medium">
                {election.description}
              </p>
            </div>

            {/* Candidates Vertically List (उम्मीदवार (4) matching Screen 2) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary">उम्मीदवार ({election.candidates.length})</h3>
              
              <div className="space-y-3.5">
                {election.candidates.map(candidate => (
                  <div 
                    key={candidate.id} 
                    className="bg-card rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar initials={candidate.initials} src={candidate.avatar} size="lg" />
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{candidate.name}</h4>
                        {candidate.age && (
                          <div className="text-[10px] text-text-secondary mt-1 space-y-0.5">
                            <p>उम्र: {candidate.age} वर्ष</p>
                            <p>व्यवसाय: {candidate.profession}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setCandidateToShowDetails(candidate)}
                      className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/50 py-2 px-3.5 rounded-xl press-scale shrink-0"
                    >
                      विवरण देखें
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Action: Proceed to Vote screen */}
            {election.status === 'Active' && (
              <button 
                onClick={() => setViewState('vote')}
                className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-2xl press-scale shadow-md flex items-center justify-center gap-1.5"
              >
                वोट करने के लिए आगे बढ़ें
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* ==========================================================
            SCREEN 5: VOTE SCREEN WITH RADIO BUTTONS (वोट करें)
           ========================================================== */}
        {viewState === 'vote' && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-text-primary">आप किसे वोट देना चाहते हैं?</h2>
              <p className="text-[10px] text-text-secondary mt-0.5">नीचे दिए गए उम्मीदवारों में से किसी एक को चुनें।</p>
            </div>

            {/* Candidates with Radio Controls */}
            <div className="space-y-3">
              {election.candidates.map(candidate => {
                const isSelected = selectedCandidateId === candidate.id;
                return (
                  <div 
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`bg-card rounded-2xl border p-4.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-600 ring-1 ring-purple-100 shadow-sm' 
                        : 'border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Radio dot */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      
                      <Avatar initials={candidate.initials} src={candidate.avatar} size="md" />
                      <span className="text-xs font-bold text-text-primary">{candidate.name}</span>
                    </div>

                    {candidate.age && (
                      <span className="text-[10px] text-text-secondary bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {candidate.profession}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Selection Button */}
            <button 
              onClick={() => {
                if (selectedCandidateId) {
                  setShowConfirmModal(true);
                }
              }}
              disabled={!selectedCandidateId}
              className={`w-full py-4 rounded-2xl text-xs font-bold press-scale shadow-md flex items-center justify-center gap-1.5 transition-colors ${
                selectedCandidateId 
                  ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              वोट सबमिट करें
            </button>
          </div>
        )}

        {/* ==========================================================
            SCREEN 7: SUCCESS SCREEN (धन्यवाद!)
           ========================================================== */}
        {viewState === 'success' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
            {/* Green Circle Checkmark */}
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Check size={36} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text-primary">धन्यवाद!</h2>
              <p className="text-xs text-text-secondary leading-relaxed px-4">
                आपका वोट सफलतापूर्वक सबमिट हो गया है।
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 w-full text-left space-y-2">
              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">वोट रसीद विवरण</p>
              <div className="text-[11px] text-text-secondary space-y-1">
                <p><strong>चुनाव:</strong> {election.title}</p>
                <p><strong>स्थिति:</strong> सुरक्षित एवं गोपनीय (Aggregate)</p>
                <p><strong>समय:</strong> अभी-अभी (Just now)</p>
              </div>
            </div>

            <button 
              onClick={() => setViewState('results')}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-2xl press-scale shadow-md"
            >
              ठीक है
            </button>
          </div>
        )}

        {/* ==========================================================
            RESULTS SCREEN: SIMULATED STANDINGS (चुनाव परिणाम)
           ========================================================== */}
        {viewState === 'results' && (
          <div className="space-y-5">
            <div className="bg-card rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant="success" className="text-[9px] uppercase font-bold">परिणाम</Badge>
                <span className="text-[10px] text-text-secondary font-bold flex items-center gap-1">
                  <Clock size={12} className="text-purple-600" />
                  कुल वोट: {election.totalVotesCast}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary leading-snug">{election.title}</h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                चुनाव की वास्तविक समय प्रगति और मतगणना की सूची।
              </p>
            </div>

            {/* Countdown Banner */}
            {!isVotingEnded ? (
              <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 shadow-xs">
                <span className="text-[10px] text-purple-750 font-extrabold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                  <Clock size={12} className="animate-pulse" /> परिणाम घोषित होने में समय
                </span>
                <span className="text-[16px] font-black text-purple-950 font-mono tracking-widest">
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-2xl p-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-emerald-700 font-bold shadow-xs">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>वोटिंग समाप्त हो चुकी है। अंतिम परिणाम नीचे हैं।</span>
              </div>
            )}

            {/* Results Progress List */}
            <div className="space-y-3">
              {results.map((candidate) => {
                const isUserChoice = votedElections[election.id] === candidate.id;
                return (
                  <div 
                    key={candidate.id} 
                    className={`bg-card rounded-2xl border p-4.5 relative overflow-hidden transition-all ${
                      isUserChoice 
                        ? 'border-emerald-500 shadow-sm' 
                        : 'border-gray-100'
                    }`}
                  >
                    {/* Fill */}
                    <div 
                      className={`absolute top-0 bottom-0 left-0 ${
                        isUserChoice ? 'bg-emerald-500/10' : 'bg-purple-600/5'
                      } z-0 pointer-events-none transition-all duration-1000 ease-out`}
                      style={{ width: `${isVotingEnded ? candidate.percentage : 0}%` }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={candidate.initials} src={candidate.avatar} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-text-primary">{candidate.name}</h4>
                            {isUserChoice && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check size={10} /> आपका चयन
                              </span>
                            )}
                          </div>
                          {candidate.age && (
                            <p className="text-[10px] text-text-secondary mt-0.5">उम्र: {candidate.age} वर्ष | {candidate.profession}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isVotingEnded ? (
                          <>
                            <div className="text-sm font-extrabold text-purple-900">{candidate.percentage}%</div>
                            <div className="text-[10px] text-text-secondary">{candidate.votes} वोट</div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-[6px] text-[10px]">गुप्त</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Return Button */}
            <button 
              onClick={() => navigate('/member/voting')}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl press-scale"
            >
              वोटिंग डैशबोर्ड पर वापस जाएं
            </button>
          </div>
        )}

      </div>

      {/* ==========================================================
          MODAL 1: CANDIDATE DETAIL OVERLAY (विवरण देखें Drawer)
         ========================================================== */}
      <AnimatePresence>
        {candidateToShowDetails && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCandidateToShowDetails(null)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Modal Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-[32px] border-t border-gray-100 z-50 shadow-2xl overflow-y-auto max-h-[80vh] scrollbar-hide"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">उम्मीदवार परिचय पत्र</span>
                  <button 
                    onClick={() => setCandidateToShowDetails(null)}
                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-text-secondary transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar initials={candidateToShowDetails.initials} src={candidateToShowDetails.avatar} size="xl" />
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{candidateToShowDetails.name}</h3>
                    {candidateToShowDetails.age && (
                      <p className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold mt-1">
                        उम्र: {candidateToShowDetails.age} वर्ष • {candidateToShowDetails.profession}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {candidateToShowDetails.experience && (
                    <div className="bg-surface p-3 rounded-xl border border-gray-100">
                      <div className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                        <Briefcase size={11} className="text-purple-600" /> अनुभव
                      </div>
                      <div className="font-bold text-text-primary leading-snug">{candidateToShowDetails.experience}</div>
                    </div>
                  )}
                  {candidateToShowDetails.education && (
                    <div className="bg-surface p-3 rounded-xl border border-gray-100">
                      <div className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                        <GraduationCap size={11} className="text-purple-600" /> शैक्षणिक योग्यता
                      </div>
                      <div className="font-bold text-text-primary leading-snug">{candidateToShowDetails.education}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                    <User size={12} className="text-amber-500" /> परिचय विवरण
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface rounded-xl p-3 border border-gray-100">
                    {candidateToShowDetails.bio}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} className="text-amber-500" /> मुख्य घोषणा पत्र (Manifesto)
                  </h4>
                  <div className="space-y-2">
                    {candidateToShowDetails.manifesto.map((point, index) => (
                      <div key={index} className="flex gap-2 text-xs leading-normal bg-purple-50/20 p-2.5 rounded-xl border border-purple-100/30">
                        <Check size={12} className="text-purple-700 shrink-0 mt-0.5" />
                        <span className="text-text-primary">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {election.status === 'Active' && !isAlreadyVoted && (
                  <button 
                    onClick={() => {
                      setSelectedCandidateId(candidateToShowDetails.id);
                      setCandidateToShowDetails(null);
                      setViewState('vote');
                    }}
                    className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl press-scale flex items-center justify-center gap-1.5"
                  >
                    वोट के लिए चुनें
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================================
          MODAL 2: VOTE CONFIRMATION POPUP (क्या आप [Name] को वोट देना चाहते हैं?)
         ========================================================== */}
      <AnimatePresence>
        {showConfirmModal && selectedCandidate && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
            />
            {/* Confirmation Dialog Box */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-sm rounded-[28px] border border-gray-100 p-6 shadow-2xl space-y-5 text-center"
              >
                {/* Green check shield circle */}
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-text-primary">पुष्टि करें</h3>
                  <p className="text-xs text-text-secondary leading-normal">
                    क्या आप <strong className="text-purple-900">{selectedCandidate.name}</strong> को वोट देना चाहते हैं?
                  </p>
                </div>

                {/* Candidate Summary card */}
                <div className="bg-surface p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 text-left">
                  <Avatar initials={selectedCandidate.initials} src={selectedCandidate.avatar} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{selectedCandidate.name}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">{selectedCandidate.profession}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={handleVoteSubmit}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl press-scale shadow-sm"
                  >
                    हाँ, पुष्टि करें
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false);
                    }}
                    className="w-full py-3 bg-white hover:bg-gray-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 press-scale"
                  >
                    नहीं, वापस जाएं
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PollDetailPage;
