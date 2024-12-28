// src/components/Leaderboard/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Leaderboard.css';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('All');
  const [games, setGames] = useState(['All']);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Fetch games for the filter dropdown
        const gamesQuery = query(collection(firestore, 'games'));
        const gamesSnapshot = await getDocs(gamesQuery);
        const gamesList = gamesSnapshot.docs.map(doc => doc.data().name);
        setGames(['All', ...gamesList]);

        // Fetch leaderboard data
        const leaderboardQuery = query(
          collection(firestore, 'players'),
          orderBy('score', 'desc')
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const playersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersList);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const filtered = players
      .filter(player =>
        (selectedGame === 'All' || player.game === selectedGame) &&
        (player.username.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '')
      );
    setFilteredPlayers(filtered);
  }, [searchTerm, selectedGame, players]);

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <p>See the top players and their scores!</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          {games.map((game, index) => (
            <option key={index} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
            <th>Game</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.score}</td>
                <td>{player.game}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No players found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
