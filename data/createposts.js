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
        likes: 0
    }
    const post_info = await post_collection.insertOne(newPost_obj);
    return post_info;
}

export const getAllPosts = async () => {
    const post_collection = await posts();
    let post_list = await post_collection.find({}).toArray();
    if (!post_list) throw "Error: Could not get all products.";
    return post_list;
};

// export function uploadFile() {
//     function convertToBase64(e) {
//         console.log(e);
//         var reader = new FileReader();
//         reader.readAsDataURL(e.target.files[e]);
//         reader.onload = () => {
//             console.log(reader.result);
//         };
//         reader.onerror = error => {
//             console.log(error);
//         };
//     }
//     let output = 
//     <div className="auth-wrapper" > 
//         <div className="auth-inner" style={{width: "auto"}}>
//             Upload File
//             <input
//             accepts="image/*"
//             type="file"
//             onChange={convertToBase64} 
//             />
//         </div>
//     </div>
//     return output;
// }