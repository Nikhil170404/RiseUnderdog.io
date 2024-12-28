import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc,
  serverTimestamp,
  writeBatch
} from '../firebase';
import { useSelector } from 'react-redux';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector(state => state.auth);
  const { isAdmin } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) return;

    // Query for user-specific notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // If admin, also get admin notifications
    const adminNotificationsQuery = isAdmin ? query(
      collection(db, 'notifications'),
      where('type', '==', 'admin'),
      orderBy('createdAt', 'desc')
    ) : null;

    // Subscribe to notifications
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach(doc => {
        newNotifications.push({ id: doc.id, ...doc.data() });
      });
      
      if (adminNotificationsQuery) {
        // Get admin notifications
        const unsubscribeAdmin = onSnapshot(adminNotificationsQuery, (adminSnapshot) => {
          adminSnapshot.forEach(doc => {
            if (!newNotifications.find(n => n.id === doc.id)) {
              newNotifications.push({ id: doc.id, ...doc.data() });
            }
          });
          updateNotifications(newNotifications);
        });
        return () => {
          unsubscribeAdmin();
        };
      } else {
        updateNotifications(newNotifications);
      }
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const updateNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => !n.read)
        .forEach(notification => {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, {
            read: true,
            readAt: serverTimestamp(),
          });
        });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
