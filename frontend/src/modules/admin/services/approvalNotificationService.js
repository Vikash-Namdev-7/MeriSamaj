class ApprovalNotificationService {
  constructor() {
    this.storageKey = 'merisamaj_v6_approval_notifications';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        const initialNotifications = [
          {
            id: 'notif-101',
            userId: 'MS-AG-102',
            role: 'Member',
            eventType: 'Request Under Review',
            message: 'Your registration request for Agrawal Samaj is now under review.',
            channels: ['Push', 'Email'],
            status: 'Delivered',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            retryCount: 0
          },
          {
            id: 'notif-102',
            userId: 'CH-AG-901',
            role: 'Community Head',
            eventType: 'New Assignment',
            message: 'A new Family Verification request FAM-1004 is waiting for your review.',
            channels: ['Email', 'In-App'],
            status: 'Delivered',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            retryCount: 0
          }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(initialNotifications));
      }
    } catch (e) {
      console.error(e);
    }
  }

  _getNotifications() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveNotifications(notifs) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifs));
    } catch (e) {
      console.error(e);
    }
  }

  async sendNotification(userId, role, eventType, message) {
    const list = this._getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      role,
      eventType,
      message,
      channels: ['In-App', 'Email', 'Push'],
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    list.push(newNotif);
    this._saveNotifications(list);
    return newNotif;
  }

  async sendBulkNotifications(userIds = [], role, eventType, message) {
    const list = this._getNotifications();
    const results = [];
    const now = new Date().toISOString();

    userIds.forEach(uid => {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: uid,
        role,
        eventType,
        message,
        channels: ['In-App', 'Email'],
        status: 'Delivered',
        timestamp: now,
        retryCount: 0
      };
      list.push(newNotif);
      results.push(newNotif);
    });

    this._saveNotifications(list);
    return results;
  }

  async retryNotification(id) {
    const list = this._getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].retryCount += 1;
      list[idx].status = 'Delivered';
      list[idx].timestamp = new Date().toISOString();
      this._saveNotifications(list);
      return list[idx];
    }
    throw new Error('Notification not found');
  }

  async notificationHistory() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = this._getNotifications();
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  }
}

export const approvalNotificationService = new ApprovalNotificationService();
export default approvalNotificationService;
