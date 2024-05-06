import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import { loginUser, registerUser, registerBusiness, addCollection, addWishlist, addTrade } from '../data/user.js';
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

// Adding to jfaustin's collection
try {
    // Adding full Bed series to jfaustin
    await addCollection("jfaustin", "Smiski", "Bed", "Before Rest");
    await addCollection("jfaustin", "Smiski", "Bed", "Sleepy");
    await addCollection("jfaustin", "Smiski", "Bed", "Co-Sleeping");
    await addCollection("jfaustin", "Smiski", "Bed", "Reading");
    await addCollection("jfaustin", "Smiski", "Bed", "At Sleep");
    await addCollection("jfaustin", "Smiski", "Bed", "Fussing");
    await addCollection("jfaustin", "Smiski", "Bed", "Crescent");

    // Adding full Vegetable series to jfaustin
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Carrot");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Tomato");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Garlic");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Zucchini");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Onion");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Radish");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Green Pepper");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Eggplant");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Bok Choy");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Corn");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Cauliflower");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Cabbage");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Shiitake");
    await addCollection("jfaustin", "Sonny Angel", "Vegetable", "Vegtable Robbie");
    
    // Adding random figurines to jfaustin
    await addCollection("jfaustin", "Sonny Angel", "Marine", "Shark");
    await addCollection("jfaustin", "Sonny Angel", "Marine", "Seahorse");
    await addCollection("jfaustin", "Sonny Angel", "Marine", "Penguin");

    await addCollection("jfaustin", "Smiski", "Series 1", "Hugging Knees");
    await addCollection("jfaustin", "Smiski", "Series 1", "Lounging");
    await addCollection("jfaustin", "Smiski", "Series 1", "Scream");
    
    await addCollection("jfaustin", "Smiski", "Museum", "Velazquez");
    const lastPop = await addCollection("jfaustin", "Smiski", "Museum", "Tutankhamen");

    console.log(lastPop);
} catch (e) {
    console.log(e);
}

// Adding to jfaustin's wishlist
try {
    await addWishlist("jfaustin", "Sonny Angel", "Marine", "Blowfish");
    await addWishlist("jfaustin", "Sonny Angel", "Marine", "Marine Robbie");
    await addWishlist("jfaustin", "Sonny Angel", "Flower", "Sunflower");

    const lastPop = await addWishlist("jfaustin", "Smiski", "Series 1", "Peeking");
    console.log(lastPop);
} catch (e) {
    console.log(e);
}

// Adding to jfaustin's trades
try {
    await addTrade("jfaustin", "Sonny Angel", "Marine", "Seahorse");
    await addTrade("jfaustin", "Sonny Angel", "Marine", "Shark");
    await addTrade("jfaustin", "Sonny Angel", "Vegetable", "Bok Choy");

    await addTrade("jfaustin", "Smiski", "Bed", "Fussing");

    const lastPop = await addTrade("jfaustin", "Smiski", "Series 1", "Hugging Knees");
    console.log(lastPop);
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
    "admin")

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
    const user = await registerBusiness("Anime Store",  
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

//personal post(rsvp)
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

//business post(rsvp)
try {
    const post = await createPost(
        "sit_official",
        "Sony angel X Stevens",
        null,
        "Reserve your spot for free Smiski or Sony Angel",
        [],
        [],
        [],
        true,
        [],
        false,
        true,
        false,
        false,
        false,
        "2023-05-06T21:46:37.350+00:00"
    )
    console.log(post);
} catch (e) {
    console.log(e);
}

//admin post(no rsvp)
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
