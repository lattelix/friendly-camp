const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Получение списка пользователей
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};

    // Фильтрация по видимости профиля
    if (req.user) {
      query.$or = [
        { isPublic: true },
        { _id: req.user._id },
        { followers: req.user._id }
      ];
    } else {
      query.isPublic = true;
    }

    // Поиск по имени пользователя или имени
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Фильтрация по роли
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('username firstName lastName role avatar bio followers following isPublic createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => ({
        ...user.toObject(),
        followers: user.followers.length,
        following: user.following.length
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение профиля пользователя
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username firstName lastName role avatar bio followers following isPublic createdAt');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем права доступа к профилю
    if (!user.isPublic && (!req.user || (req.user._id.toString() !== user._id.toString() && !user.followers.includes(req.user._id)))) {
      return res.status(403).json({ message: 'Нет доступа к этому профилю' });
    }

    // Получаем посты пользователя
    const postsQuery = { author: user._id };

    if (req.user) {
      postsQuery.$or = [
        { isPublic: true },
        { author: req.user._id },
        { isPrivate: true, allowedUsers: req.user._id }
      ];
    } else {
      postsQuery.isPublic = true;
    }

    const posts = await Post.find(postsQuery)
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const isFollowing = req.user ? user.followers.includes(req.user._id) : false;

    res.json({
      user: {
        ...user.toObject(),
        followers: user.followers.length,
        following: user.following.length,
        isFollowing
      },
      recentPosts: posts.map(post => post.getPublicData())
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Подписка на пользователя
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
    }

    const isFollowing = targetUser.followers.includes(req.user._id);

    if (isFollowing) {
      // Отписываемся
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user._id.toString());
      req.user.following = req.user.following.filter(id => id.toString() !== targetUser._id.toString());
    } else {
      // Подписываемся
      targetUser.followers.push(req.user._id);
      req.user.following.push(targetUser._id);
    }

    await targetUser.save();
    await req.user.save();

    res.json({
      message: isFollowing ? 'Отписка выполнена' : 'Подписка выполнена',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение ленты постов на основе подписок
router.get('/feed/posts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Получаем ID пользователей, на которых подписан текущий пользователь
    const followingIds = req.user.following;

    const query = {
      $or: [
        { author: { $in: followingIds } },
        { author: req.user._id }
      ],
      $or: [
        { isPublic: true },
        { author: req.user._id },
        { isPrivate: true, allowedUsers: req.user._id }
      ]
    };

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
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
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля пользователя
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar, isPublic } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('username firstName lastName role avatar bio followers following isPublic createdAt');

    res.json({
      message: 'Профиль успешно обновлен',
      user: {
        ...updatedUser.toObject(),
        followers: updatedUser.followers.length,
        following: updatedUser.following.length
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение подписчиков пользователя
router.get('/:id/followers', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username firstName lastName avatar role');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем права доступа
    if (!user.isPublic && (!req.user || (req.user._id.toString() !== user._id.toString() && !user.followers.includes(req.user._id)))) {
      return res.status(403).json({ message: 'Нет доступа к этому профилю' });
    }

    res.json({
      followers: user.followers.map(follower => ({
        ...follower.toObject(),
        followers: follower.followers.length,
        following: follower.following.length
      }))
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение подписок пользователя
router.get('/:id/following', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName avatar role');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем права доступа
    if (!user.isPublic && (!req.user || (req.user._id.toString() !== user._id.toString() && !user.followers.includes(req.user._id)))) {
      return res.status(403).json({ message: 'Нет доступа к этому профилю' });
    }

    res.json({
      following: user.following.map(following => ({
        ...following.toObject(),
        followers: following.followers.length,
        following: following.following.length
      }))
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
