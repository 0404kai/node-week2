const mongoose = require('mongoose');
const postSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'title 未填寫']
      },
    }, { versionKey: false }
);
const Post = mongoose.model('posts', postSchema);

module.exports = Post;