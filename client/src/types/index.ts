export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'child' | 'admin';
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  isPublic: boolean;
  isPrivate: boolean;
  likes: number;
  image: string;
  category: 'news' | 'activities' | 'photos' | 'announcements' | 'stories';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  parentComment?: string;
  likes: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'child';
}

export interface CreatePostForm {
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  isPrivate: boolean;
  category: 'news' | 'activities' | 'photos' | 'announcements' | 'stories';
  image?: string;
}

export interface CreateCommentForm {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface UpdateProfileForm {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  isPublic?: boolean;
}
