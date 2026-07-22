const Voting = require('../../models/Voting');
const Vote = require('../../models/Vote');
const { notifyElectionCreated } = require('../../services/notificationService');

// Helper to resolve the community ID for write/bind operations
const resolveCommunityId = async (req) => {
  let communityId = req.communityId || req.user?.communityId;
  if (communityId) {
    return communityId._id || communityId;
  }
  
  if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return req.user.assignedCommunityIds[0];
  }
  
  if (req.user?.community) {
    const Community = require('../../models/Community');
    const comm = await Community.findOne({ name: req.user.community });
    if (comm) return comm._id;
  }
  
  const mongoose = require('mongoose');
  return new mongoose.Types.ObjectId('000000000000000000000000');
};

/**
 * Update voting statuses dynamically based on dates (Helper)
 */
const updateVotingStatuses = async (communityId) => {
  const now = new Date();
  
  // Update to Active if start date reached and still Upcoming
  await Voting.updateMany(
    { communityId: typeof communityId === 'object' && communityId.$in ? communityId : communityId, status: 'Upcoming', startDate: { $lte: now } },
    { $set: { status: 'Active' } }
  );

  // Update to Completed if end date passed and still Active
  await Voting.updateMany(
    { communityId: typeof communityId === 'object' && communityId.$in ? communityId : communityId, status: 'Active', endDate: { $lt: now } },
    { $set: { status: 'Completed' } }
  );
};

/**
 * Get all elections for the Head's community
 */
exports.getElections = async (req, res) => {
  try {
    let communityId = req.communityId;

    if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
      communityId = { $in: req.user.assignedCommunityIds };
    } else {
      // Fallback for users not yet fully migrated to ObjectId references
      if (!communityId && req.user.community) {
        const Community = require('../../models/Community');
        const comm = await Community.findOne({ name: req.user.community });
        if (comm) communityId = comm._id;
      }

      // Dev Fallback: If still no ID, use a dummy one so the UI still functions for testing
      if (!communityId) {
        const mongoose = require('mongoose');
        communityId = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    }

    await updateVotingStatuses(communityId);

    const votings = await Voting.find({ communityId: typeof communityId === 'object' && communityId.$in ? communityId : communityId }).sort({ createdAt: -1 }).lean();

    // Get vote counts for stats
    const voteCounts = await Vote.aggregate([
      { $match: { communityId: typeof communityId === 'object' && communityId.$in ? communityId : communityId } },
      { $group: {
          _id: { voting: "$voting", candidateId: "$candidateId" },
          count: { $sum: 1 }
      }}
    ]);

    const countsMap = {};
    voteCounts.forEach(vc => {
      const vId = vc._id.voting.toString();
      const cId = vc._id.candidateId.toString();
      if (!countsMap[vId]) countsMap[vId] = { total: 0 };
      countsMap[vId][cId] = vc.count;
      countsMap[vId].total += vc.count;
    });

    const formattedVotings = votings.map(v => {
      const vId = v._id.toString();
      const counts = countsMap[vId] || { total: 0 };
      
      const candidatesWithVotes = v.candidates.map(c => ({
        ...c,
        id: c._id.toString(),
        votes: counts[c._id.toString()] || 0
      }));

      return {
        ...v,
        id: vId,
        totalVotes: counts.total,
        candidates: candidatesWithVotes,
        // formatted dates for UI
        startDateFormatted: new Date(v.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        endDateFormatted: new Date(v.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedVotings,
    });
  } catch (error) {
    console.error('Error fetching head elections:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch elections' });
  }
};

/**
 * Create a new election
 */
exports.createElection = async (req, res) => {
  try {
    const { title, description, type, startDate, endDate, candidates } = req.body;
    const communityId = await resolveCommunityId(req);
    const createdBy = req.user._id;

    if (!title || !description || !startDate || !endDate || !candidates || candidates.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Please provide all required fields and at least 2 candidates' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ status: 'error', message: 'End date must be after start date' });
    }

    // Determine initial status based on date
    const now = new Date();
    let initialStatus = 'Upcoming';
    if (start <= now && end > now) {
      initialStatus = 'Active';
    } else if (end <= now) {
      initialStatus = 'Completed';
    }

    // Process candidates (generate initials if missing and handle empty age)
    const processedCandidates = candidates.map(c => {
      const initials = c.initials || (c.name && c.name.trim() ? c.name.trim().split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C');
      const candData = { ...c, initials };
      if (candData.age === '' || candData.age === null || candData.age === undefined) {
        delete candData.age;
      }
      return candData;
    });

    const newVoting = await Voting.create({
      title,
      description,
      type: type || 'Community Election',
      status: initialStatus,
      startDate: start,
      endDate: end,
      candidates: processedCandidates,
      communityId,
      createdBy
    });

    // ── Notification: notify community members about new election ───────────────
    try {
      const User = require('../../models/User');
      const members = await User.find({
        communityId,
        accountStatus: 'active',
        verificationStatus: 'verified',
        _id: { $ne: req.user._id }
      }).select('_id').lean();
      notifyElectionCreated(members.map(m => m._id), title, newVoting._id);
    } catch (notifErr) {
      console.warn('[Notify] createElection election_created failed:', notifErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Election created successfully',
      data: newVoting
    });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create election' });
  }
};

/**
 * Delete an election (Only if no votes cast or still upcoming)
 */
exports.deleteElection = async (req, res) => {
  try {
    const electionId = req.params.id;
    let query = {};
    if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
      query = { _id: electionId, communityId: { $in: req.user.assignedCommunityIds } };
    } else {
      const communityId = await resolveCommunityId(req);
      query = { _id: electionId, communityId };
    }

    const election = await Voting.findOne(query);
    if (!election) {
      return res.status(404).json({ status: 'error', message: 'Election not found' });
    }

    // Check if any votes exist
    const voteCount = await Vote.countDocuments({ voting: electionId });
    if (voteCount > 0) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete an election that already has votes.' });
    }

    if (election.status !== 'Upcoming' && election.status !== 'Draft') {
      return res.status(400).json({ status: 'error', message: 'Can only delete upcoming elections.' });
    }

    await Voting.deleteOne({ _id: electionId });

    res.status(200).json({
      status: 'success',
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete election' });
  }
};

/**
 * Manually close an election
 */
exports.closeElection = async (req, res) => {
  try {
    const electionId = req.params.id;
    let query = {};
    if (req.user?.role === 'head' && req.user.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
      query = { _id: electionId, communityId: { $in: req.user.assignedCommunityIds } };
    } else {
      const communityId = await resolveCommunityId(req);
      query = { _id: electionId, communityId };
    }

    const election = await Voting.findOneAndUpdate(
      query,
      { status: 'Closed' },
      { new: true }
    );

    if (!election) {
      return res.status(404).json({ status: 'error', message: 'Election not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Election closed successfully',
      data: election
    });
  } catch (error) {
    console.error('Error closing election:', error);
    res.status(500).json({ status: 'error', message: 'Failed to close election' });
  }
};
