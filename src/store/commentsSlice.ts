import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment } from '@/types';

interface CommentsState {
  comments: Record<string, Comment[]>; // postId -> comments[]
  loading: boolean;
  error: string | null;
}

// Загружаем комментарии из localStorage при инициализации
const loadCommentsFromStorage = (): Record<string, Comment[]> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('comments');
    return saved ? JSON.parse(saved) : {};
  }
  return {};
};

const initialState: CommentsState = {
  comments: loadCommentsFromStorage(),
  loading: false,
  error: null,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<{ postId: string; comments: Comment[] }>) => {
      const { postId, comments } = action.payload;
      state.comments[postId] = comments;
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('comments', JSON.stringify(state.comments));
      }
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      const { postId } = action.payload;
      if (!state.comments[postId]) {
        state.comments[postId] = [];
      }
      state.comments[postId].unshift(action.payload);
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('comments', JSON.stringify(state.comments));
      }
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const { postId, id } = action.payload;
      if (state.comments[postId]) {
        const index = state.comments[postId].findIndex(c => c.id === id);
        if (index !== -1) {
          state.comments[postId][index] = action.payload;
          // Сохраняем в localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('comments', JSON.stringify(state.comments));
          }
        }
      }
    },
    deleteComment: (state, action: PayloadAction<{ postId: string; commentId: string }>) => {
      const { postId, commentId } = action.payload;
      if (state.comments[postId]) {
        state.comments[postId] = state.comments[postId].filter(c => c.id !== commentId);
        // Сохраняем в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('comments', JSON.stringify(state.comments));
        }
      }
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
  setComments,
  addComment,
  updateComment,
  deleteComment,
  setLoading,
  setError,
} = commentsSlice.actions;

export default commentsSlice.reducer;
