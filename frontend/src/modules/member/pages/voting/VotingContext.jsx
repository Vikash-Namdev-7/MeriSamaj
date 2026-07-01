/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { mockElections as initialElections } from './mockVotingData';

const VotingContext = createContext(null);

export const VotingProvider = ({ children }) => {
  const [elections, setElections] = useState(initialElections);
  const [votedElections, setVotedElections] = useState({}); // { electionId: candidateId }

  const castVote = (electionId, candidateId) => {
    // Prevent double voting
    if (votedElections[electionId]) return;

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
    <VotingContext.Provider value={{ elections, votedElections, castVote, getElectionResult }}>
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
