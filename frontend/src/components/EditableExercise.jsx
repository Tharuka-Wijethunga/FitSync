import React from 'react';

function EditableExercise({ exercise, index, workoutKey, handleExerciseChange, removeExercise }) {
  
  const styles = {
    container: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr', gap: '10px', alignItems: 'center', marginBottom: '10px' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' },
    removeButton: { padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Exercise Name"
        name="name"
        value={exercise.name}
        onChange={(e) => handleExerciseChange(e, workoutKey, index)}
        style={styles.input}
      />
      <input
        type="text" // Use text to allow for ranges like "8-12"
        placeholder="Reps/Duration"
        name="reps"
        value={exercise.reps}
        onChange={(e) => handleExerciseChange(e, workoutKey, index)}
        style={styles.input}
      />
      <input
        type="number"
        placeholder="Sets"
        name="sets"
        value={exercise.sets}
        onChange={(e) => handleExerciseChange(e, workoutKey, index)}
        style={styles.input}
      />
      <input
        type="number"
        placeholder="Rest (s)"
        name="rest_seconds"
        value={exercise.rest_seconds}
        onChange={(e) => handleExerciseChange(e, workoutKey, index)}
        style={styles.input}
      />
      <button type="button" onClick={() => removeExercise(workoutKey, index)} style={styles.removeButton}>X</button>
    </div>
  );
}

export default EditableExercise;