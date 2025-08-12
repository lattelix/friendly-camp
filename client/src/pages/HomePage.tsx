import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import { Calendar, User, Tag, Heart, MessageCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await postsAPI.getPosts({ limit: 6 });
        setRecentPosts(response.posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Добро пожаловать в блог лагеря "Дружба"!
          </h1>
          <p className="text-xl mb-6 text-blue-100">
            Здесь родители и дети могут делиться новостями, фотографиями и историями о жизни в лагере.
          </p>
          {!user && (
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Присоединиться
              </Link>
              <Link
                to="/posts"
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Посмотреть посты
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Сообщество</h3>
          <p className="text-gray-600">
            Присоединяйтесь к сообществу родителей и детей лагеря "Дружба"
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Tag className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Теги и категории</h3>
          <p className="text-gray-600">
            Организуйте контент с помощью тегов и категорий для легкого поиска
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Комментарии</h3>
          <p className="text-gray-600">
            Общайтесь с другими участниками через комментарии к постам
          </p>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Последние посты</h2>
          <Link
            to="/posts"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Посмотреть все →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">Пока нет постов. Будьте первым!</p>
            {user && (
              <Link
                to="/create-post"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Создать пост
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
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
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryLabel(post.category)}
                    </span>
                    {!post.isPublic && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Приватный
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    <Link
                      to={`/posts/${post._id}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.substring(0, 150)}...
                  </p>

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

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>

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
        )}
      </div>
    </div>
  );
};

export default HomePage;
