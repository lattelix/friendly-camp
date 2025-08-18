import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '@/types';

interface PostsState {
  posts: Post[];
  userPosts: Post[];
  loading: boolean;
  error: string | null;
  selectedTags: string[];
}

// Загружаем посты из localStorage при инициализации
const loadPostsFromStorage = (): Post[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('posts');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const initialState: PostsState = {
  posts: loadPostsFromStorage(),
  userPosts: [],
  loading: false,
  error: null,
  selectedTags: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('posts', JSON.stringify(action.payload));
      }
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
      state.userPosts.unshift(action.payload);
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('posts', JSON.stringify(state.posts));
      }
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
        // Обновляем в userPosts если это пост пользователя
        const userIndex = state.userPosts.findIndex(p => p.id === action.payload.id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = action.payload;
        }
        // Сохраняем в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('posts', JSON.stringify(state.posts));
        }
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
      state.userPosts = state.userPosts.filter(p => p.id !== action.payload);
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('posts', JSON.stringify(state.posts));
      }
    },
    setUserPosts: (state, action: PayloadAction<Post[]>) => {
      state.userPosts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },
    toggleTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload;
      if (state.selectedTags.includes(tag)) {
        state.selectedTags = state.selectedTags.filter(t => t !== tag);
      } else {
        state.selectedTags.push(tag);
      }
    },
    clearTags: (state) => {
      state.selectedTags = [];
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setUserPosts,
  setLoading,
  setError,
  setSelectedTags,
  toggleTag,
  clearTags,
} = postsSlice.actions;

export default postsSlice.reducer;
