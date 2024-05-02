import { posts } from '../config/mongoCollections.js';
export const create = async (
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
        likes: 0
    }
    const post_info = await post_collection.insertOne(newPost_obj);
    return post_info;
}