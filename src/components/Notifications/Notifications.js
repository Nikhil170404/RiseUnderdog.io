import React, { useEffect, useState } from 'react';
import { messaging, onMessage,auth } from '../../firebase'; // Adjust imports accordingly
import { useAuthState } from 'react-firebase-hooks/auth';

const Notifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onMessage(messaging, (payload) => {
        setNotifications((prev) => [...prev, payload.notification]);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.map((notification, index) => (
        <div key={index} className="notification">
          <p>{notification.title}</p>
          <p>{notification.body}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
