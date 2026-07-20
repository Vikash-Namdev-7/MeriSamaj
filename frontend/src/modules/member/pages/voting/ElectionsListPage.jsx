import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { useVoting } from './VotingContext';

const ElectionsListPage = () => {
  const navigate = useNavigate();
  const { elections, votedElections, loading } = useVoting();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeElections = elections.filter(e => e.status === 'Active');
  const pastElections = elections.filter(e => e.status === 'Completed' || e.status === 'Closed');

  return (
    <div className="min-h-screen bg-surface pb-16 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/member/voting')} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">Election List</h1>
        </div>
        <div className="text-xs font-semibold text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
          Total Elections ({elections.length})
        </div>
      </div>

      <div className="px-4 pt-5 max-w-xl mx-auto space-y-6">
        {/* Active Elections Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Elections</h3>
          
          <div className="space-y-3">
            {activeElections.map(active => {
              const hasVoted = votedElections[active.id];
              return (
                <div 
                  key={active.id}
                  onClick={() => navigate(`/member/voting/${active.id}`)}
                  className="card-std p-4 border border-gray-100 hover:border-purple-200 cursor-pointer relative overflow-hidden transition-all duration-200"
                >
                  {hasVoted && (
                    <div className="absolute right-0 top-0 bg-emerald-600 text-white text-[9px] font-bold uppercase py-0.5 px-3 rounded-bl-lg flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Voted
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-purple-900 pr-12 leading-snug">{active.title}</h4>
                    <Badge variant="warning" className="text-[9px] font-bold">Active</Badge>
                  </div>
                  <p className="text-[10px] text-text-secondary flex items-center gap-1">
                    <Calendar size={11} className="text-amber-500" /> {active.startDate} - {active.endDate}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Completed Elections Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Past Elections (Completed)</h3>
          
          <div className="space-y-3">
            {pastElections.map(past => (
              <div 
                key={past.id}
                onClick={() => navigate(`/member/voting/${past.id}`)}
                className="bg-card rounded-2xl p-4 border border-gray-100 hover:border-gray-200 cursor-pointer flex justify-between items-center transition-all duration-150 shadow-sm"
              >
                <div>
                  <h4 className="text-xs font-bold text-text-primary leading-snug">{past.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-1.5 flex items-center gap-1">
                    <Calendar size={11} className="text-gray-400" /> {past.startDate} - {past.endDate}
                  </p>
                </div>
                <Badge variant="default" className="text-[9px] font-bold bg-gray-200 text-gray-700">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionsListPage;
