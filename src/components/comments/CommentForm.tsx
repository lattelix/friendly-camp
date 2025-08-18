'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  onSubmit: (data: { content: string }) => void;
}

interface CommentFormData {
  content: string;
}

export function CommentForm({ postId, onSubmit }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>();

  const handleFormSubmit = async (data: CommentFormData) => {
    if (!data.content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset(); // Очищаем форму после успешной отправки
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <textarea
          {...register('content', {
            required: 'Комментарий не может быть пустым',
            minLength: {
              value: 1,
              message: 'Комментарий должен содержать минимум 1 символ'
            },
            maxLength: {
              value: 1000,
              message: 'Комментарий не может превышать 1000 символов'
            }
          })}
          placeholder="Напишите ваш комментарий..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Максимум 1000 символов
        </span>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          <span>{isSubmitting ? 'Отправка...' : 'Отправить'}</span>
        </button>
      </div>
    </form>
  );
}
