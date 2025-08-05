import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

function UserDashboardPage() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    // neck: '',
    // waist: '',
    // hip: '',
    fitness_goal: '',
    days_per_week: 3,
    injuries: 'none',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pastPlans, setPastPlans] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumberField = ['age', 'weight', 'height', 'neck', 'waist', 'hip', 'days_per_week'].includes(name);
    setFormData({
      ...formData,
      [name]: isNumberField ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/workouts/request-plan', formData);
      setSuccess('Successfully requested a new workout plan! It will appear in your history below.');
      fetchPastPlans(); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request workout plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPastPlans = async () => {
    try {
      const response = await apiClient.get('/workouts/my-requests');
      setPastPlans(response.data);
    } catch (error) {
      console.error("Failed to fetch past plans", error);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPastPlans();
    }
  }, [isAuthenticated]);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.content}>
        <div style={styles.formSection}>
          <h2>Request a New Workout Plan</h2>
          <form onSubmit={handleSubmit}>
            <input name="age" type="number" placeholder="Age" onChange={handleChange} style={styles.input} required />
            <select name="gender" onChange={handleChange} style={styles.input}><option>male</option><option>female</option></select>
            <input name="weight" type="number" placeholder="Weight (kg)" onChange={handleChange} style={styles.input} required />
            <input name="height" type="number" placeholder="Height (cm)" onChange={handleChange} style={styles.input} required />
            {/* <input name="neck" type="number" placeholder="Neck (cm)" onChange={handleChange} style={styles.input} required />
            <input name="waist" type="number" placeholder="Waist (cm)" onChange={handleChange} style={styles.input} required />
            <input name="hip" type="number" placeholder="Hip (cm)" onChange={handleChange} style={styles.input} required /> */}
            <textarea
              name="fitness_goal"
              placeholder="Describe your primary fitness goal (e.g., 'I want to build muscle in my upper body and improve my cardio')"
              onChange={handleChange}
              style={styles.input} 
              rows="3" // Give it a bit more height
              required
            />
            <label>Days per week: {formData.days_per_week}</label>
            <input name="days_per_week" type="range" min="1" max="7" value={formData.days_per_week} onChange={handleChange} style={styles.slider} />
            <textarea name="injuries" placeholder="Any injuries? (e.g., 'none')" onChange={handleChange} style={styles.input} />

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            
            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? 'Generating Plan...' : 'Request Plan'}
            </button>
          </form>
        </div>

        <div style={styles.historySection}>
          <h2>Your Workout Plan History</h2>
          {pastPlans.length > 0 ? (
            pastPlans.map(plan => {
              const isApproved = plan.status === 'approved';

              if (isApproved) {
                return (
                  <Link to={`/plan/${plan._id}`} key={plan._id} style={styles.planLink}>
                    <div style={styles.planCard}>
                      <h3>Goal: {plan.user_summary.fitness_goal}</h3>
                      <p>Status: <span style={styles.approved}>{plan.status}</span></p>
                      <p>Requested on: {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Date not available'}</p>
                    </div>
                  </Link>
                );
              }
            
              // If the plan is NOT approved, render a non-clickable div.
              return (
                <div key={plan._id} style={{ ...styles.planCard, ...styles.pendingCard }}>
                  <h3>Goal: {plan.user_summary.fitness_goal}</h3>
                  <p>Status: <span style={styles.pending}>{plan.status}</span></p>
                  <p>Requested on: {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Date not available'}</p>
                  <p style={styles.pendingText}>Awaiting coach approval...</p>
                </div>
              );
            })
          ) : (
            <p>You have no past workout plans.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
    dashboardContainer: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' },
    content: { display: 'flex', gap: '40px', marginTop: '20px' },
    formSection: { flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    historySection: { flex: 2, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    input: { display: 'block', width: '95%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    slider: { width: '100%' },
    submitButton: { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
    error: { color: 'red' },
    success: { color: 'green' },
    planCard: { 
      border: '1px solid #ddd', 
      padding: '15px', 
      borderRadius: '8px', 
      background: 'white',
      transition: 'box-shadow 0.2s',
    },    
    pendingCard: { backgroundColor: '#f8f9fa', cursor: 'not-allowed', opacity: 0.8 },
    pendingText: { fontSize: '14px', color: '#6c757d', fontStyle: 'italic' },
    pending: { color: 'orange', fontWeight: 'bold' },
    approved: { color: 'green', fontWeight: 'bold' },
    planLink: { 
      textDecoration: 'none', 
      color: 'inherit',
      display: 'block',
      marginBottom: '15px',
    },
};

export default UserDashboardPage;