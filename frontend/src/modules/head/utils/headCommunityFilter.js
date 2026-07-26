/**
 * Utility to filter members for a Community Head based on their assigned communities.
 * Admin users see all members, while Head users see only members belonging to their assigned communities.
 */
export const filterMembersForHead = (membersList = [], headUser = null) => {
  if (!membersList || !Array.isArray(membersList)) return [];
  if (!headUser || headUser.role === 'admin') return membersList; // Admin sees all members

  const assignedIds = new Set();
  const assignedNames = new Set();

  if (Array.isArray(headUser.assignedCommunityIds)) {
    headUser.assignedCommunityIds.forEach(c => {
      if (typeof c === 'string') {
        assignedIds.add(c);
        assignedNames.add(c.toLowerCase());
      } else if (c && typeof c === 'object') {
        if (c._id) assignedIds.add(c._id.toString());
        if (c.id) assignedIds.add(c.id.toString());
        if (c.name) assignedNames.add(c.name.toLowerCase());
      }
    });
  }

  if (headUser.assignedCommunityId) {
    const c = headUser.assignedCommunityId;
    if (typeof c === 'string') {
      assignedIds.add(c);
      assignedNames.add(c.toLowerCase());
    } else if (c && typeof c === 'object') {
      if (c._id) assignedIds.add(c._id.toString());
      if (c.id) assignedIds.add(c.id.toString());
      if (c.name) assignedNames.add(c.name.toLowerCase());
    }
  }

  if (headUser.communityId) {
    const c = headUser.communityId;
    if (typeof c === 'string') {
      assignedIds.add(c);
      assignedNames.add(c.toLowerCase());
    } else if (c && typeof c === 'object') {
      if (c._id) assignedIds.add(c._id.toString());
      if (c.id) assignedIds.add(c.id.toString());
      if (c.name) assignedNames.add(c.name.toLowerCase());
    }
  }

  if (headUser.community && typeof headUser.community === 'string') {
    assignedNames.add(headUser.community.toLowerCase());
  }

  // If no community is assigned to this head user
  if (assignedIds.size === 0 && assignedNames.size === 0) {
    return [];
  }

  return membersList.filter(m => {
    const mCommunityId = m.communityId?._id?.toString() || m.communityId?.toString() || m.assignedCommunityId?.toString();
    const mCommunityName = (m.community || m.communityName || m.communityId?.name || '').toLowerCase();

    if (mCommunityId && assignedIds.has(mCommunityId)) return true;
    if (mCommunityName && assignedNames.has(mCommunityName)) return true;
    
    return false;
  });
};
