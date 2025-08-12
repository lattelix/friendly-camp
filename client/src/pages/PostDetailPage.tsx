import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';
import { Post, Comment } from '../types';
import {
  Calendar,
  User,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id!);
      setPost(response.post);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Нет доступа к этому посту');
        navigate('/posts');
      } else {
        toast.error('Ошибка загрузки поста');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments(id!);
      setComments(response.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await postsAPI.likePost(id!);
      setPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      toast.success('Пост лайкнут!');
    } catch (error) {
      toast.error('Ошибка при лайке поста');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Комментарий не может быть пустым');
      return;
    }

    setIsSubmitting(true);
    try {
      await commentsAPI.createComment({
        content: commentContent,
        postId: id!,
      });
      setCommentContent('');
      fetchComments();
      toast.success('Комментарий добавлен!');
    } catch (error) {
      toast.error('Ошибка при добавлении комментария');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    try {
      await postsAPI.deletePost(id!);
      toast.success('Пост удален');
      navigate('/posts');
    } catch (error) {
      toast.error('Ошибка при удалении поста');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      news: 'Новости',
      activities: 'Активности',
      photos: 'Фото',
      announcements: 'Объявления',
      stories: 'Истории',
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Пост не найден</h2>
        <Link
          to="/posts"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Вернуться к постам
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/posts"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Назад к постам</span>
        </Link>
      </div>

      {/* Post */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getCategoryLabel(post.category)}
              </span>
              {!post.isPublic && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Приватный
                </span>
              )}
            </div>

            {user && post.author._id === user._id && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/posts/${post._id}/edit`}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">Редактировать</span>
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Удалить</span>
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{post.author.firstName} {post.author.lastName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Теги:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Комментарии ({comments.length})
        </h2>

        {/* Add Comment */}
        {user && (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="mb-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Написать комментарий..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !commentContent.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
            </button>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Пока нет комментариев. Будьте первым!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.author.firstName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400">(редактировано)</span>
                      )}
                    </div>

                    <p className="text-gray-700">{comment.content}</p>

                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="h-3 w-3" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        Ответить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
