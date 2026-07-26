import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import startupReducer from '../features/startup/startupSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    startup: startupReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
