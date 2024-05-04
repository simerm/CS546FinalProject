import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { loginUser, registerUser, registerBusiness } from '../data/user.js';
import { createPost, getAllPosts, createComment, deletePost } from '../data/createposts.js';

const db = await dbConnection();
await db.dropDatabase();

try {
    const user = await registerUser("Joey", 
    "Faustino",  
    "jfaustin", 
    "Dajoma141!!!",
    "",
    "light",
    "admin");
    console.log(user);
} catch (e) {
    console.log(e);
}

try {
    const login = await loginUser("graffixnyc", "Dajoma141");
    console.log(login);
} catch (e) {
    console.log(e);
}

console.log("Done seeding database.");

await closeConnection();