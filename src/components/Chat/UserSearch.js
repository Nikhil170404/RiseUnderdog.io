import React, { useState, useEffect } from 'react';
import { firestore, collection, onSnapshot } from '../../firebase'; // Correct imports
import './UserSearch.css';

const UserSearch = ({ currentUserId, onSelect }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const usersRef = collection(firestore, 'users'); // Correct usage
    const unsubscribe = onSnapshot(usersRef, snapshot => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()) && // Check if username exists
    user.id !== currentUserId
  );

  return (
    <div className="user-search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      <ul className="user-list">
        {filteredUsers.map(user => (
          <li key={user.id} onClick={() => onSelect(user.id)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
