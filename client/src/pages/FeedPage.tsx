import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { Post } from '../types';
import {
  Calendar,
  User,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchFeed();
  }, [currentPage]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getFeed({
        page: currentPage,
        limit: 10,
      });
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Ошибка загрузки ленты');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Здесь должна быть логика лайка поста
      toast.success('Пост лайкнут!');
    } catch (error) {
      toast.error('Ошибка при лайке поста');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      news: 'Новости',
      activities: 'Активности',
      photos: 'Фото',
      announcements: 'Объявления',
      stories: 'Истории',
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Моя лента</h1>

      {posts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 mb-4">
            В вашей ленте пока нет постов
          </p>
          <p className="text-sm text-gray-400">
            Подпишитесь на других пользователей, чтобы видеть их посты здесь
          </p>
          <Link
            to="/users"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Найти пользователей
          </Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Показано {posts.length} из {total} постов
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryLabel(post.category)}
                      </span>
                      {!post.isPublic && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Приватный
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-3">
                    <Link
                      to={`/posts/${post._id}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* Content */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.substring(0, 200)}...
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author.firstName} {post.author.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </button>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Предыдущая</span>
              </button>

              <span className="px-3 py-2 text-sm text-gray-700">
                Страница {currentPage} из {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Следующая</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
