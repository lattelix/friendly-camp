import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Здесь будет логика для добавления токена авторизации
      return headers;
    },
  }),
  tagTypes: ['Post', 'User', 'Comment', 'Subscription'],
  endpoints: (builder) => ({
    // Пока оставим пустым, добавим позже
  }),
});
