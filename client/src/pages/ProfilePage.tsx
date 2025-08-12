import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Заполняем форму данными пользователя
  React.useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('bio', user.bio);
      setValue('avatar', user.avatar);
      setValue('isPublic', user.isPublic);
    }
  }, [user, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await usersAPI.updateProfile(data);
      updateUser(response.user);
      toast.success('Профиль успешно обновлен!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка обновления профиля');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Пользователь не найден</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Мой профиль</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL аватара
            </label>
            <input
              {...register('avatar')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя *
              </label>
              <input
                {...register('firstName', {
                  required: 'Имя обязательно',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать минимум 2 символа',
                  },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия *
              </label>
              <input
                {...register('lastName', {
                  required: 'Фамилия обязательна',
                  minLength: {
                    value: 2,
                    message: 'Фамилия должна содержать минимум 2 символа',
                  },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              О себе
            </label>
            <textarea
              {...register('bio', {
                maxLength: {
                  value: 500,
                  message: 'Биография не должна превышать 500 символов',
                },
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Расскажите о себе..."
            />
            {errors.bio && (
              <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                {...register('isPublic')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Публичный профиль</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Информация о профиле</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Имя пользователя:</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Роль:</span>
            <span className="font-medium">
              {user.role === 'parent' ? 'Родитель' : user.role === 'child' ? 'Ребенок' : 'Администратор'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Подписчики:</span>
            <span className="font-medium">{user.followers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Подписки:</span>
            <span className="font-medium">{user.following}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Дата регистрации:</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
