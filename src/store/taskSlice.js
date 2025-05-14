import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null,
  selectedFilter: 'all'
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setSelectedFilter: (state, action) => {
      state.selectedFilter = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.selectedTask = null;
      state.error = null;
    }
  },
});

export const { setTasks, setLoading, setError, setSelectedTask, setSelectedFilter, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;