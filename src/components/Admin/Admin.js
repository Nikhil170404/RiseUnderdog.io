import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Edit, Delete, EmojiEvents, Add, FileCopy } from '@mui/icons-material';
import './Admin.css';

Modal.setAppElement('#root');

// Tournament Form Component
const TournamentForm = ({ formData, handleChange, handleSubmit, formError, closeModal }) => (
  <div className="admin-form">
    {Object.keys(formError).length > 0 && (
      <div className="form-errors">
        {Object.values(formError).map((err, index) => (
          <p key={index} className="form-error">{err}</p>
        ))}
      </div>
    )}
    <TextField
      label="Title"
      name="title"
      value={formData.title}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.title}
      helperText={formError.title}
    />
    <TextField
      label="Tournament Name"
      name="tournamentName"
      value={formData.tournamentName}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.tournamentName}
      helperText={formError.tournamentName}
    />
    <TextField
      label="Description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      multiline
      rows={4}
      error={!!formError.description}
      helperText={formError.description}
    />
    <TextField
      label="Participants"
      name="participants"
      type="number"
      value={formData.participants}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.participants}
      helperText={formError.participants}
    />
    <TextField
      label="Prize Pool"
      name="prizePool"
      type="number"
      value={formData.prizePool}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.prizePool}
      helperText={formError.prizePool}
    />
    <TextField
      label="Room ID"
      name="roomId"
      value={formData.roomId}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.roomId}
      helperText={formError.roomId}
    />
    <TextField
      label="Room Password"
      name="roomPassword"
      type="password"
      value={formData.roomPassword}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.roomPassword}
      helperText={formError.roomPassword}
    />
    <TextField
      label="WhatsApp Group Link"
      name="whatsappGroupLink"
      value={formData.whatsappGroupLink}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.whatsappGroupLink}
      helperText={formError.whatsappGroupLink}
    />
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Map Name</InputLabel>
      <Select
        name="mapName"
        value={formData.mapName}
        onChange={handleChange}
        label="Map Name"
      >
        <MenuItem value="">Select Map</MenuItem>
        <MenuItem value="Map1">Map 1</MenuItem>
        <MenuItem value="Map2">Map 2</MenuItem>
        <MenuItem value="Map3">Map 3</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Tournament Type</InputLabel>
      <Select
        name="tournamentType"
        value={formData.tournamentType}
        onChange={handleChange}
        label="Tournament Type"
      >
        <MenuItem value="">Select Type</MenuItem>
        <MenuItem value="solo">Solo</MenuItem>
        <MenuItem value="duo">Duo</MenuItem>
        <MenuItem value="squad">Squad</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Entry Fee</InputLabel>
      <Select
        name="isPaid"
        value={formData.isPaid}
        onChange={handleChange}
        label="Entry Fee"
      >
        <MenuItem value={false}>Free</MenuItem>
        <MenuItem value={true}>Paid</MenuItem>
      </Select>
    </FormControl>
    {formData.isPaid && (
      <TextField
        label="Entry Fee Amount"
        name="entryFee"
        type="number"
        value={formData.entryFee}
        onChange={handleChange}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!formError.entryFee}
        helperText={formError.entryFee}
      />
    )}
    <input
      type="file"
      name="image"
      accept="image/*"
      onChange={handleChange}
      className="image-upload"
    />
    <div className="form-actions">
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
      </Button>
      <Button variant="outlined" color="secondary" onClick={closeModal}>
        Close
      </Button>
    </div>
  </div>
);

// Tournament List Component
const TournamentList = ({ tournaments, handleEdit, handleDelete, openParticipantsModal, handleDuplicate }) => (
  <div className="tournament-list">
    {tournaments.length > 0 ? (
      tournaments.map((tournament) => (
        <div key={tournament.id} className="tournament-item">
          <div className="tournament-header">
            <h3>{tournament.title}</h3>
            {tournament.imageUrl && <img src={tournament.imageUrl} alt={tournament.title} className="tournament-image" />}
          </div>
          <p>{tournament.description}</p>
          <p>Entry Fee: {tournament.isPaid ? `$${tournament.entryFee}` : 'Free'}</p>
          <p>Participants: {tournament.participants}</p>
          <p>Prize Pool: ₹{tournament.prizePool}</p>
          <p>Map: {tournament.mapName}</p>
          <p>Type: {tournament.tournamentType}</p>
          {tournament.whatsappGroupLink && (
            <p>
              WhatsApp Group: <a href={tournament.whatsappGroupLink} target="_blank" rel="noopener noreferrer">Join</a>
            </p>
          )}
          <div className="tournament-actions">
            <IconButton color="primary" onClick={() => handleEdit(tournament)}><Edit /></IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(tournament.id)}><Delete /></IconButton>
            <IconButton color="info" onClick={() => openParticipantsModal(tournament)}><EmojiEvents /></IconButton>
            <IconButton color="primary" onClick={() => handleDuplicate(tournament)}><FileCopy /></IconButton>
          </div>
        </div>
      ))
    ) : (
      <p>No tournaments available.</p>
    )}
  </div>
);

// Participant Details Modal Component
const ParticipantDetailsModal = ({ participant, isOpen, onClose, onDeclareWinner }) => (
  <Modal isOpen={isOpen} onRequestClose={onClose} className="participant-modal" overlayClassName="participant-modal-overlay">
    <h2>Participant Details</h2>
    {participant ? ( // Check if participant is not null
      <>
        <p>Username: {participant.gameUsername}</p>
        <p>User ID: {participant.userId}</p>
        <Button variant="contained" color="primary" onClick={() => onDeclareWinner(participant)}>
          Declare Winner
        </Button>
      </>
    ) : (
      <p>No participant selected.</p> // Fallback message
    )}
    <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
  </Modal>
);

const AdminPanel = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    currentTournamentId: '',
    title: '',
    tournamentName: '',
    description: '',
    participants: '',
    prizePool: '',
    roomId: '',
    roomPassword: '',
    mapName: '',
    tournamentType: '',
    isPaid: false,
    entryFee: '',
    image: null,
    imageUrl: '',
    whatsappGroupLink: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'tournaments'), (snapshot) => {
      const tournamentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(tournamentData);
    });

    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.title) errors.title = "Title is required.";
    if (!formData.tournamentName) errors.tournamentName = "Tournament name is required.";
    if (!formData.description) errors.description = "Description is required.";
    if (!formData.participants) errors.participants = "Number of participants is required.";
    if (!formData.prizePool) errors.prizePool = "Prize pool is required.";
    if (!formData.roomId) errors.roomId = "Room ID is required.";
    if (!formData.roomPassword) errors.roomPassword = "Room Password is required.";
    if (!formData.mapName) errors.mapName = "Map name is required.";
    if (!formData.tournamentType) errors.tournamentType = "Tournament type is required.";
    if (formData.isPaid && !formData.entryFee) errors.entryFee = "Entry fee is required for paid tournaments.";
    if (!formData.whatsappGroupLink) errors.whatsappGroupLink = "WhatsApp group link is required.";

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (formData.image) {
        const imageRef = ref(storage, `tournament-images/${uuidv4()}`);
        await uploadBytes(imageRef, formData.image);
        const imageUrl = await getDownloadURL(imageRef);
        formData.imageUrl = imageUrl;
      }

      if (formData.currentTournamentId) {
        const tournamentDoc = doc(firestore, 'tournaments', formData.currentTournamentId);
        await updateDoc(tournamentDoc, {
          title: formData.title,
          tournamentName: formData.tournamentName,
          description: formData.description,
          participants: formData.participants,
          prizePool: formData.prizePool,
          roomId: formData.roomId,
          roomPassword: formData.roomPassword,
          mapName: formData.mapName,
          tournamentType: formData.tournamentType,
          isPaid: formData.isPaid,
          entryFee: formData.entryFee,
          imageUrl: formData.imageUrl,
          whatsappGroupLink: formData.whatsappGroupLink,
        });
      } else {
        const newTournamentRef = doc(collection(firestore, 'tournaments'));
        await setDoc(newTournamentRef, {
          title: formData.title,
          tournamentName: formData.tournamentName,
          description: formData.description,
          participants: formData.participants,
          prizePool: formData.prizePool,
          roomId: formData.roomId,
          roomPassword: formData.roomPassword,
          mapName: formData.mapName,
          tournamentType: formData.tournamentType,
          isPaid: formData.isPaid,
          entryFee: formData.entryFee,
          imageUrl: formData.imageUrl,
          whatsappGroupLink: formData.whatsappGroupLink,
        });
      }

      setSuccessMessage('Tournament successfully saved!');
      setFormData({
        currentTournamentId: '',
        title: '',
        tournamentName: '',
        description: '',
        participants: '',
        prizePool: '',
        roomId: '',
        roomPassword: '',
        mapName: '',
        tournamentType: '',
        isPaid: false,
        entryFee: '',
        image: null,
        imageUrl: '',
        whatsappGroupLink: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleEdit = (tournament) => {
    setFormData({
      currentTournamentId: tournament.id,
      title: tournament.title,
      tournamentName: tournament.tournamentName,
      description: tournament.description,
      participants: tournament.participants,
      prizePool: tournament.prizePool,
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
      mapName: tournament.mapName,
      tournamentType: tournament.tournamentType,
      isPaid: tournament.isPaid,
      entryFee: tournament.entryFee,
      imageUrl: tournament.imageUrl,
      whatsappGroupLink: tournament.whatsappGroupLink,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'tournaments', id));
      setSuccessMessage('Tournament successfully deleted!');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const handleDuplicate = async (tournament) => {
    try {
      const newTournamentRef = doc(collection(firestore, 'tournaments'));
      await setDoc(newTournamentRef, {
        ...tournament,
        title: `${tournament.title} - Copy`,
        currentTournamentId: undefined,
      });
      setSuccessMessage('Tournament successfully duplicated!');
    } catch (error) {
      console.error('Error duplicating tournament:', error);
    }
  };

  const openParticipantsModal = (tournament) => {
    // Open participants modal logic here
    setIsParticipantModalOpen(true);
    setSelectedParticipant(tournament.participants[0]); // Assuming the first participant is selected
  };

  const closeParticipantModal = () => {
    setIsParticipantModalOpen(false);
    setSelectedParticipant(null);
  };

  const handleDeclareWinner = async (participant) => {
    try {
      // Update the winner's wallet balance
      const userDoc = doc(firestore, 'users', participant.userId);
      await updateDoc(userDoc, {
        walletBalance: participant.walletBalance + parseInt(formData.prizePool),
      });

      // Close the modal
      closeParticipantModal();

      // Show success message
      setSuccessMessage(`${participant.gameUsername} has been declared the winner and their wallet balance has been updated!`);
    } catch (error) {
      console.error('Error declaring winner:', error);
    }
  };

  return (
    <div className="admin-panel">
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsModalOpen(true)}
        startIcon={<Add />}
      >
        Add Tournament
      </Button>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <TournamentList
        tournaments={tournaments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        openParticipantsModal={openParticipantsModal}
        handleDuplicate={handleDuplicate}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="admin-modal"
        overlayClassName="admin-modal-overlay"
      >
        <TournamentForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formError={formError}
          closeModal={() => setIsModalOpen(false)}
        />
      </Modal>
      <ParticipantDetailsModal
        participant={selectedParticipant}
        isOpen={isParticipantModalOpen}
        onClose={closeParticipantModal}
        onDeclareWinner={handleDeclareWinner}
      />
    </div>
  );
};

export default AdminPanel;