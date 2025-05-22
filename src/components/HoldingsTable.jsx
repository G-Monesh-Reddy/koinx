import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleHolding } from '../store/capitalGainsSlice';

const HoldingsTable = () => {
  const dispatch = useDispatch();
  const { holdings, selectedHoldings } = useSelector(state => state.capitalGains);

  return (
    <table className="min-w-full mt-6 text-sm text-left">
      <thead>
        <tr className="text-gray-600 border-b border-gray-200">
          <th className="p-2">Select</th>
          <th className="p-2">Asset</th>
          <th className="p-2">Short-Term Gain</th>
          <th className="p-2">Long-Term Gain</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map(asset => (
          <tr key={asset.id} className="border-b border-gray-100">
            <td className="p-2">
              <input
                type="checkbox"
                checked={selectedHoldings.includes(asset.id)}
                onChange={() => dispatch(toggleHolding(asset.id))}
              />
            </td>
            <td className="p-2">{asset.name}</td>
            <td className="p-2">{asset.stGain}</td>
            <td className="p-2">{asset.ltGain}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HoldingsTable;