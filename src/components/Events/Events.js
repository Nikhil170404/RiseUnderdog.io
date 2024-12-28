import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventsRef = collection(firestore, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
    }, (error) => {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    });

    return () => unsubscribe();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <ul className="events-list">
        {events.map(event => (
          <li key={event.id} className="event-item">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
            <Link to={`/events/${event.id}`}>View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
