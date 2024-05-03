import { posts } from '../config/mongoCollections.js';
import React, { useState } from 'react';

export const createPost = async (
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

    let newPost_obj = {
        title: postTitle,
        file: file,
        caption: caption,
        comments: [],
        likes: 0,
        dislikes:0,
        dateAdded: new Date()
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

    // Check if the post exists
    const post = await postCollection.findOne({ _id: postId });
    if (!post) {
        throw "Post not found";
    }

    // Delete the post
    const deletionInfo = await postCollection.deleteOne({ _id: postId });
    if (deletionInfo.deletedCount === 0) {
        throw "Failed to delete post";
    }

    return { deleted: true };
}
