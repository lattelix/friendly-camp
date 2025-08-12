import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import FeedPage from './pages/FeedPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterForm />} />

      <Route path="/" element={
        <Layout>
          <HomePage />
        </Layout>
      } />

      <Route path="/posts" element={
        <Layout>
          <PostsPage />
        </Layout>
      } />

      <Route path="/posts/:id" element={
        <Layout>
          <PostDetailPage />
        </Layout>
      } />

      <Route path="/create-post" element={
        <PrivateRoute>
          <Layout>
            <CreatePostPage />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/posts/:id/edit" element={
        <PrivateRoute>
          <Layout>
            <EditPostPage />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/users" element={
        <Layout>
          <UsersPage />
        </Layout>
      } />

      <Route path="/users/:id" element={
        <Layout>
          <UserProfilePage />
        </Layout>
      } />

      <Route path="/feed" element={
        <PrivateRoute>
          <Layout>
            <FeedPage />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;
