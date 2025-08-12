import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { User } from '../types';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (role) params.role = role;

      const response = await usersAPI.getUsers(params);
      setUsers(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await usersAPI.followUser(userId);
      // Обновляем список пользователей
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при подписке');
    }
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
      <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все роли</option>
            <option value="parent">Родители</option>
            <option value="child">Дети</option>
            <option value="admin">Администраторы</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((userItem) => (
            <div
              key={userItem._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                {userItem.avatar ? (
                  <img
                    src={userItem.avatar}
                    alt={userItem.firstName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {userItem.firstName.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <Link
                    to={`/users/${userItem._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {userItem.firstName} {userItem.lastName}
                  </Link>
                  <p className="text-sm text-gray-500">@{userItem.username}</p>
                </div>
              </div>

              {userItem.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {userItem.bio}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span>{userItem.followers} подписчиков</span>
                  <span>{userItem.following} подписок</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {userItem.role === 'parent' ? 'Родитель' : userItem.role === 'child' ? 'Ребенок' : 'Админ'}
                </span>
              </div>

              {user && user._id !== userItem._id && (
                <button
                  onClick={() => handleFollow(userItem._id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {userItem.isFollowing ? (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
