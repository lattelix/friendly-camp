'use client';

import { Comment } from '@/types';
import { Edit, Trash2, MessageCircle } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentList({ comments, currentUserId, onEdit, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>Пока нет комментариев</p>
        <p className="text-sm mt-1">Будьте первым, кто оставит комментарий!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isAuthor = currentUserId === comment.authorId;

        return (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-sm font-medium">
                  {comment.author.username.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.author.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isAuthor && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEdit?.(comment.id)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Редактировать"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete?.(comment.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
