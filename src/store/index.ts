import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import revisionSlice from './slices/revisionSlice';
import userSlice from './slices/userSlice';
import analyticsSlice from './slices/analyticsSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    revision: revisionSlice,
    user: userSlice,
    analytics: analyticsSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;