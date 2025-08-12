import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { User, Post } from '../types';
import { UserPlus, UserMinus, Calendar, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await usersAPI.getUser(id!);
      setUser(response.user);
      setRecentPosts(response.recentPosts);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Нет доступа к этому профилю');
      } else {
        toast.error('Ошибка загрузки профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await usersAPI.followUser(id!);
      // Обновляем профиль
      fetchUserProfile();
    } catch (error) {
      toast.error('Ошибка при подписке');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Пользователь не найден</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.firstName}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {user.firstName.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>

              {currentUser && currentUser._id !== user._id && (
                <button
                  onClick={handleFollow}
                  className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {user.isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span>Отписаться</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Подписаться</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-gray-600 mb-2">@{user.username}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>{user.followers} подписчиков</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>{user.following} подписок</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Присоединился {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {user.bio && (
              <p className="text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Последние посты</h2>

        {recentPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            У этого пользователя пока нет постов
          </p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post._id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a
                    href={`/posts/${post._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </a>
                </h3>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.likes} лайков</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
