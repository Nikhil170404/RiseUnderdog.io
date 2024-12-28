import React, { useState, useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { FaPlus, FaTrash, FaTimes, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import Modal from 'react-modal';
import './GroupManagement.css';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { user } = useAuth();
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const groupCollectionRef = collection(firestore, 'groups');
    const unsubscribe = onSnapshot(groupCollectionRef, (snapshot) => {
      const fetchedGroups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    });

    return () => unsubscribe();
  }, [firestore]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup, chatMessage]);

  const handleImageUpload = async (file) => {
    const storageRef = ref(storage, `groupImages/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && groupDescription.trim() && groupImage) {
      try {
        const imageUrl = await handleImageUpload(groupImage);
        const groupCollectionRef = collection(firestore, 'groups');
        const newGroup = await addDoc(groupCollectionRef, {
          name: groupName,
          description: groupDescription,
          image: imageUrl,
          members: [user.uid],
          chat: [],
          leaderboard: [],
          achievements: [],
        });
        setGroupName('');
        setGroupDescription('');
        setGroupImage(null);
        setCreatingGroup(false);
        setSelectedGroup(newGroup.id);
      } catch (error) {
        console.error("Error creating group:", error);
      }
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const groupDocRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupDocRef, {
        members: arrayUnion(user.uid),
      });
      setSelectedGroup(groupId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleSendMessage = async () => {
    if (selectedGroup && chatMessage.trim()) {
      try {
        const groupDocRef = doc(firestore, 'groups', selectedGroup);
        await updateDoc(groupDocRef, {
          chat: arrayUnion({
            sender: user.displayName,
            message: chatMessage,
            timestamp: new Date(),
          }),
        });
        setChatMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const openChatPopup = (groupId) => {
    setSelectedGroup(groupId);
    setIsChatOpen(true);
  };

  const closeChatPopup = () => setIsChatOpen(false);

  const handleRemoveMember = async (memberId) => {
    try {
      const groupDocRef = doc(firestore, 'groups', selectedGroup);
      await updateDoc(groupDocRef, {
        members: arrayRemove(memberId),
      });
      if (memberId === user.uid) {
        setSelectedGroup(null);
        closeChatPopup();
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleDeleteGroup = async () => {
    if (selectedGroup) {
      try {
        const groupDocRef = doc(firestore, 'groups', selectedGroup);
        await deleteDoc(groupDocRef);
        setSelectedGroup(null);
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  const renderGroupItem = (group) => (
    <div key={group.id} className="group-item">
      <img src={group.image} alt={group.name} className="group-image" />
      <div className="group-info">
        <strong>{group.name}</strong>
        <p>{group.description}</p>
        {group.members.includes(user.uid) ? (
          <>
            <button onClick={() => openChatPopup(group.id)} className="group-button">
              Enter Group
            </button>
            {group.members[0] === user.uid && (
              <button onClick={handleDeleteGroup} className="delete-group-button">
                <FaTrash /> Delete Group
              </button>
            )}
          </>
        ) : (
          <button onClick={() => handleJoinGroup(group.id)} className="group-button">
            Join Group
          </button>
        )}
      </div>
    </div>
  );

  const renderChatMessages = () => {
    if (!selectedGroup) return null;

    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return null;

    return group.chat.slice().reverse().map((msg, index) => (
      <div
        key={index}
        className={`chat-message ${msg.sender === user.displayName ? 'self' : ''}`}
      >
        <div className={`chat-message-content ${msg.sender === user.displayName ? 'self' : ''}`}>
          <div className="chat-message-sender">
            {msg.sender === user.displayName ? 'You' : msg.sender}
          </div>
          <div className="chat-message-text">
            {msg.message}
          </div>
          <div className="chat-message-timestamp">
            {new Date(msg.timestamp.toDate()).toLocaleTimeString()}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="group-management">
      <h2>Manage Gaming Groups</h2>

      <button
        className="create-group-toggle"
        onClick={() => setCreatingGroup(!creatingGroup)}
      >
        {creatingGroup ? 'Cancel' : <FaPlus />} {creatingGroup ? 'Cancel' : 'Create Group'}
      </button>

      {creatingGroup && (
        <div className="create-group">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <textarea
            placeholder="Group Description"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGroupImage(e.target.files[0])}
          />
          {groupImage && (
            <img src={URL.createObjectURL(groupImage)} alt="Group Preview" className="group-image-preview" />
          )}
          <button onClick={handleCreateGroup} className="create-group-button">Create Group</button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search Groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="group-search"
      />

      <div className="group-list">
        <h3>Available Gaming Groups</h3>
        {groups
          .filter((group) =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(renderGroupItem)}
      </div>

      <Modal
        isOpen={isChatOpen}
        onRequestClose={closeChatPopup}
        className="group-chat-modal"
        overlayClassName="modal-overlay"
      >
        <div className="group-chat">
          <header className="chat-header">
            <h3>Group Chat</h3>
            <button onClick={closeChatPopup} className="chat-close-button">
              <FaTimes />
            </button>
          </header>

          <div className="chat-messages">
            {renderChatMessages()}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button onClick={handleSendMessage} className="send-message-button">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupManagement;
