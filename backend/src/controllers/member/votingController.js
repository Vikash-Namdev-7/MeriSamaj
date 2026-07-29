const Voting = require('../../models/Voting');
const Vote = require('../../models/Vote');
const { applyScopeFilter } = require('../../utils/queryScopeHelper');

const ADMIN_ROLES = ['admin', 'super_admin', 'master_admin', 'master'];

// Helper to check if a voting election belongs to the requester's community (or if requester is admin)
const isSameCommunity = (doc, req) => {
  if (!doc) return false;
  const userRole = (req?.user?.role || '').toLowerCase();
  if (ADMIN_ROLES.includes(userRole)) return true; // Admin: global access

  const docCommId = doc.communityId?._id ?? doc.communityId;
  const reqCommId = req?.communityId || (req?.user?.communityId?._id || req?.user?.communityId);

  if (reqCommId && docCommId) {
    return docCommId.toString() === reqCommId.toString();
  }
  return false;
};

/**
 * Derive election status dynamically based on start/end dates
 */
const deriveVotingStatus = (voting) => {
  if (!voting) return 'Upcoming';
  if (voting.status === 'Cancelled') return 'Cancelled';
  const now = new Date();
  const start = new Date(voting.startDate);
  const end = new Date(voting.endDate);
  if (now < start) return 'Upcoming';
  if (now > end) return 'Completed';
  return 'Active';
};

/**
 * Get all votings for the user's community (or global for Admin)
 */
exports.getVotings = async (req, res) => {
  try {
    const query = applyScopeFilter(req, {});

    const votings = await Voting.find(query).sort({ createdAt: -1 }).lean();

    // Fetch user's votes to return which ones they've voted on
    const userVoteFilter = { user: req.user._id };
    if (query.communityId) {
      userVoteFilter.communityId = query.communityId;
    }
    const userVotes = await Vote.find(userVoteFilter).lean();
    const userVotedMap = userVotes.reduce((acc, vote) => {
      acc[vote.voting.toString()] = vote.candidateId;
      return acc;
    }, {});

    // Aggregate vote counts matching query.communityId if scoped
    const matchStage = query.communityId ? { communityId: query.communityId } : {};
    const voteCounts = await Vote.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $group: {
          _id: { voting: "$voting", candidateId: "$candidateId" },
          count: { $sum: 1 }
      }}
    ]);

    // Format vote counts: { votingId: { candidateId: count, total: sum } }
    const countsMap = {};
    voteCounts.forEach(vc => {
      const vId = vc._id.voting.toString();
      const cId = vc._id.candidateId.toString();
      if (!countsMap[vId]) countsMap[vId] = { total: 0 };
      countsMap[vId][cId] = vc.count;
      countsMap[vId].total += vc.count;
    });

    // Map to frontend expected structure
    const formattedVotings = votings.map(v => {
      const vId = v._id.toString();
      const counts = countsMap[vId] || { total: 0 };
      
      const candidatesWithVotes = v.candidates.map(c => ({
        ...c,
        id: c._id.toString(),
        initialVotes: counts[c._id.toString()] || 0
      }));

      const effectiveStatus = deriveVotingStatus(v);

      return {
        ...v,
        id: vId,
        status: effectiveStatus,
        startDate: new Date(v.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        endDate: new Date(v.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        closesIn: effectiveStatus === 'Completed' ? 'Ended' : effectiveStatus,
        totalVotesCast: counts.total,
        candidates: candidatesWithVotes,
        userVotedCandidateId: userVotedMap[vId] || null
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedVotings,
    });
  } catch (error) {
    console.error('Error fetching votings:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch votings' });
  }
};

/**
 * Get single voting by ID
 */
exports.getVotingById = async (req, res) => {
  try {
    const votingId = req.params.id;

    const voting = await Voting.findOne({ _id: votingId }).lean();
    if (!voting) {
      return res.status(404).json({ status: 'error', message: 'Voting not found' });
    }

    // Community Isolation Guard with Admin Bypass
    if (!isSameCommunity(voting, req)) {
      return res.status(403).json({ status: 'error', message: 'Access denied. This election belongs to another community.' });
    }

    const userVote = await Vote.findOne({ voting: votingId, user: req.user._id }).lean();

    const voteCounts = await Vote.aggregate([
      { $match: { voting: voting._id } },
      { $group: {
          _id: "$candidateId",
          count: { $sum: 1 }
      }}
    ]);

    let totalVotes = 0;
    const countsMap = {};
    voteCounts.forEach(vc => {
      countsMap[vc._id.toString()] = vc.count;
      totalVotes += vc.count;
    });

    const candidatesWithVotes = voting.candidates.map(c => ({
      ...c,
      id: c._id.toString(),
      initialVotes: countsMap[c._id.toString()] || 0
    }));

    const effectiveStatus = deriveVotingStatus(voting);

    const formattedVoting = {
      ...voting,
      id: voting._id.toString(),
      status: effectiveStatus,
      startDate: new Date(voting.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: new Date(voting.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      closesIn: effectiveStatus === 'Completed' ? 'Ended' : effectiveStatus,
      totalVotesCast: totalVotes,
      candidates: candidatesWithVotes,
      userVotedCandidateId: userVote ? userVote.candidateId : null
    };

    res.status(200).json({
      status: 'success',
      data: formattedVoting,
    });
  } catch (error) {
    console.error('Error fetching voting:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch voting' });
  }
};

/**
 * Cast a vote
 */
exports.castVote = async (req, res) => {
  try {
    const votingId = req.params.id;
    const { candidateId } = req.body;
    const userId = req.user._id;
    const communityId = req.communityId;
    if (!communityId) {
      return res.status(403).json({ status: 'error', message: 'User is not assigned to a community' });
    }

    const voting = await Voting.findOne({ _id: votingId });
    if (!voting) {
      return res.status(404).json({ status: 'error', message: 'Voting not found' });
    }

    // Community Isolation Guard
    if (voting.communityId && !voting.communityId.equals(communityId)) {
      return res.status(403).json({ status: 'error', message: 'Access denied. You cannot vote in an election of another community.' });
    }

    const effectiveStatus = deriveVotingStatus(voting);
    if (effectiveStatus !== 'Active') {
      return res.status(400).json({ status: 'error', message: 'Voting is not active' });
    }

    const candidateExists = voting.candidates.id(candidateId);
    if (!candidateExists) {
      return res.status(400).json({ status: 'error', message: 'Invalid candidate' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ voting: votingId, user: userId });
    if (existingVote) {
      return res.status(400).json({ status: 'error', message: 'You have already voted in this election' });
    }

    const newVote = await Vote.create({
      user: userId,
      voting: votingId,
      candidateId,
      communityId
    });

    // Broadcast real-time Socket event to update live election Commission charts
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('vote:cast', { 
          votingId, 
          candidateId,
          communityId
        });
      }
    } catch (socketErr) {
      console.warn('[Socket.io] vote:cast broadcast warning:', socketErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Vote cast successfully',
      data: newVote
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'You have already voted' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to cast vote' });
  }
};
