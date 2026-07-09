// Communication Delivery Service

const seedDeliveryDetails = {};

class CommunicationDeliveryService {
  async getDeliveryStats(announcementId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      if (!seedDeliveryDetails[announcementId]) {
        // Generate mock logs for this announcement
        const total = Math.floor(Math.random() * 200 + 50);
        const delivered = Math.floor(total * 0.96);
        const failed = total - delivered;
        const read = Math.floor(delivered * 0.70);
        const clicked = Math.floor(read * 0.35);
        const dismissed = delivered - read;
        
        const logs = [];
        const channels = ['Push Notification', 'Email', 'SMS', 'In-App Notification', 'Web Notification'];
        const users = [
          'Amit Sharma', 'Priyanka Gupta', 'Vipin Mishra', 'Jaya Agrawal', 'Sunil Patidar',
          'Suresh Khandelwal', 'Anita Agrawal', 'Karan Johar', 'Meera Rajput', 'Deepak Jain'
        ];

        for (let i = 0; i < total; i++) {
          const user = users[i % users.length] + ' ' + (Math.floor(i / users.length) + 1);
          const channel = channels[i % channels.length];
          let status = 'Delivered';
          if (i < failed) status = 'Failed';
          else if (i < failed + clicked) status = 'Clicked';
          else if (i < failed + clicked + (read - clicked)) status = 'Read';
          else if (i % 7 === 0) status = 'Dismissed';

          logs.push({
            id: `dlv-${announcementId}-${i}`,
            user,
            channel,
            status,
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
            details: status === 'Failed' ? 'Gateway Timeout: Recipient carrier rejected payload' : 'Delivery success'
          });
        }
        
        seedDeliveryDetails[announcementId] = logs;
      }

      const logs = seedDeliveryDetails[announcementId];
      const stats = {
        total: logs.length,
        delivered: logs.filter(l => l.status !== 'Failed').length,
        failed: logs.filter(l => l.status === 'Failed').length,
        read: logs.filter(l => l.status === 'Read' || l.status === 'Clicked').length,
        clicked: logs.filter(l => l.status === 'Clicked').length,
        dismissed: logs.filter(l => l.status === 'Dismissed').length,
        pending: 0
      };

      return { success: true, stats, logs };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async getRetryQueue(announcementId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const res = await this.getDeliveryStats(announcementId);
      if (!res.success) return res;
      const failedLogs = res.logs.filter(l => l.status === 'Failed');
      return { success: true, data: failedLogs };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async retryFailedDeliveries(announcementId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const res = await this.getDeliveryStats(announcementId);
      if (!res.success) return res;

      const logs = seedDeliveryDetails[announcementId];
      let retriedCount = 0;
      
      logs.forEach(l => {
        if (l.status === 'Failed') {
          l.status = 'Delivered';
          l.details = 'Delivered after automatic administrator retry.';
          l.timestamp = new Date().toISOString();
          retriedCount++;
        }
      });

      return { success: true, count: retriedCount };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const communicationDeliveryService = new CommunicationDeliveryService();
