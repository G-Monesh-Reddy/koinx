import React from 'react';

const CapitalGainsCard = ({ title, data, isAfterHarvesting }) => {
  const { profits, losses, netGains, realisedGains } = data;

  return (
    <div className={`rounded-2xl p-4 w-full shadow-md ${
      isAfterHarvesting ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'
    }`}>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="space-y-1">
        <div>Profits (ST): ₹{profits.st}</div>
        <div>Losses (ST): ₹{losses.st}</div>
        <div>Profits (LT): ₹{profits.lt}</div>
        <div>Losses (LT): ₹{losses.lt}</div>
        <div className="font-semibold">Net Gains: ₹{netGains}</div>
        <div className="font-semibold">Realised Gains: ₹{realisedGains}</div>
      </div>
    </div>
  );
};

export default CapitalGainsCard;