import React from 'react';

const PlanDisplay = ({ planData }) => {
  if (!planData) return null;

  const { workout_plan, nutrition_guidelines } = planData;

  return (
    <div style={styles.planContainer}>
      {/* Nutrition Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Nutrition Guidelines</h3>
        <p><strong>Principles:</strong> {nutrition_guidelines.general_principles}</p>
        <p><strong>Macros:</strong> {nutrition_guidelines.macronutrient_focus}</p>
        <p><strong>Hydration:</strong> {nutrition_guidelines.hydration}</p>
        <p><strong>Timing:</strong> {nutrition_guidelines.meal_timing_suggestion}</p>
      </div>

      {/* Workout Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Workout Plan</h3>
        <p><strong>Progressive Overload:</strong> {workout_plan.progressive_overload_notes}</p>
        <div style={styles.schedule}>
          {workout_plan.weekly_schedule.map((day, index) => (
            <div key={index} style={styles.dayCard}>
              <h4>Day {day.day}: {day.activity}</h4>
              {workout_plan.workouts[day.activity] && (
                <ul>
                  {workout_plan.workouts[day.activity].exercises.map((ex, i) => (
                    <li key={i}>{ex.name}: {ex.sets} sets of {ex.reps}, {ex.rest_seconds}s rest</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = { /* Add some nice styles here */ };
export default PlanDisplay;