import React from 'react';

function WorkoutDisplay({ workoutPlan }) {
  if (!workoutPlan) return null;

  return (
    <div style={styles.section}>
      <h2><i className="fas fa-dumbbell"></i> Workout Plan</h2>
      {workoutPlan.weekly_schedule.map(day => (
        <div key={day.day} style={styles.dayCard}>
          <h4>Day {day.day}: {day.activity}</h4>
          {workoutPlan.workouts[day.activity] ? (
            <div>
              <p><strong>Warm-up:</strong> {workoutPlan.workouts[day.activity].warm_up}</p>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Exercise</th>
                    <th style={styles.th}>Equipment</th>
                    <th style={styles.th}>Sets</th>
                    <th style={styles.th}>Reps/Duration</th>
                    <th style={styles.th}>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutPlan.workouts[day.activity].exercises.map((ex, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{ex.name}</td>
                      <td style={styles.td}>{ex.equipment}</td>
                      <td style={styles.td}>{ex.sets}</td>
                      <td style={styles.td}>{ex.reps}</td>
                      <td style={styles.td}>{ex.rest_seconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Cool-down:</strong> {workoutPlan.workouts[day.activity].cool_down}</p>
            </div>
          ) : (
            <p>Rest day or active recovery.</p>
          )}
        </div>
      ))}
      <div style={styles.notes}>
        <strong>Progressive Overload:</strong> {workoutPlan.progressive_overload_notes}
      </div>
    </div>
  );
}

const styles = {
    section: { marginBottom: '30px' },
    dayCard: { border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { background: '#f4f4f4', padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    notes: { marginTop: '20px', fontStyle: 'italic', background: '#f8f9fa', padding: '15px', borderRadius: '5px' }
};

export default WorkoutDisplay;