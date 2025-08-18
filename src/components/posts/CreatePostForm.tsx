'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { addPost } from '@/store/postsSlice';
import { postsService } from '@/services/apiService';
import { X } from 'lucide-react';

interface CreatePostFormData {
  title: string;
  content: string;
  isPublic: 'public' | 'private';
  tags: string[];
}

export function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreatePostFormData>({
    defaultValues: {
      isPublic: 'public' as const,
      tags: []
    }
  });

  const tags = watch('tags');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (!user) {
      alert('Необходимо войти в систему');
      return;
    }

    setIsLoading(true);

    try {
      const newPost = await postsService.createPost(data, user.id);
      dispatch(addPost(newPost));
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при создании поста';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Заголовок
        </label>
        <input
          {...register('title', { required: 'Заголовок обязателен' })}
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Содержание
        </label>
        <textarea
          {...register('content', { required: 'Содержание обязательно' })}
          id="content"
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              {...register('isPublic')}
              type="radio"
              value="public"
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Публичный пост</span>
          </label>
          <label className="flex items-center">
            <input
              {...register('isPublic')}
              type="radio"
              value="private"
              className="mr-2"
            />
            <span className="text-sm text-gray-700">По запросу</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Теги
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Добавить тег"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Создание...' : 'Создать пост'}
      </button>
    </form>
  );
}
