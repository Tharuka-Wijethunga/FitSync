import React, { useState } from 'react';
import apiClient from '../api/client';
import EditableExercise from './EditableExercise'; 

function ApprovalModal({ plan, onClose, onSuccess }) {
  const [editablePlan, setEditablePlan] = useState(JSON.parse(JSON.stringify(plan)));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleWorkoutChange = (e, workoutKey, field) => {
    const { value } = e.target;
    setEditablePlan(prev => ({
      ...prev,
      workout_plan: {
        ...prev.workout_plan,
        workouts: {
          ...prev.workout_plan.workouts,
          [workoutKey]: {
            ...prev.workout_plan.workouts[workoutKey],
            [field]: value
          }
        }
      }
    }));
  };

  const handleExerciseChange = (e, workoutKey, exerciseIndex) => {
    const { name, value } = e.target;
    const isNumber = ['sets', 'rest_seconds'].includes(name);

    const newExercises = [...editablePlan.workout_plan.workouts[workoutKey].exercises];
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      [name]: isNumber ? Number(value) : value,
    };

    setEditablePlan(prev => ({
      ...prev,
      workout_plan: {
        ...prev.workout_plan,
        workouts: {
          ...prev.workout_plan.workouts,
          [workoutKey]: {
            ...prev.workout_plan.workouts[workoutKey],
            exercises: newExercises,
          }
        }
      }
    }));
  };
  
  const addExercise = (workoutKey) => {
    const newExercise = { name: '', reps: '8-12', sets: 3, rest_seconds: 60 };
    setEditablePlan(prev => ({
        ...prev,
        workout_plan: {
          ...prev.workout_plan,
          workouts: {
            ...prev.workout_plan.workouts,
            [workoutKey]: {
              ...prev.workout_plan.workouts[workoutKey],
              exercises: [...prev.workout_plan.workouts[workoutKey].exercises, newExercise],
            }
          }
        }
      }));
  };
  
  const removeExercise = (workoutKey, exerciseIndex) => {
    const newExercises = editablePlan.workout_plan.workouts[workoutKey].exercises.filter((_, index) => index !== exerciseIndex);
    setEditablePlan(prev => ({
        ...prev,
        workout_plan: {
          ...prev.workout_plan,
          workouts: {
            ...prev.workout_plan.workouts,
            [workoutKey]: {
              ...prev.workout_plan.workouts[workoutKey],
              exercises: newExercises,
            }
          }
        }
      }));
  };

  const handleNutritionChange = (e, field) => {
    setEditablePlan(prev => ({
      ...prev,
      nutrition_guidelines: { ...prev.nutrition_guidelines, [field]: e.target.value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const updatePayload = {
      user_summary: editablePlan.user_summary, 
      body_analysis: editablePlan.body_analysis, 
      workout_plan: editablePlan.workout_plan,
      nutrition_guidelines: editablePlan.nutrition_guidelines,
      coach_notes: editablePlan.coach_notes || '',
    };
    
    try {
      await apiClient.put(`/coach/requests/${plan._id}/approve`, updatePayload);
      onSuccess();
    } catch (err) {
      setError('Failed to approve the plan. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Review & Edit Workout Plan</h2>
        
        <div style={styles.readOnlySection}>
          <h4>User's Request</h4>
          <p><strong>Goal:</strong> {plan.user_summary.fitness_goal}</p>
          <p><strong>Days/Week:</strong> {plan.user_summary.days_per_week}</p>
          <p><strong>User ID:</strong> {plan.user_id}</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldset}>
            <legend>Editable Workout Plan</legend>
            {Object.keys(editablePlan.workout_plan.workouts).map(workoutKey => (
              <div key={workoutKey} style={{marginBottom: '20px'}}>
                <h4>{workoutKey}</h4>
                <label>Warm-up</label>
                <input 
                    type="text" 
                    value={editablePlan.workout_plan.workouts[workoutKey].warm_up}
                    onChange={(e) => handleWorkoutChange(e, workoutKey, 'warm_up')}
                    style={styles.input}
                />
                <div style={{display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr', gap: '10px', fontSize: '12px', padding: '0 8px'}}>
                    <span>Name</span><span>Reps</span><span>Sets</span><span>Rest</span><span></span>
                </div>
                {editablePlan.workout_plan.workouts[workoutKey].exercises.map((ex, index) => (
                  <EditableExercise 
                    key={index}
                    exercise={ex}
                    index={index}
                    workoutKey={workoutKey}
                    handleExerciseChange={handleExerciseChange}
                    removeExercise={removeExercise}
                  />
                ))}
                <button type="button" onClick={() => addExercise(workoutKey)} style={styles.addButton}>+ Add Exercise</button>
              </div>
            ))}
          </fieldset>
          
          {/* Nutrition Section can be made editable similarly */}

          <fieldset style={styles.fieldset}>
            <legend>Coach's Notes</legend>
            <textarea
              value={editablePlan.coach_notes}
              onChange={(e) => setEditablePlan({...editablePlan, coach_notes: e.target.value})}
              style={styles.textarea}
              rows="4"
            />
          </fieldset>
          
          {error && <p style={styles.error}>{error}</p>}
          
          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.closeButton}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={styles.approveButton}>
              {isSubmitting ? 'Approving...' : 'Save & Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
    readOnlySection: { background: '#f8f9fa', padding: '15px', borderRadius: '5px', border: '1px solid #e9ecef', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    fieldset: { border: '1px solid #ccc', borderRadius: '5px', padding: '15px' },
    input: { width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' },
    textarea: { width: '95%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' },
    buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    closeButton: { padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    approveButton: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red' },
    addButton: { padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
};

export default ApprovalModal;