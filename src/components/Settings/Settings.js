import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [basicSettings, setBasicSettings] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    notifications: true,
    privacy: 'public',
  });

  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicSettings({ ...basicSettings, [name]: value });
  };

  const handleAdvancedChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedSettings({
      ...advancedSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const validateForm = () => {
    if (basicSettings.password !== basicSettings.confirmPassword) {
      setFeedbackMessage('Passwords do not match.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(basicSettings.email)) {
      setFeedbackMessage('Invalid email address.');
      return false;
    }
    setFeedbackMessage('');
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Handle saving settings logic here
    console.log('Basic Settings:', basicSettings);
    console.log('Advanced Settings:', advancedSettings);
    console.log('Username:', username);
    console.log('Profile Picture:', profilePicture);

    // Mock success message
    setFeedbackMessage('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Manage your account settings and preferences here.</p>

      <form className="settings-form" onSubmit={handleSave}>
        <section className="basic-settings">
          <h2>Basic Settings</h2>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={basicSettings.email}
              onChange={handleBasicChange}
              placeholder="Enter your new email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={basicSettings.password}
              onChange={handleBasicChange}
              placeholder="Enter your new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={basicSettings.confirmPassword}
              onChange={handleBasicChange}
              placeholder="Confirm your new password"
            />
          </div>
        </section>

        <section className="advanced-settings">
          <h2>Advanced Settings</h2>
          <div className="form-group">
            <label htmlFor="notifications">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={advancedSettings.notifications}
                onChange={handleAdvancedChange}
              />
              Enable Notifications
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="privacy">Privacy Settings</label>
            <select
              id="privacy"
              name="privacy"
              value={advancedSettings.privacy}
              onChange={handleAdvancedChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
        </section>

        <section className="profile-settings">
          <h2>Profile Settings</h2>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            {profilePicture && (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Preview"
                className="profile-picture-preview"
              />
            )}
          </div>
        </section>

        {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

        <button type="submit" className="save-button">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
