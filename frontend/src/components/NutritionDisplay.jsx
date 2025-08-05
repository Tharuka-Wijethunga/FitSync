import React from 'react';

function NutritionDisplay({ nutritionGuidelines }) {
  if (!nutritionGuidelines) return null;

  return (
    <div style={styles.section}>
      <h2><i className="fas fa-utensils"></i> Nutrition Guidelines</h2>
      <div style={styles.grid}>
        <div><strong>General Principles:</strong> <p>{nutritionGuidelines.general_principles}</p></div>
        <div><strong>Macronutrient Focus:</strong> <p>{nutritionGuidelines.macronutrient_focus}</p></div>
        <div><strong>Hydration:</strong> <p>{nutritionGuidelines.hydration}</p></div>
        <div><strong>Meal Timing:</strong> <p>{nutritionGuidelines.meal_timing_suggestion}</p></div>
      </div>
    </div>
  );
}

const styles = {
    section: { marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
};

export default NutritionDisplay;