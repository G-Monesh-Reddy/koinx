import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  baseGains: {
    st: { profits: 100, losses: 500 },
    lt: { profits: 1200, losses: 100 },
  },
  holdings: [
    { id: 'eth', name: 'Ethereum', stGain: 500, ltGain: -1000 },
  ],
  selectedHoldings: [],
};

const calculateGains = (state) => {
  let stProfits = state.baseGains.st.profits;
  let stLosses = state.baseGains.st.losses;
  let ltProfits = state.baseGains.lt.profits;
  let ltLosses = state.baseGains.lt.losses;

  state.selectedHoldings.forEach(id => {
    const h = state.holdings.find(h => h.id === id);
    if (!h) return;
    if (h.stGain > 0) stProfits += h.stGain;
    else stLosses += -h.stGain;
    if (h.ltGain > 0) ltProfits += h.ltGain;
    else ltLosses += -h.ltGain;
  });

  const netGains = (stProfits - stLosses) + (ltProfits - ltLosses);
  return {
    profits: { st: stProfits, lt: ltProfits },
    losses: { st: stLosses, lt: ltLosses },
    netGains,
    realisedGains: netGains,
  };
};

const capitalGainsSlice = createSlice({
  name: 'capitalGains',
  initialState,
  reducers: {
    toggleHolding: (state, action) => {
      const id = action.payload;
      if (state.selectedHoldings.includes(id)) {
        state.selectedHoldings = state.selectedHoldings.filter(h => h !== id);
      } else {
        state.selectedHoldings.push(id);
      }
    },
  },
});

export const { toggleHolding } = capitalGainsSlice.actions;
export const selectAfterHarvesting = (state) => calculateGains(state.capitalGains);
export default capitalGainsSlice.reducer;