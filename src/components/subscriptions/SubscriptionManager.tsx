'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setSubscriptions, addSubscription, removeSubscription, addSubscribedUser } from '@/store/subscriptionsSlice';
import { subscriptionsService } from '@/services/apiService';
import { User, Subscription } from '@/types';
import { UserPlus, UserMinus, Users } from 'lucide-react';

export function SubscriptionManager() {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { subscriptions, subscribedUsers } = useSelector((state: RootState) => state.subscriptions);

  useEffect(() => {
    if (user) {
      loadSubscriptions();
      loadAvailableUsers();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const subs = await subscriptionsService.getSubscriptions(user.id);
      dispatch(setSubscriptions(subs));
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    // В реальном приложении здесь был бы API для получения всех пользователей
    // Пока используем моковые данные
    setAvailableUsers([
      { id: '2', username: 'user1', email: 'user1@example.com', createdAt: '2024-01-02T00:00:00Z' },
      { id: '3', username: 'user2', email: 'user2@example.com', createdAt: '2024-01-03T00:00:00Z' },
    ]);
  };

  const handleSubscribe = async (targetUserId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const subscription = await subscriptionsService.subscribe(user.id, targetUserId);
      dispatch(addSubscription(subscription));

      // Добавляем пользователя в список подписок
      const targetUser = availableUsers.find(u => u.id === targetUserId);
      if (targetUser) {
        dispatch(addSubscribedUser(targetUser));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка подписки';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await subscriptionsService.unsubscribe(subscriptionId, user.id);
      dispatch(removeSubscription(subscriptionId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отписки';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (userId: string) => {
    return subscriptions.some(sub => sub.targetUserId === userId);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Мои подписки
        </h3>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {subscribedUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Вы пока ни на кого не подписаны</p>
        ) : (
          <div className="space-y-3">
            {subscribedUsers.map((subUser) => {
              const subscription = subscriptions.find(sub => sub.targetUserId === subUser.id);
              return (
                <div key={subUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {subUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{subUser.username}</p>
                      <p className="text-sm text-gray-500">{subUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => subscription && handleUnsubscribe(subscription.id)}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    <UserMinus size={16} />
                    <span>Отписаться</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Доступные пользователи</h3>

        <div className="space-y-3">
          {availableUsers
            .filter(u => u.id !== user.id && !isSubscribed(u.id))
            .map((availableUser) => (
              <div key={availableUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {availableUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{availableUser.username}</p>
                    <p className="text-sm text-gray-500">{availableUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSubscribe(availableUser.id)}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  <UserPlus size={16} />
                  <span>Подписаться</span>
                </button>
              </div>
            ))}
        </div>

        {availableUsers.filter(u => u.id !== user.id && !isSubscribed(u.id)).length === 0 && (
          <p className="text-gray-500 text-center py-4">Нет доступных пользователей для подписки</p>
        )}
      </div>
    </div>
  );
}
