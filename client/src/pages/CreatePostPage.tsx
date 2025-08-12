import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { postsAPI } from '../services/api';
import { CreatePostForm } from '../types';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePostForm>();

  const watchedContent = watch('content', '');
  const watchedTitle = watch('title', '');

  const categories = [
    { value: 'news', label: 'Новости' },
    { value: 'activities', label: 'Активности' },
    { value: 'photos', label: 'Фото' },
    { value: 'announcements', label: 'Объявления' },
    { value: 'stories', label: 'Истории' },
  ];

  const onSubmit = async (data: CreatePostForm) => {
    setIsLoading(true);
    try {
      const postData = {
        ...data,
        tags,
        isPublic: data.isPublic ?? true,
        isPrivate: data.isPrivate ?? false,
      };

      await postsAPI.createPost(postData);
      toast.success('Пост успешно создан!');
      navigate('/posts');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка создания поста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Создать пост</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {showPreview ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPreview ? 'Скрыть' : 'Предпросмотр'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                {...register('title', {
                  required: 'Заголовок обязателен',
                  maxLength: {
                    value: 200,
                    message: 'Заголовок не должен превышать 200 символов',
                  },
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите заголовок поста"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                {...register('category', { required: 'Выберите категорию' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание *
              </label>
              <textarea
                {...register('content', {
                  required: 'Содержание обязательно',
                  maxLength: {
                    value: 10000,
                    message: 'Содержание не должно превышать 10000 символов',
                  },
                })}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Напишите содержание поста..."
              />
              {errors.content && (
                <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL изображения (необязательно)
              </label>
              <input
                {...register('image')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Добавить тег"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Создание...' : 'Создать пост'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visibility Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Настройки видимости</h3>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Публичный пост</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('isPrivate')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Приватный пост (только по запросу)</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Предпросмотр</h3>

              {watchedTitle && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{watchedTitle}</h2>
                </div>
              )}

              {watchedContent && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{watchedContent}</p>
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Советы</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Используйте теги для лучшей организации контента</li>
              <li>• Добавляйте изображения для привлечения внимания</li>
              <li>• Выбирайте подходящую категорию для вашего поста</li>
              <li>• Приватные посты видны только выбранным пользователям</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
