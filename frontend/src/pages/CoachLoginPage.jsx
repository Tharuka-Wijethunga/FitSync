import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';


function CoachLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { coachLogin } = useAuth();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const role = await coachLogin(email, password);
      
      if (role === 'coach') {
        navigate('/coach-dashboard');
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>Coach Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.linkText}>
          Are you a user? <RouterLink to="/login">Login here</RouterLink>
        </p>
      </div>
    </div>
  );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    formContainer: { padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' },
    inputGroup: { marginBottom: '20px', textAlign: 'left' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    button: { width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
    error: { color: 'red', marginBottom: '15px' },
    linkText: { marginTop: '20px' }
};

export default CoachLoginPage;