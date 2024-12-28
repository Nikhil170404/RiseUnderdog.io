import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase'; // Import your Firebase config
import './Chat.css';

const Chat = ({ currentUserId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const chatId = [currentUserId, recipientId].sort().join('_');
    const messagesRef = firestore.collection('users').doc(currentUserId).collection('chat').doc(chatId).collection('messages');

    const unsubscribe = messagesRef.orderBy('timestamp').onSnapshot(snapshot => {
      const messagesData = snapshot.docs.map(doc => doc.data());
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [currentUserId, recipientId]);

  const handleSend = async () => {
    const chatId = [currentUserId, recipientId].sort().join('_');
    const timestamp = new Date().toISOString();
    
    await firestore.collection('users').doc(currentUserId).collection('chat').doc(chatId).collection('messages').add({
      sender: currentUserId,
      receiver: recipientId,
      text: newMessage,
      timestamp,
      chatId,
    });

    await firestore.collection('users').doc(recipientId).collection('chat').doc(chatId).collection('messages').add({
      sender: currentUserId,
      receiver: recipientId,
      text: newMessage,
      timestamp,
      chatId,
    });

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === currentUserId ? 'sent' : 'received'}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
