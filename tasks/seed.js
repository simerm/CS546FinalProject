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
    const user = await createPost(
        "jfaustin",
        "Joey's Event",
        null,
        "At 3pm I am trading Smiskis at Mitsuwa",
        [],
        [],
        [],
        true,
        [],
        false,
        false,
        false,
        false,
        "2024-05-06T21:46:37.350+00:00"
    )
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