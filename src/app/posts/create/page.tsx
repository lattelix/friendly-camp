'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { checkAuth } from '@/store/authSlice';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { Navigation } from '@/components/ui/Navigation';

export default function CreatePostPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Проверяем авторизацию только один раз при монтировании
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Редирект на страницу входа если не авторизованы
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать новый пост</h1>
            <p className="text-gray-600">
              Поделитесь своими мыслями с сообществом
            </p>
          </div>

          <CreatePostForm />
        </div>
      </main>
    </div>
  );
}
