import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subscription, User } from '@/types';

interface SubscriptionsState {
  subscriptions: Subscription[];
  subscribedUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  subscribedUsers: [],
  loading: false,
  error: null,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(
        sub => sub.id !== action.payload
      );
    },
    setSubscribedUsers: (state, action: PayloadAction<User[]>) => {
      state.subscribedUsers = action.payload;
    },
    addSubscribedUser: (state, action: PayloadAction<User>) => {
      if (!state.subscribedUsers.find(user => user.id === action.payload.id)) {
        state.subscribedUsers.push(action.payload);
      }
    },
    removeSubscribedUser: (state, action: PayloadAction<string>) => {
      state.subscribedUsers = state.subscribedUsers.filter(
        user => user.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSubscriptions,
  addSubscription,
  removeSubscription,
  setSubscribedUsers,
  addSubscribedUser,
  removeSubscribedUser,
  setLoading,
  setError,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
