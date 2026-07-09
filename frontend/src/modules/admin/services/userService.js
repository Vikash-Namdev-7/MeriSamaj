import { mockUsers } from '../pages/users/mockData';

// Mock service for user management
class UserService {
  constructor() {
    this.users = [...mockUsers];
  }

  async getAllUsers(filters = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredUsers = [...this.users];
    
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.memberId.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.communityName.toLowerCase().includes(q)
      );
    }
    
    if (filters.status && filters.status !== 'All') {
      filteredUsers = filteredUsers.filter(u => u.accountStatus === filters.status);
    }
    
    if (filters.community && filters.community !== 'All Communities') {
      filteredUsers = filteredUsers.filter(u => u.communityName === filters.community);
    }

    return {
      data: filteredUsers,
      totalCount: filteredUsers.length
    };
  }

  async getUserDetails(userId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.users.find(u => u.id === userId);
  }

  async updateUserStatus(userId, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.users[userIndex].accountStatus = newStatus;
      return this.users[userIndex];
    }
    throw new Error('User not found');
  }

  async verifyUser(userId) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      this.users[userIndex].isVerified = true;
      this.users[userIndex].verificationStatus = 'Verified';
      this.users[userIndex].accountStatus = 'Active';
      return this.users[userIndex];
    }
    throw new Error('User not found');
  }

  async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      totalUsers: this.users.length,
      verifiedUsers: this.users.filter(u => u.isVerified).length,
      pendingVerification: this.users.filter(u => u.verificationStatus === 'Pending').length,
      suspendedUsers: this.users.filter(u => u.accountStatus === 'Suspended').length,
      deletedUsers: this.users.filter(u => u.accountStatus === 'Soft Deleted').length,
      onlineUsers: Math.floor(this.users.length * 0.15) // Mock
    };
  }
}

export const userService = new UserService();
