/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import votingService from '../../../../core/api/votingService';

const VotingContext = createContext(null);

export const VotingProvider = ({ children }) => {
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState({}); // { electionId: candidateId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVotings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await votingService.getVotings();
      if (res.status === 'success') {
        setElections(res.data);
        // build votedElections from data
        const votedMap = {};
        res.data.forEach(v => {
          if (v.userVotedCandidateId) {
            votedMap[v.id] = v.userVotedCandidateId;
          }
        });
        setVotedElections(votedMap);
      }
    } catch (err) {
      console.error('Error fetching votings:', err);
      setError(err.message || 'Failed to load votings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotings();
  }, [fetchVotings]);

  const castVote = async (electionId, candidateId) => {
    // Prevent double voting early in UI
    if (votedElections[electionId]) return;

    try {
      const res = await votingService.castVote(electionId, candidateId);
      if (res.status === 'success') {
        // Optimistically update
        setVotedElections(prev => ({
          ...prev,
          [electionId]: candidateId
        }));

        setElections(prevElections =>
          prevElections.map(election => {
            if (election.id === electionId) {
              const updatedCandidates = election.candidates.map(candidate => {
                if (candidate.id === candidateId) {
                  return {
                    ...candidate,
                    initialVotes: (candidate.initialVotes || 0) + 1
                  };
                }
                return candidate;
              });
              return {
                ...election,
                totalVotesCast: (election.totalVotesCast || 0) + 1,
                candidates: updatedCandidates
              };
            }
            return election;
          })
        );
      }
    } catch (err) {
      console.error('Error casting vote:', err);
      throw err; // allow component to catch and show error toast
    }
  };

  const getElectionResult = (electionId) => {
    const election = elections.find(e => e.id === electionId);
    if (!election) return [];

    const total = election.candidates.reduce((sum, c) => sum + (c.initialVotes || 0), 0);

    return election.candidates.map(candidate => {
      const votes = candidate.initialVotes || 0;
      const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
      return {
        ...candidate,
        votes,
        percentage
      };
    });
  };

  return (
    <VotingContext.Provider value={{ 
      elections, 
      votedElections, 
      castVote, 
      getElectionResult,
      loading,
      error,
      refresh: fetchVotings
    }}>
      {children || <Outlet />}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
