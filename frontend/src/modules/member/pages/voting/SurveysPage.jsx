import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, CheckCircle2, Clock, Users, ChevronRight,
  Star, BarChart2, Check, AlertCircle, X, Send, ClipboardList
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { mockSurveys } from '../../data/mockSurveys';

// ─── Category Color Map ───
const categoryColors = {
  Infrastructure: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Events:         { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Opinion:        { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Youth:          { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

// ─── Star Rating Component ───
const StarRating = ({ maxRating = 5, value, onChange, disabled }) => (
  <div className="flex gap-2">
    {Array.from({ length: maxRating }).map((_, i) => {
      const star = i + 1;
      return (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          className={`transition-transform ${disabled ? '' : 'active:scale-110'}`}
        >
          <Star
            size={32}
            className={`transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
            fill={star <= value ? 'currentColor' : 'none'}
          />
        </button>
      );
    })}
  </div>
);

// ─── Survey Detail / Form View ───
const SurveyFormView = ({ survey, onClose, surveyResponses, submitFullSurvey }) => {
  const isAlreadySubmitted = !!(surveyResponses[survey.id]?.submittedAt);
  const [answers, setAnswers] = useState(surveyResponses[survey.id] || {});
  const [submitted, setSubmitted] = useState(isAlreadySubmitted);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSingleSelect = (qId, optionId) => {
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
    setValidationErrors(prev => ({ ...prev, [qId]: false }));
  };

  const handleMultiSelect = (qId, optionId) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, [qId]: next };
    });
    setValidationErrors(prev => ({ ...prev, [qId]: false }));
  };

  const handleRating = (qId, rating) => {
    setAnswers(prev => ({ ...prev, [qId]: rating }));
    setValidationErrors(prev => ({ ...prev, [qId]: false }));
  };

  const handleText = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmit = () => {
    // Validate required questions
    const errors = {};
    let hasErrors = false;
    survey.questions.forEach(q => {
      if (q.required) {
        const ans = answers[q.id];
        if (!ans || (Array.isArray(ans) && ans.length === 0) || ans === '') {
          errors[q.id] = true;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    submitFullSurvey(survey.id, answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          {survey.status === 'closed' ? 'Survey Closed' : 'Thank You!'}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {survey.status === 'closed'
            ? 'This survey is now closed. Thank you for your earlier participation!'
            : 'Your response has been recorded. Your feedback helps us improve the community.'}
        </p>
        <div className="bg-gray-50 rounded-2xl p-4 w-full text-left border border-gray-100 mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-1">Total Responses</p>
          <p className="text-2xl font-black text-brand-primary">{survey.totalResponses + 1}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-md press-scale"
        >
          Back to Surveys
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Survey Banner */}
      {survey.banner && (
        <div className="h-[140px] relative overflow-hidden rounded-2xl mb-4">
          <img src={survey.banner} alt={survey.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Survey Meta */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {survey.status === 'closed' ? (
          <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
            Closed
          </span>
        ) : (
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Active
          </span>
        )}
        <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
          <Users size={11} /> {survey.totalResponses} responses
        </span>
        <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
          <Clock size={11} /> Deadline: {survey.deadline}
        </span>
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-6">{survey.description}</p>

      {/* Questions */}
      <div className="space-y-6">
        {survey.questions.map((q, qIdx) => (
          <div
            key={q.id}
            className={`bg-gray-50 rounded-2xl p-4 border transition-all ${
              validationErrors[q.id] ? 'border-red-300 bg-red-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                {qIdx + 1}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-900 leading-snug">{q.question}</p>
                {q.required && (
                  <span className="text-[10px] text-red-500 font-semibold">* Required</span>
                )}
              </div>
            </div>

            {validationErrors[q.id] && (
              <div className="flex items-center gap-1 text-red-500 text-[11px] font-semibold mb-2">
                <AlertCircle size={12} /> This question is required
              </div>
            )}

            {/* Single Choice */}
            {q.type === 'single' && (
              <div className="space-y-2 pl-8">
                {q.options.map(opt => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => survey.status !== 'closed' && handleSingleSelect(q.id, opt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      } ${survey.status === 'closed' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-brand-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-brand-primary rounded-full" />}
                      </div>
                      <span className="text-[13px] font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi Choice */}
            {q.type === 'multi' && (
              <div className="space-y-2 pl-8">
                {q.options.map(opt => {
                  const selected = (answers[q.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => survey.status !== 'closed' && handleMultiSelect(q.id, opt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                        selected
                          ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      } ${survey.status === 'closed' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
                      }`}>
                        {selected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-[13px] font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
                <p className="text-[10px] text-gray-400 pl-1">You can select multiple options</p>
              </div>
            )}

            {/* Rating */}
            {q.type === 'rating' && (
              <div className="pl-8">
                <StarRating
                  maxRating={q.maxRating}
                  value={answers[q.id] || 0}
                  onChange={(rating) => handleRating(q.id, rating)}
                  disabled={survey.status === 'closed'}
                />
                {answers[q.id] > 0 && (
                  <p className="text-[12px] text-brand-primary font-bold mt-2">
                    {['', 'Very Bad', 'Bad', 'Average', 'Good', 'Very Good'][answers[q.id]]}
                  </p>
                )}
              </div>
            )}

            {/* Text */}
            {q.type === 'text' && (
              <div className="pl-8">
                <textarea
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={e => handleText(q.id, e.target.value)}
                  disabled={survey.status === 'closed'}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-primary transition-all resize-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {survey.status !== 'closed' && !isAlreadySubmitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-3.5 bg-brand-primary text-white rounded-2xl text-[14px] font-bold shadow-lg shadow-brand-primary/25 press-scale flex items-center justify-center gap-2"
        >
          <Send size={16} /> Submit Survey
        </button>
      )}
    </div>
  );
};

// ─── MAIN SURVEYS PAGE ───
const SurveysPage = () => {
  const navigate = useNavigate();
  const { surveyResponses, submitFullSurvey } = useData();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | active | closed
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const filters = [
    { id: 'all', label: 'All', labelEn: 'All' },
    { id: 'active', label: 'Active', labelEn: 'Active' },
    { id: 'closed', label: 'Completed', labelEn: 'Completed' },
  ];

  const filteredSurveys = useMemo(() => {
    return mockSurveys.filter(sv => {
      const matchesSearch = sv.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter = activeFilter === 'all' || sv.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchText, activeFilter]);

  const activeSurveyCount = mockSurveys.filter(sv => sv.status === 'active').length;
  const myParticipationCount = Object.keys(surveyResponses).length;

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/member/voting')} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Surveys &amp; Polls</h1>
        </div>
        <span className="text-[11px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">
          {activeSurveyCount} Active
        </span>
      </div>

      {selectedSurvey ? (
        /* ─── Survey Detail modal ─── */
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-black text-gray-900 flex-1 pr-3">{selectedSurvey.title}</h2>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <SurveyFormView
              survey={selectedSurvey}
              onClose={() => setSelectedSurvey(null)}
              surveyResponses={surveyResponses}
              submitFullSurvey={submitFullSurvey}
            />
          </div>
        </div>
      ) : (
        /* ─── Surveys List View ─── */
        <div className="px-4 pt-4 max-w-lg mx-auto space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-brand-primary leading-none">{mockSurveys.length}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Total Surveys</p>
            </div>
            <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-emerald-600 leading-none">{activeSurveyCount}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Active</p>
            </div>
            <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-gray-100">
              <p className="text-[22px] font-black text-purple-600 leading-none">{myParticipationCount}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">My Activity</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search surveys..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-brand-primary transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  activeFilter === f.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Survey Cards */}
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">No surveys found</p>
            </div>
          ) : (
            filteredSurveys.map(sv => {
              const colors = categoryColors[sv.category] || categoryColors.Opinion;
              const isSubmitted = !!(surveyResponses[sv.id]?.submittedAt);

              return (
                <div
                  key={sv.id}
                  onClick={() => setSelectedSurvey(sv)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {sv.banner && (
                    <div className="h-[120px] relative overflow-hidden">
                      <img src={sv.banner} alt={sv.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full`}>
                          {sv.category}
                        </span>
                        {sv.status === 'active' ? (
                          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-gray-400 text-white px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {!sv.banner && (
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold ${colors.bg} ${colors.text} ${colors.border} border px-2 py-0.5 rounded-full`}>
                          {sv.category}
                        </span>
                        {sv.status === 'active' ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">Completed</span>
                        )}
                      </div>
                    )}

                    <h3 className="text-[14.5px] font-extrabold text-gray-900 leading-snug mb-1">{sv.title}</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{sv.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <Users size={11} /> {sv.totalResponses} responses
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock size={11} /> Until {sv.deadline}
                        </span>
                      </div>
                      {isSubmitted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 size={13} /> Done
                        </span>
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SurveysPage;
