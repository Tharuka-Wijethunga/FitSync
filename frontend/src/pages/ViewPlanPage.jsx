import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import WorkoutDisplay from '../components/WorkoutDisplay'; 
import NutritionDisplay from '../components/NutritionDisplay';

function ViewPlanPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();
  
  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/workouts/${planId}`);
        setPlan(response.data);
      } catch (err) {
        setError('Failed to fetch workout plan. You may not have permission to view this plan yet.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (planId) {
        fetchPlan();
    }
  }, [planId]);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(data, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`FitSync-Workout-Plan-${planId}.pdf`);
  };

  if (isLoading) return <p>Loading your plan...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!plan) return <p>No plan found.</p>;

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Your Workout Plan: {plan.user_summary.fitness_goal}</h1>
        
        <div style={styles.buttonGroup}>
          <button onClick={handleDownloadPdf} style={styles.downloadButton}>Download as PDF</button>
          <Link to="/dashboard" style={styles.backLink}>← Back</Link>
        </div>
      </header>
      
      <div ref={printRef} style={styles.planContent}>
        <div style={styles.section}>
            <h2>Coach's Notes</h2>
            <p style={styles.coachNotes}>{plan.coach_notes || "No notes from the coach."}</p>
        </div>
        <WorkoutDisplay workoutPlan={plan.workout_plan} />
        <NutritionDisplay nutritionGuidelines={plan.nutrition_guidelines} />
      </div>
    </div>
  );
}

const styles = {
    pageContainer: { width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '20px' },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        borderBottom: '1px solid #ccc', 
        paddingBottom: '10px', 
        marginBottom: '20px',
        gap: '20px' 
    },
    heading: {
        margin: 0, 
        fontSize: '1.75rem',
        fontWeight: 'bold',
        lineHeight: 1.2,
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'flex-end',   
        gap: '8px',              
    },
    downloadButton: { 
        padding: '8px 16px', 
        background: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        whiteSpace: 'nowrap' 
    },
    backLink: { 
        textDecoration: 'none', 
        color: '#007bff', 
        fontSize: '14px',
    },
    planContent: { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    section: { marginBottom: '30px' },
    coachNotes: { fontStyle: 'italic', background: '#f8f9fa', padding: '15px', borderRadius: '5px' }
};

export default ViewPlanPage;