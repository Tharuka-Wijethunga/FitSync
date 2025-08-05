import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal'; 

function CoachDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pendingPlans, setPendingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingPlans = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/coach/pending-requests');
      setPendingPlans(response.data);
    } catch (err) {
      setError('Failed to fetch pending plans.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPlans();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleOpenModal = (plan) => {
    console.log("Opening modal for plan:", plan);
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(false);
  };
  
  const handleApprovalSuccess = () => {
    // When a plan is approved, close the modal and refresh the list
    handleCloseModal();
    fetchPendingPlans();
  };

  if (isLoading) return <p>Loading pending plans...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div style={styles.dashboardContainer}>

      <div style={styles.planList}>
        <h2>Pending Approval ({pendingPlans.length})</h2>
        {pendingPlans.length > 0 ? (
          pendingPlans.map(plan => (
            <div key={plan._id} style={styles.planCard}>
              <h3>Goal: {plan.user_summary.fitness_goal}</h3>
              <p>User ID: {plan.user_id}</p>
              <p>Requested on: {new Date(plan.created_at).toLocaleDateString()}</p>
              <button onClick={() => handleOpenModal(plan)} style={styles.reviewButton}>
                Review & Approve
              </button>
            </div>
          ))
        ) : (
          <p>No plans are currently pending approval.</p>
        )}
      </div>

      {isModalOpen && (
        <ApprovalModal 
          plan={selectedPlan} 
          onClose={handleCloseModal}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </div>
  );
}

const styles = {
    dashboardContainer: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' },
    logoutButton: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    planList: { marginTop: '20px' },
    planCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: 'white' },
    reviewButton: { padding: '8px 12px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};


export default CoachDashboardPage;