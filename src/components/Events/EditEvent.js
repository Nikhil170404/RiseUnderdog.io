import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore } from '../../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import './EditEvent.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(firestore, 'events', id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setTitle(eventData.title || '');
          setDescription(eventData.description || '');
          setDate(eventData.date ? eventData.date.toDate().toISOString().slice(0, 16) : '');
          setLocation(eventData.location || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventRef = doc(firestore, 'events', id);
      await updateDoc(eventRef, {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location,
      });
      navigate(`/events/${id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="edit-event-container">
      <h1>Edit Event</h1>
      {error && <p className="error-message">{error}</p>}
      {!error && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
            required
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Event Location"
            required
          />
          <button type="submit">Update Event</button>
        </form>
      )}
    </div>
  );
};

export default EditEvent;
