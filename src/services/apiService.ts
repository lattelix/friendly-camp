import { User, Post, Comment, Subscription } from '@/types';

// Временные данные для демонстрации
// eslint-disable-next-line prefer-const
let users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    createdAt: '2024-01-02T00:00:00Z'
  }
];

// eslint-disable-next-line prefer-const
let posts: Post[] = [
  {
    id: '1',
    title: 'Добро пожаловать в Friendly Camp!',
    content: 'Это первый пост в нашем блоге. Здесь вы можете делиться своими мыслями, опытом и идеями с другими участниками сообщества.',
    authorId: '1',
    author: users[0],
    isPublic: 'public',
    tags: ['приветствие', 'блог'],
    likes: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Как создать свой первый пост',
    content: 'Создание постов в нашем блоге очень простое. Просто нажмите кнопку "Создать пост" и заполните необходимые поля.',
    authorId: '1',
    author: users[0],
    isPublic: 'public',
    tags: ['руководство', 'посты'],
    likes: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// eslint-disable-next-line prefer-const
let comments: Comment[] = [];
// eslint-disable-next-line prefer-const
let subscriptions: Subscription[] = [];

// Генерация ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Функции для работы с моковыми данными
export const addMockUser = (user: User) => {
  // Проверяем, не существует ли уже пользователь с таким ID
  if (!users.find(u => u.id === user.id)) {
    users.push(user);
  }
};

export const addMockPost = (post: Post) => {
  posts.unshift(post);
};

export const addMockComment = (comment: Comment) => {
  comments.unshift(comment);
};

export const addMockSubscription = (subscription: Subscription) => {
  subscriptions.push(subscription);
};

export const removeMockPost = (postId: string) => {
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    posts.splice(index, 1);
  }
};

export const removeMockComment = (commentId: string) => {
  const index = comments.findIndex(c => c.id === commentId);
  if (index !== -1) {
    comments.splice(index, 1);
  }
};

export const removeMockSubscription = (subscriptionId: string) => {
  const index = subscriptions.findIndex(s => s.id === subscriptionId);
  if (index !== -1) {
    subscriptions.splice(index, 1);
  }
};

// Аутентификация
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // В реальном приложении здесь была бы проверка пароля
    if (password.length < 6) {
      throw new Error('Неверный пароль');
    }

    const token = generateId();
    return { user, token };
  },

  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (users.find(u => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    if (users.find(u => u.username === username)) {
      throw new Error('Пользователь с таким именем уже существует');
    }

    const newUser: User = {
      id: generateId(),
      username,
      email,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    const token = generateId();
    return { user: newUser, token };
  }
};

// Посты
export const postsService = {
  async getPosts(): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return posts.filter(post => post.isPublic === 'public');
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return posts.filter(post => post.authorId === userId);
  },

  async createPost(postData: Omit<Post, 'id' | 'author' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ищем пользователя в моковых данных
    let author = users.find(u => u.id === userId);

    // Если пользователь не найден в моковых данных, создаем его
    if (!author) {
      // Это может произойти, если пользователь был зарегистрирован через Redux
      // но не добавлен в моковые данные
      console.warn('Пользователь не найден в моковых данных, создаем временного пользователя');
      author = {
        id: userId,
        username: 'Unknown User',
        email: 'unknown@example.com',
        createdAt: new Date().toISOString()
      };
      addMockUser(author);
    }

    const newPost: Post = {
      id: generateId(),
      ...postData,
      authorId: userId,
      author,
      likes: [], // Добавляем пустой массив лайков
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addMockPost(newPost);
    return newPost;
  },

  async updatePost(postId: string, updates: Partial<Post>, userId: string): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Пост не найден');
    }

    if (posts[postIndex].authorId !== userId) {
      throw new Error('Нет прав для редактирования этого поста');
    }

    const updatedPost = {
      ...posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    posts[postIndex] = updatedPost;
    return updatedPost;
  },

  async deletePost(postId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      throw new Error('Пост не найден');
    }

    if (posts[postIndex].authorId !== userId) {
      throw new Error('Нет прав для удаления этого поста');
    }

    removeMockPost(postId);
  }
};

// Комментарии
export const commentsService = {
  async getComments(postId: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return comments.filter(c => c.postId === postId);
  },

  async createComment(content: string, postId: string, userId: string): Promise<Comment> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const author = users.find(u => u.id === userId);
    if (!author) {
      throw new Error('Пользователь не найден');
    }

    const newComment: Comment = {
      id: generateId(),
      content,
      authorId: userId,
      author,
      postId,
      createdAt: new Date().toISOString()
    };

    addMockComment(newComment);
    return newComment;
  },

  async updateComment(commentId: string, content: string, userId: string): Promise<Comment> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Комментарий не найден');
    }

    if (comments[commentIndex].authorId !== userId) {
      throw new Error('Нет прав для редактирования этого комментария');
    }

    comments[commentIndex].content = content;
    return comments[commentIndex];
  },

  async deleteComment(commentId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Комментарий не найден');
    }

    if (comments[commentIndex].authorId !== userId) {
      throw new Error('Нет прав для удаления этого комментария');
    }

    removeMockComment(commentId);
  }
};

// Подписки
export const subscriptionsService = {
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return subscriptions.filter(sub => sub.subscriberId === userId);
  },

  async subscribe(subscriberId: string, targetUserId: string): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (subscriberId === targetUserId) {
      throw new Error('Нельзя подписаться на самого себя');
    }

    const existingSubscription = subscriptions.find(
      sub => sub.subscriberId === subscriberId && sub.targetUserId === targetUserId
    );

    if (existingSubscription) {
      throw new Error('Вы уже подписаны на этого пользователя');
    }

    const newSubscription: Subscription = {
      id: generateId(),
      subscriberId,
      targetUserId,
      createdAt: new Date().toISOString()
    };

    addMockSubscription(newSubscription);
    return newSubscription;
  },

  async unsubscribe(subscriptionId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const subscriptionIndex = subscriptions.findIndex(
      sub => sub.id === subscriptionId && sub.subscriberId === userId
    );

    if (subscriptionIndex === -1) {
      throw new Error('Подписка не найдена');
    }

    removeMockSubscription(subscriptionId);
  }
};

// Лайки
export const likesService = {
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const post = posts.find(p => p.id === postId);
    if (!post) {
      throw new Error('Пост не найден');
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Добавляем лайк
      post.likes.push(userId);
      return { liked: true, likesCount: post.likes.length };
    } else {
      // Убираем лайк
      post.likes.splice(likeIndex, 1);
      return { liked: false, likesCount: post.likes.length };
    }
  },

  async getLikesCount(postId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const post = posts.find(p => p.id === postId);
    return post ? post.likes.length : 0;
  },

  async isLikedByUser(postId: string, userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const post = posts.find(p => p.id === postId);
    return post ? post.likes.includes(userId) : false;
  }
};
