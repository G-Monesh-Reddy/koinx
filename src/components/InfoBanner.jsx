import React from 'react';

const InfoBanner = ({ savings }) => {
  if (savings <= 0) return null;
  return (
    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      🎉 You're going to save up to ₹{savings}
    </div>
  );
};

export default InfoBanner;