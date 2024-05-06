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
    "personal")

    console.log(user);
} catch (e) {
    console.log(e);
}

try { //create a 2nd normal user
    const user = await registerUser("Patrick", 
    "Hill",  
    "pat_hill", 
    "Pandas12!",
    "personal");

    console.log(user);
} catch(e){
    console.log(e);
}

try {
    const post = await createPost(
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
    console.log(post);
} catch (e) {
    console.log(e);
}



console.log("Done seeding database.");

await closeConnection();
