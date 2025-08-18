'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { Home, Plus, User, LogOut, LogIn, UserPlus, Users } from 'lucide-react';

export function Navigation() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Friendly Camp</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/posts/create"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Создать пост</span>
                </Link>

                <Link
                  href="/subscriptions"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <Users size={16} />
                  <span>Подписки</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <User size={16} />
                  <span>{user?.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <LogOut size={16} />
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  <LogIn size={16} />
                  <span>Войти</span>
                </Link>

                <Link
                  href="/auth/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <UserPlus size={16} />
                  <span>Регистрация</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
