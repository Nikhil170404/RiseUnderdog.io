import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(firestore, 'events', id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="event-detail-container">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
      <p>Location: {event.location}</p>
      <p>Time: {new Date(event.date.seconds * 1000).toLocaleTimeString()}</p>
    </div>
  );
};

export default EventDetail;
