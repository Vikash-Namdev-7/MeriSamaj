export const engagementSearchService = {
  searchActivities: async (communityId, query, filters = {}) => {
    console.log(`Searching activities for community ${communityId} with query "${query}"`, filters);
    
    // Return mock results
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, user: 'Ravi Kumar', action: 'Posted in General Discussion', date: new Date().toISOString() },
          { id: 2, user: 'Anita Sharma', action: 'Donated ₹500', date: new Date().toISOString() }
        ]);
      }, 400);
    });
  },

  searchMembers: async (communityId, query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '101', name: 'Ravi Kumar', phone: '9876543210' },
          { id: '102', name: 'Anita Sharma', phone: '9876543211' }
        ]);
      }, 300);
    });
  }
};
