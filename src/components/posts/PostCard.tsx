'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { Heart, MessageCircle, Share, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentList } from '@/components/comments/CommentList';
import { PrivatePostAccess } from '@/components/posts/PrivatePostAccess';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { likesService } from '@/services/apiService';
import { addComment } from '@/store/commentsSlice';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onRequestAccess?: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment, onShare, onEdit, onDelete, onRequestAccess }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { comments } = useSelector((state: RootState) => state.comments);
  const dispatch = useDispatch<AppDispatch>();
  const isAuthor = user?.id === post.authorId;

  // Получаем комментарии для этого поста
  const postComments = comments[post.id] || [];

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, post.id]);

  const checkIfLiked = async () => {
    if (!user) return;
    try {
      const liked = await likesService.isLikedByUser(post.id, user.id);
      setIsLiked(liked);
    } catch (error) {
      console.error('Ошибка проверки лайка:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !isAuthenticated) {
      alert('Необходимо войти в систему для лайков');
      return;
    }

    setLoading(true);
    try {
      const result = await likesService.toggleLike(post.id, user.id);
      setLikesCount(result.likesCount);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Ошибка лайка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      alert('Необходимо войти в систему для комментирования');
      return;
    }
    setShowCommentForm(!showCommentForm);
    setShowComments(true);
  };

  const handleCommentSubmit = async (data: { content: string }) => {
    if (!user) return;

    try {
      // Создаем новый комментарий
      const newComment = {
        id: Date.now().toString(),
        content: data.content,
        authorId: user.id,
        author: user,
        postId: post.id,
        createdAt: new Date().toISOString()
      };

      // Добавляем в Redux
      dispatch(addComment(newComment));
      setShowCommentForm(false);
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

  const handleRequestAccess = (postId: string) => {
    if (onRequestAccess) {
      onRequestAccess(postId);
    } else {
      console.log('Запрос доступа к посту:', postId);
    }
  };

  // Если пост приватный и пользователь не автор, показываем запрос доступа
  if (post.isPublic === 'private' && !isAuthor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{post.author.username}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            По запросу
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">{post.title}</h2>

        <PrivatePostAccess
          postId={post.id}
          authorId={post.authorId}
          authorUsername={post.author.username}
          onRequestAccess={handleRequestAccess}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {post.author.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{post.author.username}</h3>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthor && (
            <>
              <button
                onClick={() => onEdit?.(post)}
                className="text-gray-400 hover:text-blue-600 p-1"
                title="Редактировать"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete?.(post.id)}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
        <span className={`px-2 py-1 text-xs rounded-full ${
          post.isPublic === 'public'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {post.isPublic === 'public' ? 'Публичный' : 'По запросу'}
        </span>
      </div>
      <p className="text-gray-700 mb-4">{post.content}</p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleCommentClick}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
          >
            <MessageCircle size={20} />
            <span>Комментировать ({postComments.length})</span>
          </button>
        </div>
        <button
          onClick={handleShare}
          className="text-gray-500 hover:text-gray-700"
          title="Поделиться"
        >
          <Share size={20} />
        </button>
      </div>

      {/* Комментарии */}
      {showComments && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Комментарии</h3>

          {showCommentForm && (
            <div className="mb-4">
              <CommentForm
                postId={post.id}
                onSubmit={handleCommentSubmit}
              />
            </div>
          )}

          <CommentList
            comments={postComments}
            currentUserId={user?.id}
            onEdit={(commentId) => console.log('Редактировать комментарий:', commentId)}
            onDelete={(commentId) => console.log('Удалить комментарий:', commentId)}
          />
        </div>
      )}
    </div>
  );
}
