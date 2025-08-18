'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { checkAuth } from '@/store/authSlice';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Navigation } from '@/components/ui/Navigation';

export default function RegisterPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
            <p className="text-gray-600">
              Создайте новый аккаунт для участия в сообществе
            </p>
          </div>

          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
