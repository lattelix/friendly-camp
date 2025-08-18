'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Lock, Unlock, UserCheck } from 'lucide-react';

interface PrivatePostAccessProps {
  postId: string;
  authorId: string;
  authorUsername: string;
  onRequestAccess: (postId: string) => void;
}

export function PrivatePostAccess({ postId, authorId, authorUsername, onRequestAccess }: PrivatePostAccessProps) {
  const [isRequested, setIsRequested] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAuthor = user?.id === authorId;

  const handleRequestAccess = () => {
    if (!user) {
      alert('Необходимо войти в систему для запроса доступа');
      return;
    }

    onRequestAccess(postId);
    setIsRequested(true);
  };

  if (isAuthor) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <Unlock size={16} />
          <span className="font-medium">Это ваш приватный пост</span>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Только вы можете видеть этот пост. Другие пользователи должны запросить доступ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 text-orange-800 mb-2">
        <Lock size={16} />
        <span className="font-medium">Приватный пост</span>
      </div>
      <p className="text-orange-700 text-sm mb-3">
        Этот пост доступен только по запросу автора.
        Автор: <span className="font-medium">{authorUsername}</span>
      </p>

      {!isRequested ? (
        <button
          onClick={handleRequestAccess}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <UserCheck size={16} />
          <span>Запросить доступ</span>
        </button>
      ) : (
        <div className="flex items-center space-x-2 text-orange-700">
          <UserCheck size={16} />
          <span className="text-sm">Запрос отправлен. Ожидайте ответа автора.</span>
        </div>
      )}
    </div>
  );
}
