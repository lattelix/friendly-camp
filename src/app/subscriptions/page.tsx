'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { setPosts, setLoading, setError } from '@/store/postsSlice';
import { checkAuth } from '@/store/authSlice';
import { postsService } from '@/services/apiService';
import { Navigation } from '@/components/ui/Navigation';
import { PostCard } from '@/components/posts/PostCard';
import { SubscriptionManager } from '@/components/subscriptions/SubscriptionManager';
import { Post } from '@/types';

export default function SubscriptionsPage() {
  const [subscriptionPosts, setSubscriptionPosts] = useState<Post[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { posts } = useSelector((state: RootState) => state.posts);
  const { subscriptions } = useSelector((state: RootState) => state.subscriptions);

  // Проверяем авторизацию только один раз при монтировании
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Редирект на страницу входа если не авторизованы
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const loadSubscriptionPosts = useCallback(async () => {
    if (!user) return;

    try {
      dispatch(setLoading(true));
      // Получаем все посты и фильтруем по подпискам
      const allPosts = await postsService.getPosts();
      const subscribedUserIds = subscriptions.map(sub => sub.targetUserId);
      const filteredPosts = allPosts.filter(post =>
        subscribedUserIds.includes(post.authorId)
      );
      setSubscriptionPosts(filteredPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки постов';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user, subscriptions]);

  // Загружаем посты по подпискам когда авторизованы и есть подписки
  useEffect(() => {
    if (isAuthenticated && user && subscriptions.length > 0) {
      loadSubscriptionPosts();
    }
  }, [isAuthenticated, user, subscriptions.length, loadSubscriptionPosts]);

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Посты по подпискам
          </h1>
          <p className="text-xl text-gray-600">
            Последние посты от пользователей, на которых вы подписаны
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              У вас пока нет подписок
            </h2>
            <p className="text-gray-600 mb-6">
              Подпишитесь на других пользователей, чтобы видеть их посты здесь
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <SubscriptionManager />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Управление подписками
              </h2>
              <SubscriptionManager />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Посты по подпискам ({subscriptionPosts.length})
              </h2>

              {subscriptionPosts.length > 0 ? (
                <div className="space-y-6">
                  {subscriptionPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Пока нет постов от подписок</p>
                  <p className="text-sm mt-2">
                    Возможно, пользователи еще не создали посты или все посты приватные
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
