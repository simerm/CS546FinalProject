import { ObjectId } from 'mongodb';
import { posts } from '../config/mongoCollections.js';

export const createPost = async (
    user,
    postTitle,
    file,
    rsvp,
    fileSelect,
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
    if (caption.length < 1 || caption.length > 100) {
        throw "Caption must be between 1-00 characters long";
    }
    const post_collection = await posts();

    let isAdminPost;
    if (user.role === 'admin') {
        isAdminPost = true;
    } else {
        isAdminPost = false;
    }

    let isBusinessPost;
    if (user.role === 'business') {
        isBusinessPost = true;
    } else {
        isBusinessPost = false;
    }

    let hasFile;
    if (file) {
        hasFile = true;
    } else {
        hasFile = false;
    }

    let isRsvp;
    if (rsvp === 'Yes') {
        isRsvp = true;
    } else {
        isRsvp = false;
    }

    let isImage = false;
    let isVideo = false;

    if (hasFile) {
        if (fileSelect === 'Image') {
            isImage = true;
        } else {
            isImage = false;
        }
    
        if (fileSelect === 'Video') {
            isVideo = true;
        } else {
            isVideo = false;
        }
    }

    let newPost_obj = {
        name: user.username,
        title: postTitle,
        file: file,
        caption: caption,
        comments: [],
        whoLiked: [],
        whoDisliked: [],
        isRsvp: isRsvp,
        whoRSVP: [],
        isAdminPost: isAdminPost,
        isBusinessPost: isBusinessPost,
        hasFile: hasFile,
        isImage: isImage,
        isVideo, isVideo,
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

export const editPost = async (newCaption, postId) => {
    if (!ObjectId.isValid(postId)) {
        throw "Invalid postId";
    }
    if (newCaption.length === 0) {
        throw "New caption cannot be empty";
    }
    if (newCaption.length < 1 || newCaption.length > 100) {
        throw "New caption must be between 1-00 characters long";
    }
    postId = new ObjectId(postId);
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: postId });
    if (!post) {
        throw "Post not found";
    }
    const edit_info = await postCollection.findOneAndUpdate( { _id : postId },{ $set: { caption: newCaption } }, {returnDocument: 'after'});
    if (!edit_info) {
        throw "Failed to delete post";
    }
    return edit_info;
}

export const deletePost = async (postId) => {
    if (!ObjectId.isValid(postId)) {
        throw "Invalid postId";
    }
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
    if (!ObjectId.isValid(postId)) {
        throw "Invalid postId";
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

// export const incrementLikes = async (user, postId) => {
//     const post_collection = await posts();
//     postId = new ObjectId(postId);
//     const likes = await post_collection.findOneAndUpdate( { _id : postId },{ $push: { whoLiked: user } });
//     return likes;
// }

// export const incrementDislikes = async (user, postId) => {
//     const post_collection = await posts();
//     postId = new ObjectId(postId);
//     const dislikes = await post_collection.findOneAndUpdate( { _id : postId },{ $push: { whoDisliked: user } });
//     return dislikes;
// }

