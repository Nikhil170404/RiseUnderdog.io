import React, { useState } from 'react';
import { firestore } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './CreateEvent.css';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'events'), {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location
      });
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="create-event-container">
      <h1>Create New Event</h1>
      {error && <p className="error-message">{error}</p>}
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
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEvent;
