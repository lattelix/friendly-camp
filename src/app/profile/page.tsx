'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { setUserPosts, setLoading, setError, deletePost } from '@/store/postsSlice';
import { checkAuth } from '@/store/authSlice';
import { postsService } from '@/services/apiService';
import { Navigation } from '@/components/ui/Navigation';
import { PostCard } from '@/components/posts/PostCard';
import { SubscriptionManager } from '@/components/subscriptions/SubscriptionManager';
import { EditPostForm } from '@/components/posts/EditPostForm';
import { Post } from '@/types';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'subscriptions'>('posts');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { userPosts, loading, error } = useSelector((state: RootState) => state.posts);

  // Проверяем авторизацию только один раз при монтировании
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const loadUserPosts = useCallback(async () => {
    if (!user) return;

    try {
      dispatch(setLoading(true));
      const postsData = await postsService.getUserPosts(user.id);
      dispatch(setUserPosts(postsData));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки постов';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  // Загружаем посты пользователя только когда авторизованы
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPosts();
    }
  }, [isAuthenticated, user, loadUserPosts]);

  // Редирект на страницу входа если не авторизованы
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLike = (postId: string) => {
    // Лайки теперь обрабатываются в PostCard
    console.log('Лайк поста:', postId);
  };

  const handleComment = (postId: string) => {
    // Комментарии теперь обрабатываются в PostCard
    console.log('Комментарий к посту:', postId);
  };

  const handleShare = (postId: string) => {
    // Шаринг теперь обрабатывается в PostCard
    console.log('Поделиться постом:', postId);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;

    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await postsService.deletePost(postId, user.id);
        dispatch(deletePost(postId));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка удаления поста';
        alert(errorMessage);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingPost(null);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (editingPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <EditPostForm post={editingPost} onCancel={handleEditCancel} />
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка профиля...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Участник с {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Мои посты
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscriptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Подписки
              </button>
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои посты</h2>
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>У вас пока нет постов. Создайте свой первый пост!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Управление подписками</h2>
                <SubscriptionManager />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
