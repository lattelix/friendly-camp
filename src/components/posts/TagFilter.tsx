'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { toggleTag, clearTags, setSelectedTags } from '@/store/postsSlice';
import { X } from 'lucide-react';

export function TagFilter() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, selectedTags } = useSelector((state: RootState) => state.posts);

  // Получаем все уникальные теги из постов
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

  const handleTagToggle = (tag: string) => {
    dispatch(toggleTag(tag));
  };

  const handleClearTags = () => {
    dispatch(clearTags());
  };

  const handleSelectAllTags = () => {
    dispatch(setSelectedTags(allTags));
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Фильтр по тегам</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAllTags}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
          >
            Выбрать все
          </button>
          <button
            onClick={handleClearTags}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
          >
            Очистить
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagToggle(tag)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Выбранные теги:</span>
            <button
              onClick={handleClearTags}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Очистить все
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
