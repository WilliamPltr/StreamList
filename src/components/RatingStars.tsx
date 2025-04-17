
import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange: (rating: number) => void;
  max?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, onChange, max = 5 }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-sm transition-transform hover:scale-110"
            aria-label={`Noter ${starValue} sur ${max}`}
          >
            <Star
              className={`h-6 w-6 ${
                isFilled ? 'text-yellow-400' : 'text-muted'
              } transition-colors duration-200`}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
