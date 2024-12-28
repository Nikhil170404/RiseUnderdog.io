import React, { useState } from 'react';
import UserSearch from './UserSearch';
import Chat from './Chat';

const ChatInterface = ({ currentUserId }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="chat-interface">
      {!selectedUserId ? (
        <UserSearch currentUserId={currentUserId} onSelect={setSelectedUserId} />
      ) : (
        <Chat currentUserId={currentUserId} recipientId={selectedUserId} />
      )}
    </div>
  );
};

export default ChatInterface;
