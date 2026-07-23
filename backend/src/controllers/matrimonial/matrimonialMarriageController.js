/**
 * matrimonialMarriageController.js
 * Handles the Marriage Lifecycle — the final stage of the Matrimonial journey.
 * Extends the existing Matrimonial module. Does NOT duplicate any existing logic.
 *
 * Flow:
 *   Connected → sendMarriageRequest → respondToMarriageRequest (accept/reject)
 *   On Accept: Both profiles set to status:married, isClosed:true, removed from matchmaking.
 *   On Reject: Stays Connected. User A notified.
 */
const MarriageRequest    = require('../../models/MarriageRequest');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const InterestRequest    = require('../../models/InterestRequest');
const Conversation       = require('../../models/Conversation');
const {
  notifyMarriageRequestReceived,
  notifyMarriageAccepted,
  notifyMarriageRejected,
  notifyProfileClosed
} = require('../../services/notificationService');
const { getIO } = require('../../services/socketRegistry');

// ─── Send Marriage Confirmation Request ───────────────────────────────────────
// Either connected partner can initiate.
exports.sendMarriageRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { message }  = req.body;

    // ─── Requester must have a matrimonial profile and be Connected ───────────
    const myProfile = await MatrimonialProfile.findOne({
      userId:    requesterId,
      isDeleted: false
    });
    if (!myProfile) {
      return res.status(404).json({ status: 'error', message: 'You do not have a matrimonial profile.' });
    }
    if (myProfile.maritalLifecycle !== 'connected') {
      return res.status(400).json({ status: 'error', message: 'You must be Connected with someone before sending a marriage confirmation.' });
    }
    if (myProfile.isClosed) {
      return res.status(400).json({ status: 'error', message: 'Your profile is already closed.' });
    }

    // ─── Find the accepted InterestRequest that links both users ─────────────
    const acceptedInterest = await InterestRequest.findOne({
      $or: [
        { senderId: requesterId, status: 'accepted' },
        { receiverId: requesterId, status: 'accepted' }
      ]
    });
    if (!acceptedInterest) {
      return res.status(400).json({ status: 'error', message: 'No accepted interest found. Cannot send marriage request.' });
    }

    // Determine the other user
    const receiverId = acceptedInterest.senderId.equals(requesterId)
      ? acceptedInterest.receiverId
      : acceptedInterest.senderId;

    // ─── Block duplicate pending requests (Transaction for safety) ─────────────
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();
    let marriageRequest;

    try {
      const existing = await MarriageRequest.findOne({
        $or: [
          { requesterId, receiverId, status: 'pending' },
          { requesterId: receiverId, receiverId: requesterId, status: 'pending' }
        ]
      }).session(session);

      if (existing) {
        throw new Error('DUPLICATE_PENDING');
      }

      // ─── Receiver must also be Connected ──────────────────────────────────────
      const receiverProfile = await MatrimonialProfile.findOne({
        userId:    receiverId,
        isDeleted: false
      }).session(session);

      if (!receiverProfile || receiverProfile.maritalLifecycle !== 'connected') {
        throw new Error('NOT_CONNECTED');
      }
      if (receiverProfile.isClosed) {
        throw new Error('ALREADY_CLOSED');
      }

      // ─── Create Marriage Request ───────────────────────────────────────────────
      const created = await MarriageRequest.create([{
        requesterId,
        receiverId,
        interestRequestId: acceptedInterest._id,
        message:           message || '',
        requestedAt:       new Date()
      }], { session });
      
      marriageRequest = created[0];

      await session.commitTransaction();
      session.endSession();
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      if (txErr.message === 'DUPLICATE_PENDING') {
        return res.status(400).json({ status: 'error', message: 'A marriage confirmation request is already pending between you two.' });
      } else if (txErr.message === 'NOT_CONNECTED') {
        return res.status(400).json({ status: 'error', message: 'The other user is not in Connected status.' });
      } else if (txErr.message === 'ALREADY_CLOSED') {
        return res.status(400).json({ status: 'error', message: 'The other user\'s profile is already closed.' });
      }
      throw txErr;
    }

    // ─── Notify receiver ───────────────────────────────────────────────────────
    notifyMarriageRequestReceived(receiverId, req.user.name, marriageRequest._id);

    // ─── Socket.IO: real-time notification ────────────────────────────────────
    const io = getIO();
    if (io) {
      io.to(`user:${receiverId}`).emit('matrimonial:marriageRequest', {
        requestId:   marriageRequest._id,
        requesterName: req.user.name,
        message:     message || ''
      });
    }

    res.status(201).json({
      status:  'success',
      message: 'Marriage confirmation request sent successfully.',
      data:    { request: marriageRequest }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Respond to Marriage Request (Accept / Reject) ────────────────────────────
exports.respondToMarriageRequest = async (req, res) => {
  try {
    const { id }     = req.params;
    const { action } = req.body; // 'accept' | 'reject'
    const receiverId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ status: 'error', message: 'Action must be accept or reject.' });
    }

    // ─── Find the pending request addressed to this user ─────────────────────
    const marriageRequest = await MarriageRequest.findOne({
      _id:      id,
      receiverId,
      status:   'pending'
    });
    if (!marriageRequest) {
      return res.status(404).json({ status: 'error', message: 'Marriage request not found or already processed.' });
    }

    marriageRequest.respondedAt = new Date();

    if (action === 'reject') {
      // ─── REJECT: keep Connected status, notify requester ─────────────────
      marriageRequest.status = 'rejected';
      await marriageRequest.save();

      notifyMarriageRejected(marriageRequest.requesterId, req.user.name);

      const io = getIO();
      if (io) {
        io.to(`user:${marriageRequest.requesterId}`).emit('matrimonial:marriageRejected', {
          requestId: marriageRequest._id
        });
      }

      return res.json({
        status:  'success',
        message: 'Marriage confirmation request declined. You remain Connected.',
        data:    { request: marriageRequest }
      });
    }

    // ─── ACCEPT: close both profiles ─────────────────────────────────────────
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Re-verify both profiles are still valid, active, and connected INSIDE the transaction phase
      const profiles = await MatrimonialProfile.find({
        userId: { $in: [marriageRequest.requesterId, receiverId] },
        isDeleted: false,
        status: 'active'
      }).session(session);

      if (profiles.length !== 2) {
        throw new Error('One or both profiles are no longer active or have been deleted/suspended.');
      }
      if (profiles.some(p => p.maritalLifecycle !== 'connected')) {
        throw new Error('Both users must be in a Connected state to finalize marriage.');
      }

      marriageRequest.status = 'accepted';
      await marriageRequest.save({ session });

      const now = new Date();

      // Update BOTH matrimonial profiles atomically
      await MatrimonialProfile.updateMany(
        {
          userId:    { $in: [marriageRequest.requesterId, receiverId] },
          isDeleted: false
        },
        {
          $set: {
            status:               'married',
            maritalLifecycle:     'married',
            isClosed:             true,
            closedAt:             now,
            marriageRequestId:    marriageRequest._id
          }
        },
        { session }
      );

      // Set marriageConfirmedWith cross-reference for each user
      await MatrimonialProfile.findOneAndUpdate(
        { userId: marriageRequest.requesterId, isDeleted: false },
        { $set: { marriageConfirmedWith: receiverId } },
        { session }
      );
      await MatrimonialProfile.findOneAndUpdate(
        { userId: receiverId, isDeleted: false },
        { $set: { marriageConfirmedWith: marriageRequest.requesterId } },
        { session }
      );

      // ─── Archive the matrimonial chat: mark conversation as read-only ─────────
      await Conversation.updateMany(
        {
          type:         'matrimonial',
          participants: { $all: [marriageRequest.requesterId, receiverId] }
        },
        {
          $set: {
            isArchived:   true,
            isReadOnly:   true,
            archivedAt:   now
          }
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      throw txErr;
    }

    // ─── Notifications to both users ──────────────────────────────────────────
    notifyMarriageAccepted(marriageRequest.requesterId, req.user.name);
    notifyProfileClosed(marriageRequest.requesterId);
    notifyProfileClosed(receiverId);

    // ─── Socket.IO: real-time update to both users, admin, and head ────────────
    const io = getIO();
    if (io) {
      const payload = { requestId: marriageRequest._id, status: 'married' };
      
      // Update participants
      io.to(`user:${marriageRequest.requesterId}`).emit('matrimonial:marriageAccepted', payload);
      io.to(`user:${receiverId}`).emit('matrimonial:marriageAccepted', payload);
      io.to(`user:${marriageRequest.requesterId}`).emit('matrimonial:profileClosed', { status: 'married' });
      io.to(`user:${receiverId}`).emit('matrimonial:profileClosed', { status: 'married' });

      // Update Dashboards (trigger refetch)
      io.emit('admin:matrimonial_update');
      
      // Look up community of either user for head update (assuming both in same community)
      const userProfile = await MatrimonialProfile.findOne({ userId: receiverId, isDeleted: false });
      if (userProfile && userProfile.personal && userProfile.personal.community) {
        io.emit('head:matrimonial_update'); // We can broadcast globally to all heads or specific ones
      } else {
        io.emit('head:matrimonial_update'); // fallback
      }
    }

    res.json({
      status:  'success',
      message: 'Marriage confirmed! Both profiles are now closed. Congratulations! 🎊',
      data:    { request: marriageRequest }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get My Marriage Requests (sent + received) ───────────────────────────────
exports.getMyMarriageRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const [sent, received] = await Promise.all([
      MarriageRequest.find({ requesterId: userId })
        .populate('receiverId', 'name avatar')
        .sort({ createdAt: -1 })
        .lean(),
      MarriageRequest.find({ receiverId: userId })
        .populate('requesterId', 'name avatar')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Enrich with matrimonial profile basics
    const enrichSide = async (requests, idField) => Promise.all(
      requests.map(async (r) => {
        const otherId = r[idField]?._id || r[idField];
        const profile = await MatrimonialProfile.findOne({ userId: otherId, isDeleted: false })
          .select('personal.fullName personal.gender photos location profileCompletion')
          .lean({ virtuals: true });
        return { ...r, partnerProfile: profile };
      })
    );

    const enrichedSent     = await enrichSide(sent, 'receiverId');
    const enrichedReceived = await enrichSide(received, 'requesterId');

    res.json({
      status: 'success',
      data:   { sent: enrichedSent, received: enrichedReceived }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get My Marriage Status ───────────────────────────────────────────────────
exports.getMarriageStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const myProfile = await MatrimonialProfile.findOne({ userId, isDeleted: false })
      .select('status maritalLifecycle isClosed closedAt marriageConfirmedWith marriageRequestId')
      .lean();

    if (!myProfile) {
      return res.json({ status: 'success', data: { hasProfile: false } });
    }

    // If connected, check if there's a pending marriage request
    let pendingRequest = null;
    if (myProfile.maritalLifecycle === 'connected' && !myProfile.isClosed) {
      pendingRequest = await MarriageRequest.findOne({
        $or: [
          { requesterId: userId, status: 'pending' },
          { receiverId:  userId, status: 'pending' }
        ]
      }).lean();
    }

    res.json({
      status: 'success',
      data:   {
        hasProfile:       true,
        profileStatus:    myProfile.status,
        maritalLifecycle: myProfile.maritalLifecycle,
        isClosed:         myProfile.isClosed,
        closedAt:         myProfile.closedAt,
        marriageConfirmedWith: myProfile.marriageConfirmedWith,
        pendingMarriageRequest: pendingRequest
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
