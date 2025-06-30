import React, { useState } from 'react';

const RatingForm = ({ currentRating, onUpdate }) => {
  const [rating, setRating] = useState(currentRating || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === '') {
      setError('Please enter a rating');
      return;
    }
    
    const ratingValue = parseFloat(rating);
    
    if (isNaN(ratingValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (ratingValue < 0 || ratingValue > 5) {
      setError('Rating must be between 0 and 5');
      return;
    }
    
    onUpdate(ratingValue);
    setError('');
  };

  return (
    <div className="rating-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rating">New Rating (0-5)</label>
          <input
            type="number"
            id="rating"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="form-input"
          />
          {error && <div className="form-error">{error}</div>}
        </div>
        <button type="submit" className="update-button">
          Update Rating
        </button>
      </form>
    </div>
  );
};

export default RatingForm;