import axios from 'axios';
import { User, Post, Comment, AuthResponse, PaginatedResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'parent' | 'child';
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tags?: string;
    author?: string;
    search?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Post>> => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getPost: async (id: string): Promise<{ post: Post }> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (postData: {
    title: string;
    content: string;
    tags?: string[];
    isPublic?: boolean;
    isPrivate?: boolean;
    category?: string;
    image?: string;
  }): Promise<{ message: string; post: Post }> => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  updatePost: async (id: string, postData: Partial<Post>): Promise<{ message: string; post: Post }> => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id: string): Promise<{ message: string; likes: number }> => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  getPopularTags: async (): Promise<{ tags: Array<{ _id: string; count: number }> }> => {
    const response = await api.get('/posts/tags/popular');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<{ user: User; recentPosts: Post[] }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  followUser: async (id: string): Promise<{ message: string; isFollowing: boolean }> => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  getFeed: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Post>> => {
    const response = await api.get('/users/feed/posts', { params });
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getFollowers: async (id: string): Promise<{ followers: User[] }> => {
    const response = await api.get(`/users/${id}/followers`);
    return response.data;
  },

  getFollowing: async (id: string): Promise<{ following: User[] }> => {
    const response = await api.get(`/users/${id}/following`);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (postId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get(`/comments/post/${postId}`, { params });
    return response.data;
  },

  createComment: async (commentData: {
    content: string;
    postId: string;
    parentCommentId?: string;
  }): Promise<{ message: string; comment: Comment }> => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  updateComment: async (id: string, content: string): Promise<{ message: string; comment: Comment }> => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },

  deleteComment: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  likeComment: async (id: string): Promise<{ message: string; likes: number }> => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },

  getReplies: async (commentId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get(`/comments/${commentId}/replies`, { params });
    return response.data;
  },
};

export default api;
