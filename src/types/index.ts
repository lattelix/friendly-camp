export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  isPublic: 'public' | 'private';
  tags: string[];
  likes: string[]; // ID пользователей, которые поставили лайк
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  postId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  targetUserId: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}
