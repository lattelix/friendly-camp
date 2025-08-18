'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { checkAuth } from '@/store/authSlice';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navigation } from '@/components/ui/Navigation';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Проверяем авторизацию только один раз при монтировании
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Редирект на главную если уже авторизованы
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход в систему</h1>
            <p className="text-gray-600">
              Войдите в свой аккаунт для продолжения
            </p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
