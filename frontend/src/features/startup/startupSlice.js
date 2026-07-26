import { createSlice } from '@reduxjs/toolkit';

const startupSlice = createSlice({
  name: 'startup',
  initialState: {
    startup: null,
    loading: false,
    error: null,
    analyses: [],
    readinessReports: [],
  },
  reducers: {
    setStartup: (state, action) => { state.startup = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setAnalyses: (state, action) => { state.analyses = action.payload; },
    setReadinessReports: (state, action) => { state.readinessReports = action.payload; },
    clearStartup: (state) => { state.startup = null; state.analyses = []; state.readinessReports = []; },
  },
});

export const { setStartup, setLoading, setError, setAnalyses, setReadinessReports, clearStartup } = startupSlice.actions;
export default startupSlice.reducer;
