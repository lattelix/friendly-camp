const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['news', 'activities', 'photos', 'announcements', 'stories'],
    default: 'news'
  }
}, {
  timestamps: true
});

// Index for better search performance
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Method to check if user can view the post
postSchema.methods.canView = function(userId) {
  if (this.isPublic) return true;
  if (this.author.toString() === userId.toString()) return true;
  if (this.isPrivate && this.allowedUsers.includes(userId)) return true;
  return false;
};

// Method to get public post data
postSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    title: this.title,
    content: this.content,
    author: this.author,
    tags: this.tags,
    isPublic: this.isPublic,
    isPrivate: this.isPrivate,
    likes: this.likes.length,
    image: this.image,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Post', postSchema);
