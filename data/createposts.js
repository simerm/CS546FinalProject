import { ObjectId } from 'mongodb';
import { posts } from '../config/mongoCollections.js';

export const createPost = async (
    user,
    postTitle,
    file,
    caption
  ) => {
    if (!postTitle) {
        throw "Must provide a post title";
    }
    if (typeof postTitle !== 'string' || typeof caption !== 'string') {
        throw "Must provide a string";
    }
    postTitle = postTitle.trim();
    caption = caption.trim();
    if (postTitle.length < 1 || postTitle.length > 25) {
        throw "Post title must be between 1-25 characters long";
    }
    const post_collection = await posts();

    let isAdminPost;
    if (user.role === 'admin') {
        isAdminPost = true;
    } else {
        isAdminPost = false;
    }

    let newPost_obj = {
        name: user.username,
        title: postTitle,
        file: file,
        caption: caption,
        comments: [],
        likes: 0,
        dislikes:0,
        isAdminPost: isAdminPost,
        dateAdded: new Date(),

    }
    const post_info = await post_collection.insertOne(newPost_obj);
    return post_info;
}

export const getAllPosts = async () => {
    const post_collection = await posts();
    let post_list = await post_collection.find({}).toArray();
    if (!post_list) throw "Error: Could not get all products.";
    post_list.sort((a, b) => b.dateAdded - a.dateAdded);
    return post_list;
};

export const deletePost = async (postId) => {
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: postId });
    if (!post) {
        throw "Post not found";
    }
    const deletionInfo = await postCollection.deleteOne({ _id: postId });
    if (deletionInfo.deletedCount === 0) {
        throw "Failed to delete post";
    }
    return { deleted: true };
}

export const createComment = async (
    comment,
    user,
    postId
  ) => {
    if (!comment) {
        throw "Must provide a comment";
    }
    if (typeof comment !== 'string') {
        throw "Must provide a string";
    }
    comment = comment.trim();
    if (comment.length < 1 || comment.length > 50) {
        throw "Post title must be between 1-50 characters long";
    }
    const post_collection = await posts();

    let newComment_obj = {
        comment: comment,
        user: user.username,
        dateAdded: new Date()
    }
    postId = new ObjectId(postId);
    const comment_info = await post_collection.findOneAndUpdate( { _id : postId },{ $push: { comments: newComment_obj } });
    return comment_info;
}