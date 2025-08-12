const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Создание нового поста
router.post('/', auth, [
  body('title')
    .notEmpty()
    .withMessage('Заголовок обязателен')
    .isLength({ max: 200 })
    .withMessage('Заголовок не должен превышать 200 символов'),
  body('content')
    .notEmpty()
    .withMessage('Содержание поста обязательно')
    .isLength({ max: 10000 })
    .withMessage('Содержание не должно превышать 10000 символов'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic должно быть булевым значением'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate должно быть булевым значением'),
  body('allowedUsers')
    .optional()
    .isArray()
    .withMessage('allowedUsers должно быть массивом'),
  body('category')
    .optional()
    .isIn(['news', 'activities', 'photos', 'announcements', 'stories'])
    .withMessage('Неверная категория')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      tags = [],
      isPublic = true,
      isPrivate = false,
      allowedUsers = [],
      category = 'news',
      image = ''
    } = req.body;

    const post = new Post({
      title,
      content,
      author: req.user._id,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      isPublic,
      isPrivate,
      allowedUsers,
      category,
      image
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Пост успешно создан',
      post: post.getPublicData()
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех постов (с фильтрацией)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};

    // Фильтрация по видимости
    if (req.user) {
      // Авторизованный пользователь видит свои посты и публичные
      query.$or = [
        { isPublic: true },
        { author: req.user._id },
        { isPrivate: true, allowedUsers: req.user._id }
      ];
    } else {
      // Неавторизованный пользователь видит только публичные посты
      query.isPublic = true;
    }

    // Фильтрация по категории
    if (category) {
      query.category = category;
    }

    // Фильтрация по тегам
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Фильтрация по автору
    if (author) {
      query.author = author;
    }

    // Поиск по тексту
    if (search) {
      query.$text = { $search: search };
    }

    // Сортировка
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { 'likes.length': -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts: posts.map(post => post.getPublicData()),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение поста по ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем права доступа
    if (!post.canView(req.user?._id)) {
      return res.status(403).json({ message: 'Нет доступа к этому посту' });
    }

    res.json({
      post: post.getPublicData()
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление поста
router.put('/:id', auth, [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Заголовок не может быть пустым')
    .isLength({ max: 200 })
    .withMessage('Заголовок не должен превышать 200 символов'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Содержание не может быть пустым')
    .isLength({ max: 10000 })
    .withMessage('Содержание не должно превышать 10000 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем, что пользователь является автором поста
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав для редактирования этого поста' });
    }

    const updateData = { ...req.body };
    if (updateData.tags) {
      updateData.tags = updateData.tags.map(tag => tag.toLowerCase().trim());
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Пост успешно обновлен',
      post: updatedPost.getPublicData()
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление поста
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем, что пользователь является автором поста
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав для удаления этого поста' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Пост успешно удален' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Лайк/анлайк поста
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Убираем лайк
      post.likes.splice(likeIndex, 1);
    } else {
      // Добавляем лайк
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Лайк убран' : 'Пост лайкнут',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение популярных тегов
router.get('/tags/popular', async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ tags });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
