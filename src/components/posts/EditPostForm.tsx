'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/store/store';
import { updatePost } from '@/store/postsSlice';
import { postsService } from '@/services/apiService';
import { Post } from '@/types';
import { X } from 'lucide-react';

interface EditPostFormProps {
  post: Post;
  onCancel: () => void;
}

interface EditPostFormData {
  title: string;
  content: string;
  isPublic: 'public' | 'private';
  tags: string[];
}

export function EditPostForm({ post, onCancel }: EditPostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<EditPostFormData>({
    defaultValues: {
      title: post.title,
      content: post.content,
      isPublic: post.isPublic,
      tags: [...post.tags]
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

  const onSubmit = async (data: EditPostFormData) => {
    setIsLoading(true);

    try {
      const updatedPost = await postsService.updatePost(post.id, data, post.authorId);
      dispatch(updatePost(updatedPost));
      onCancel();
      router.push('/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при обновлении поста';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Редактировать пост</h2>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

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

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
