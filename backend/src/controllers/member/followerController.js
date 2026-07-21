const Follower = require('../../models/Follower');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

// @desc    Follow/Unfollow user toggle
// @route   POST /api/v1/member/social/follow/:id
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user._id;

    if (followingId.toString() === followerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alreadyFollowing = await Follower.findOne({ followerId, followingId });

    if (alreadyFollowing) {
      await Follower.deleteOne({ _id: alreadyFollowing._id });
      res.json({ success: true, status: 'unfollowed' });
    } else {
      // Default auto-accept follow request (or set to pending depending on privacy flags)
      const follow = await Follower.create({
        followerId,
        followingId,
        status: 'accepted'
      });

      // Send Notification
      await Notification.create({
        recipientId: followingId,
        senderId: followerId,
        type: 'follow',
        entityType: 'Post', // Default placeholder entity type required by model constraints
        entityId: followerId // Links to follower user ID
      });

      res.json({ success: true, status: 'accepted', data: follow });
    }
  } catch (error) {
    console.error('toggleFollow error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get followers list
// @route   GET /api/v1/member/social/users/:id/followers
// @access  Private
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const followers = await Follower.find({ followingId: userId, status: 'accepted' })
      .populate('followerId', 'name avatar role city community');

    res.json({ success: true, data: followers.map(f => f.followerId) });
  } catch (error) {
    console.error('getFollowers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get following list
// @route   GET /api/v1/member/social/users/:id/following
// @access  Private
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const following = await Follower.find({ followerId: userId, status: 'accepted' })
      .populate('followingId', 'name avatar role city community');

    res.json({ success: true, data: following.map(f => f.followingId) });
  } catch (error) {
    console.error('getFollowing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
