import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/client';

function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/users/change-password', formData);
      setMessage(response.data.message);
      // Clear form on success
      setFormData({ current_password: '', new_password: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Profile</h1>
      
      <div style={styles.profileInfo}>
        <p><strong>Full Name:</strong> {user.full_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Gym Registration ID:</strong> {user.gym_registration_number}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div style={styles.passwordForm}>
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    heading: { borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' },
    profileInfo: { marginBottom: '2rem' },
    passwordForm: { marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' },
    inputGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    button: { padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
    error: { color: 'red' },
    success: { color: 'green' },
};

export default ProfilePage;