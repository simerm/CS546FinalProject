import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { loginUser, registerUser, registerBusiness } from '../data/user.js';
import { createPost, getAllPosts, createComment, deletePost } from '../data/createposts.js';

const db = await dbConnection();
await db.dropDatabase();

try { //create a normal user
    const user = await registerUser("Joey", 
    "Faustino",  
    "jfaustin", 
    "Dajoma141!!!",
    "",
    {role: "personal", 
    favoriteFigurine: "Morning Glory",
    wishlist: ["Looking Back", "Hiding"],
    friends: ["pat_hill"],
    location: "NYC",
    picture: "lion"});

    console.log(user);
} catch (e) {
    console.log(e);
}

try { //create a 2nd normal user
    const user = await registerUser("Patrick", 
    "Hill",  
    "pat_hill", 
    "Pandas12!",
    "",
    {role: "personal", 
    favoriteFigurine: "Bok Choy",
    friends: ["jfaustin"],
    picture: "cat"});

    console.log(user);
} catch (e) {
    console.log(e);
}


console.log("Done seeding database.");

await closeConnection();