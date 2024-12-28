import { db, doc, collection, setDoc, serverTimestamp, deleteDoc, updateDoc, getDocs, query, where, orderBy } from '../firebase';

class NotificationService {
  static swRegistration = null;

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
        scope: '/',
      });

      NotificationService.swRegistration = registration;
      return true;
    } catch (error) {
      console.error('Error registering service worker:', error);
      return false;
    }
  }

  static async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async getNotifications(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async createNotification(userId, title, message, type, soundType = 'default') {
    try {
      const notificationsRef = collection(db, 'notifications');
      const notificationData = {
        recipientId: userId,
        title,
        message,
        type,
        soundType,
        createdAt: serverTimestamp(),
        read: false,
        url: this.getNotificationUrl(type)
      };

      console.log('Creating notification:', notificationData);
      const docRef = doc(notificationsRef);
      await setDoc(docRef, notificationData);
      console.log('Notification created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static getNotificationUrl(type) {
    switch (type) {
      case 'wallet':
        return '/wallet';
      case 'tournament':
        return '/tournaments';
      case 'game':
        return '/games';
      case 'user':
        return '/profile';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  }

  static async sendWalletNotification(userId, type, amount, status) {
    const title = `💰 Wallet ${type}`;
    const message = `Your ${type} of $${amount} has been ${status}`;
    return this.createNotification(userId, title, message, 'wallet');
  }

  static async sendTournamentNotification(userId, tournamentName, action) {
    const title = `🏆 Tournament Update`;
    const message = `Tournament "${tournamentName}" ${action}`;
    return this.createNotification(userId, title, message, 'tournament');
  }

  static async sendGameNotification(userId, gameName, action) {
    const title = `🎮 Game Update`;
    const message = `Game "${gameName}" ${action}`;
    return this.createNotification(userId, title, message, 'game');
  }

  static async sendUserNotification(userId, action) {
    const title = `👤 Account Update`;
    const message = `Your account has been ${action}`;
    return this.createNotification(userId, title, message, 'user');
  }

  static async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  static async updateNotification(notificationId, updates) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  }

  static async sendAdminNotification(title, message, type = 'announcement', priority = 'normal') {
    try {
      // Get all users
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const userCount = snapshot.size;
      
      const notifications = [];
      const adminLogRef = doc(collection(db, 'adminNotificationLogs'));
      
      // Create admin notification log
      const adminLogData = {
        title: `📢 ${title}`,
        message,
        type: 'admin',
        priority,
        createdAt: serverTimestamp(),
        totalRecipients: userCount,
        status: 'sending'
      };
      
      // Save the admin notification log
      await setDoc(adminLogRef, adminLogData);
      
      // Create notifications for all users
      for (const userDoc of snapshot.docs) {
        const userId = userDoc.id;
        const notificationsRef = collection(db, 'notifications');
        
        const notificationData = {
          recipientId: userId,
          title: `📢 ${title}`,
          message,
          type: 'admin',
          soundType: priority === 'high' ? 'alert' : 'default',
          createdAt: serverTimestamp(),
          read: false,
          url: '/notifications',
          priority,
          senderRole: 'admin',
          adminLogId: adminLogRef.id
        };

        const notificationRef = doc(notificationsRef);
        notifications.push(setDoc(notificationRef, notificationData));
      }

      // Wait for all notifications to be created
      await Promise.all(notifications);
      
      // Update admin log status to completed
      await updateDoc(adminLogRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // Create a single notification for admin to show the summary
      const adminSummaryNotification = {
        recipientId: 'admin',
        title: '📊 Admin Notification Summary',
        message: `Successfully sent "${title}" to ${userCount} users`,
        type: 'admin',
        soundType: 'default',
        createdAt: serverTimestamp(),
        read: false,
        url: '/admin/notifications',
        priority: 'normal',
        senderRole: 'system',
        adminLogId: adminLogRef.id,
        userCount: userCount,
        originalTitle: title,
        originalMessage: message
      };

      await setDoc(doc(collection(db, 'notifications')), adminSummaryNotification);

      return {
        success: true,
        adminLogId: adminLogRef.id,
        recipientCount: userCount
      };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      
      const updates = snapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export default NotificationService;
