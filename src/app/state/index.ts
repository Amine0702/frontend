import { createSlice } from "@reduxjs/toolkit";

interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
}

const initialState: GlobalState = {
  isSidebarCollapsed: false,
  isDarkMode: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { toggleSidebar, toggleDarkMode } = globalSlice.actions;
export default globalSlice.reducer;
