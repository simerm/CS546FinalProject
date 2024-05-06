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

try { //create an admin
    const user = await registerUser("Simerjeet", 
    "Mudhar",  
    "simmer_m", 
    "Hello!123",
    "admin");

    console.log(user);
} catch(e){
    console.log(e);
}

try { //create a 2nd admin
    const user = await registerUser("Danica", 
    "Lacuesta",  
    "ms_fast", 
    "pagenT%24",
    "admin");

    console.log(user);
} catch(e){
    console.log(e);
}

try { //create a business account
    const user = await registerBusiness("Stevens Institute of Technology",  
    "+17328483904", 
    "12-3456789",
    "1 Castle Point Terrace",
    "Hoboken",
    "NJ",
    "07030",
    "sit_official",
    "#Ilovefigurines27");

    console.log(user);
} catch(e){
    console.log(e);
}

try { //create a 2nd business account
    const user = await registerBusiness("Anime",  
    "+18489934590", 
    "11-0987654",
    "328 E 9th St",
    "New York City",
    "NY",
    "10003",
    "theAnime",
    "Forever@34");

    console.log(user);
} catch(e){
    console.log(e);
}

//personal post
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
        false,
        "2024-05-06T21:46:37.350+00:00"
    )
    console.log(post);
} catch (e) {
    console.log(e);
}

//business post


//admin post
try {
    const post = await createPost(
        "ms_fast",
        "Favorite Smiski",
        null,
        "I went to Japan, look at my smiski",
        [],
        [],
        [],
        false,
        [],
        true,
        false,
        false,
        false,
        false,
        "2024-05-04T23:17:38.759+00:00"
    )
    console.log(post);
} catch (e) {
    console.log(e);
}



console.log("Done seeding database.");

await closeConnection();
