const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Создание комментария
router.post('/', auth, [
  body('content')
    .notEmpty()
    .withMessage('Содержание комментария обязательно')
    .isLength({ max: 1000 })
    .withMessage('Комментарий не должен превышать 1000 символов'),
  body('postId')
    .notEmpty()
    .withMessage('ID поста обязателен'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Неверный ID родительского комментария')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, postId, parentCommentId } = req.body;

    // Проверяем, существует ли пост
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем права доступа к посту
    if (!post.canView(req.user._id)) {
      return res.status(403).json({ message: 'Нет доступа к этому посту' });
    }

    // Если это ответ на комментарий, проверяем его существование
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Родительский комментарий не найден' });
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Комментарий успешно создан',
      comment: comment.getPublicData()
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение комментариев к посту
router.get('/post/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Проверяем, существует ли пост
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем права доступа к посту
    if (!post.canView(req.user?._id)) {
      return res.status(403).json({ message: 'Нет доступа к этому посту' });
    }

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Comment.countDocuments({ post: postId, parentComment: null });

    res.json({
      comments: comments.map(comment => comment.getPublicData()),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение ответов на комментарий
router.get('/:commentId/replies', optionalAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Проверяем, существует ли родительский комментарий
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверяем права доступа к посту
    const post = await Post.findById(parentComment.post);
    if (!post.canView(req.user?._id)) {
      return res.status(403).json({ message: 'Нет доступа к этому посту' });
    }

    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Comment.countDocuments({ parentComment: commentId });

    res.json({
      replies: replies.map(reply => reply.getPublicData()),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление комментария
router.put('/:id', auth, [
  body('content')
    .notEmpty()
    .withMessage('Содержание комментария обязательно')
    .isLength({ max: 1000 })
    .withMessage('Комментарий не должен превышать 1000 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверяем, что пользователь является автором комментария
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Нет прав для редактирования этого комментария' });
    }

    const { content } = req.body;

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Комментарий успешно обновлен',
      comment: comment.getPublicData()
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление комментария
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверяем, что пользователь является автором комментария или автором поста
    const post = await Post.findById(comment.post);
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();

    if (!isAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Нет прав для удаления этого комментария' });
    }

    // Удаляем все ответы на комментарий
    await Comment.deleteMany({ parentComment: comment._id });

    // Удаляем сам комментарий
    await Comment.findByIdAndDelete(comment._id);

    res.json({ message: 'Комментарий успешно удален' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Лайк/анлайк комментария
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Убираем лайк
      comment.likes.splice(likeIndex, 1);
    } else {
      // Добавляем лайк
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({
      message: likeIndex > -1 ? 'Лайк убран' : 'Комментарий лайкнут',
      likes: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
