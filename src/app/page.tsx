'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setPosts, setLoading, setError, deletePost } from '@/store/postsSlice';
import { checkAuth } from '@/store/authSlice';
import { postsService } from '@/services/apiService';
import { Navigation } from '@/components/ui/Navigation';
import { PostCard } from '@/components/posts/PostCard';
import { TagFilter } from '@/components/posts/TagFilter';
import { EditPostForm } from '@/components/posts/EditPostForm';
import { Post } from '@/types';

export default function HomePage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { posts, loading, error, selectedTags } = useSelector((state: RootState) => state.posts);

  // Проверяем авторизацию только один раз при монтировании
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const loadPosts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const postsData = await postsService.getPosts();
      dispatch(setPosts(postsData));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки постов';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Загружаем посты только один раз при монтировании
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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

  // Фильтрация постов по выбранным тегам
  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => selectedTags.some(tag => post.tags.includes(tag)))
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка постов...</p>
          </div>
        </main>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать в Friendly Camp
          </h1>
          <p className="text-xl text-gray-600">
            Место, где можно делиться своими мыслями и находить единомышленников
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Фильтр по тегам */}
        <TagFilter />

        {/* Информация о фильтрации */}
        {selectedTags.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Показано {filteredPosts.length} постов с тегами: {selectedTags.join(', ')}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {filteredPosts.map((post) => (
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

        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            {selectedTags.length > 0 ? (
              <div>
                <p className="text-gray-500 text-lg mb-2">
                  Постов с выбранными тегами не найдено
                </p>
                <p className="text-gray-400">
                  Попробуйте изменить фильтр или создать новый пост
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-lg">
                Пока нет постов. Будьте первым, кто поделится своими мыслями!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
