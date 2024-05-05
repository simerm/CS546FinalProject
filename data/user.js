import bcrypt, { compare } from 'bcrypt'
const saltRounds = 16
import { users } from '../config/mongoCollections.js';
import { store } from '../config/mongoCollections.js';

export const registerUser = async (
  firstName,
  lastName,
  username,
  password,
  role
) => {
  if (!firstName || !lastName || !username || !password || !role) {
    throw "Must provide all parameters"
  }
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof username !== 'string' ||
    typeof password !== 'string' || typeof role !== 'string') {
    throw "must provide a string"
  }
  firstName = firstName.trim()
  lastName = lastName.trim()
  username = username.trim()
  password = password.trim()
  role = role.trim()
  if (firstName.length < 2 || lastName.length < 2 || username.length < 5 ||
    password.length < 8
    || role.length < 4) {
    throw "Invalid length for input parameters"
  }
  if (!isNaN(firstName) || !isNaN(lastName) || !isNaN(username) ||
    !isNaN(password) ||
    !isNaN(role)) {
    throw "can not be Nan"
  }
  if (firstName.length > 25 || lastName.length > 25) {
    throw "first and last name can't be greater than 25 characters"
  }
  let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  for (let x of firstName) {
    if (n.includes(x)) {
      throw "no numbers allowed"
    }
  }
  for (let x of lastName) {
    if (n.includes(x)) {
      throw "no numbers allowed"
    }
  }
  for (let x of username) {
    if (n.includes(x)) {
      throw "no numbers allowed"
    }
  }

  if (username.length > 20) {
    throw "username can't be more than 20 characters"
  }
  const userCollection = await users();
  username = username.toLowerCase()
  const u = await userCollection.findOne({ username: username });
  if (u) throw 'username already exists';
  let upper = false
  let num = false
  let special = false
  let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
  for (let x of password) {
    if (x === " ") {
      throw "no spaces"
    }
    else if (x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
      upper = true
    }
    else if (x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57) {
      num = true
    }
    else if (sc.includes(x)) {
      special = true
    }
  }
  if (!upper || !num || !special) {
    throw 'must have uppercase character, number, and special character'
  }


  if (role !== "business" && role !== "personal") {
    throw "role can only be Business or Personal"
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const date = `${year}/${month}/${day}`
  let newUser = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: hash,
    role: role,
    badges: [],
    wishlist: [],
    favoriteFigurine: "",
    dateCreated: date,
    friends: [],
    figurineCollection: {},
    bio: "",
    location: "",
    picture: ""
    // { sample object
    // Smiski: {
    //   series1: ["lounging figure", "sleeping figure"],
    //   series2: ["workout figure", "etc figure"]
    //
    // },
    // Sonny Angel: {
    //  series1: ["lounging figure", "sleeping figure"],
    //  series2: ["workout figure", "etc figure"]
    // }

  }

  const newInsertInformation = await userCollection.insertOne(newUser);
  if (!newInsertInformation.insertedId) throw 'Insert failed!';
  return { signupCompleted: true }

};

export const loginUser = async (username, password) => {
  if (!username || !password || !isNaN(username) || !isNaN(password)) {
    throw "username and password parameters must be provided"
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw "must provide strings"
  }
  username = username.trim()
  password = password.trim()
  if (username.length < 5 || password.length < 8) {
    throw "invalid length"
  }
  username = username.toLowerCase()
  if (username.length > 20) {
    throw "username too long"
  }
  let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  for (let x of username) {
    if (n.includes(x)) {
      throw "no numbers allowed"
    }
  }

  //password checking for special characters and stuff
  let upper = false
  let num = false
  let special = false
  let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
  for (let x of password) {
    if (x === " ") {
      throw "no spaces"
    }
    else if (x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
      upper = true
    }
    else if (x.charCodeAt(0) >= 48 && x.charCodeAt(0) <= 57) {
      num = true
    }
    else if (sc.includes(x)) {
      special = true
    }
  }
  if (!upper || !num || !special) {
    throw 'must have uppercase character, number, and special character'
  }

  const userCollection = await users();
  const u = await userCollection.findOne({ username: username });
  const storeCollection = await store();
  const b = await storeCollection.findOne({ username: username });
  if (!b && !u) throw "Either the username or password is invalid"
  let role = ""
  if (b) {
    let compare = await bcrypt.compare(password, b.password);
    if (!compare) {
      throw "Either the username or password is invalid"
    }
    role = "business"
    return {
      storeName: b.storeName,
      phoneNumber: b.phoneNumber,
      businessId: b.id,
      street: b.streetAddress,
      city: b.city,
      state: b.state,
      zipcode: b.zipcode,
      username: username,
      figurineStock: b.figurineStock,
      role: b.role

    }
  }
  else if (u) {
    let compare = await bcrypt.compare(password, u.password);
    if (!compare) {
      throw "Either the username or password is invalid"
    }
    role = "personal"
  }

  return {
    firstName: u.firstName,
    lastName: u.lastName,
    username: u.username,
    role: u.role,
    badges: u.badges,
    wishlist: u.wishlist,
    favoriteFigurine: u.favoriteFigurine,
    dateCreated: u.dateCreated,
    friends: u.friends,
    figurineCollection: u.figurineCollection,
    bio: u.bio,
    location: u.location,
    picture: u.picture
  }

};

//ERROR HANDLING NEEDS TO BE DONE FOR THIS FUNCTION
export const registerBusiness = async (
  name, phoneNumber, id, street, city, state, zipcode, username, password
) => {
  // if (!username || !password || !name || !phoneNumber || !id || !street || !city || !state || !zipcode ) {
  //   throw "Must provide all parameters"
  // }

  const storeCollection = await store();
  username = username.toLowerCase()
  const u = await storeCollection.findOne({ username: username });
  if (u) throw 'username already exists';
  const c = await storeCollection.findOne({ businessId: id });
  if (c) throw 'business id already exists';

  let role = "business"

  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    storeName: name,
    phoneNumber: phoneNumber,
    businessId: id,
    street: street,
    city: city,
    state: state,
    zipcode: zipcode,
    username: username,
    password: hash,
    role: role,
    figurineStock: []
  }

  const newInsertInformation = await storeCollection.insertOne(newUser);
  if (!newInsertInformation.insertedId) throw 'Insert failed!';
  return { signupCompleted: true }

};

export const addCollection = async (username, figurineName, seriesName, modelName) => {
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'User not found';

    if (!user.figurineCollection) {
      user.figurineCollection = {};
    }

    if (!user.figurineCollection[figurineName]) {
      user.figurineCollection[figurineName] = {};
    }

    if (!user.figurineCollection[figurineName][seriesName]) {
      user.figurineCollection[figurineName][seriesName] = [];
    }

    if (user.figurineCollection[figurineName][seriesName].includes(modelName)) {
      return { success: false, message: 'Model already exists in collection' };
    } else {
      user.figurineCollection[figurineName][seriesName].push(modelName);
      // Update user's document in the collection
      await userCollection.updateOne({ username: username }, { $set: { figurineCollection: user.figurineCollection } });
      return { success: true, message: 'Model added to collection', userCollection: user.figurineCollection };
    }
  } catch (error) {
    return { success: false, message: error }; // Return error message
  }
};

export const removeCollection = async (username, figurineName, seriesName, modelName) => {
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'User not found';

    if (!user.figurineCollection || !user.figurineCollection[figurineName] || !user.figurineCollection[figurineName][seriesName]) {
      return { success: true, message: 'Collection is empty, no need to delete figurine' };
    }

    if (user.figurineCollection[figurineName][seriesName].includes(modelName)) {
      user.figurineCollection[figurineName][seriesName] = user.figurineCollection[figurineName][seriesName].filter(model => model !== modelName);
      // Update user's document in the collection
      await userCollection.updateOne({ username: username }, { $set: { figurineCollection: user.figurineCollection } });
      return { success: true, message: 'Model removed from collection', userCollection: user.figurineCollection };
    }
  } catch (e) {
    throw 'Error fetching user data!';
  }
};
export const addToStock = async (username, series) => { //function to add stock to the business
  try {
    const bCollection = await store();
    const business = await bCollection.findOne({ username: username });
    if (!business) throw 'Business not found';

    //console.log("made it")
    if (business.figurineStock.includes(series)) {
      return { success: false, message: 'This series already exists in the stock' };
    } else {
      // Update business' document in the collection
      //console.log("got to the function")
      await bCollection.updateOne({ username: username }, { $push: { figurineStock: series } });
      return { success: true, message: 'Series added to your stock', figurineStock: series };
    }
  } catch (e) {
    throw 'Error adding to stock!';
  }
};

export const removeFromStock = async (username, series) => { //function to remove stock from the business
  try {
    const bCollection = await store();
    const business = await bCollection.findOne({ username: username });
    if (!business) throw 'Business not found';

    if (!business.figurineStock.includes(series)) {
      return { success: false, message: 'This series does not exist in the stock' };
    } else {
      // Update business' document in the collection
      await bCollection.updateOne({ username: username }, { $pull: { figurineStock: series } });
      return { success: true, message: 'Series removed from your stock', figurineStock: series };
    }
  } catch (e) {
    throw 'Error removing from stock!';
  }
};


export const updateProfile = async (username, updateObject) => {
  if (!username || username === undefined) throw 'You must provide an username to search for';
  if (typeof username !== 'string') throw 'username must be a string';
  if (username.trim().length === 0)
    throw 'username cannot be an empty string or just spaces';
  username = username.trim();
  const userCollection = await users()
  const oldUser = await userCollection.findOne(
    { 'username': username },
  )
  if (oldUser === null) throw 'No review with that id';
  let theUser = null;

  if (updateObject.hasOwnProperty("first")) {
    if (typeof updateObject.first !== 'string') {
      throw "must be a string"
    }
    updateObject.first = updateObject.first.trim()
    if (updateObject.first.length < 2 || updateObject.first.length > 25) {
      throw "must not be empty"
    }

  }
  if (updateObject.hasOwnProperty("last")) {
    if (typeof updateObject.last !== 'string') {
      throw "must be a string"
    }
    updateObject.last = updateObject.last.trim()
    if (updateObject.last.length < 2 || updateObject.last.length > 25) {
      throw "must not be empty"
    }

  }
  if (updateObject.hasOwnProperty("location")) {
    if (typeof updateObject.location !== 'string') {
      throw "must be a string"
    }
    updateObject.location = updateObject.location.trim()
    if (updateObject.location.length < 1 || updateObject.location.length > 15) {
      throw "Invalid size"
    }

  }
  if (updateObject.hasOwnProperty("bio")) {
    if (typeof updateObject.bio !== 'string') {
      throw "must be a string"
    }
    updateObject.bio = updateObject.bio.trim()
    if (updateObject.bio.length < 5 || updateObject.bio.length > 50) {
      throw "must not be empty"
    }

  }
  if (updateObject.hasOwnProperty("favFig")) {
    if (typeof updateObject.favFig !== 'string') {
      throw "must be a string"
    }
    updateObject.favFig = updateObject.favFig.trim()
    if (updateObject.favFig.length < 2 || updateObject.favFig.length > 20) {
      throw "must not be empty"
    }

  }
  if (updateObject.hasOwnProperty("picture")) {

    picture.favFig = picture.favFig.trim()


  }

  if (updateObject.hasOwnProperty("first")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'firstName': updateObject.first } },
      { returnDocument: 'after' }
    )
  }
  if (updateObject.hasOwnProperty("last")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'lastName': updateObject.last } },
      { returnDocument: 'after' }
    )
  }
  if (updateObject.hasOwnProperty("location")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'location': updateObject.location } },
      { returnDocument: 'after' }
    )
  }

  if (updateObject.hasOwnProperty("bio")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'bio': updateObject.bio } },
      { returnDocument: 'after' }
    )
  }

  if (updateObject.hasOwnProperty("favFig")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'favoriteFigurine': updateObject.favFig } },
      { returnDocument: 'after' }
    )
  }


  if (updateObject.hasOwnProperty("picture")) {

    theUser = await userCollection.findOneAndUpdate(
      { 'username': username },
      { $set: { 'picture': updateObject.picture } },
      { returnDocument: 'after' }
    )
  }


  return { success: true }

};




export const addWishlist = async (username, figurineName, seriesName, modelName) => { //honestly, dont really need figurineName and seriesName
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'User not found';

    if (!user.wishlist) {
      user.wishlist = [];
    }
    console.log(user.wishlist);
    console.log(modelName);
    if (user.wishlist.includes(modelName)) {
      return { success: false, message: 'Model already exists in wishlist' };
    } else {
      user.wishlist.push(modelName);
      // Update user's document in the collection
      console.log(user.wishlist);
      await userCollection.updateOne({ username: username }, { $set: { wishlist: user.wishlist } });
      return { success: true, message: 'Model added to wishlist', wishlist: user.wishlist };
    }
  } catch (e) {
    return { success: false, message: error }; // Return error message
  }
};

export const removeWishlist = async (username, figurineName, seriesName, modelName) => {
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'User not found';

    if (!user.wishlist) {
      return { success: true, message: 'Wishlist is empty, no need to delete figurine' };
    }

    if (user.wishlist.includes(modelName)) {
      user.wishlist = user.wishlist.filter(model => model !== modelName);
      // Update user's document in the collection
      await userCollection.updateOne({ username: username }, { $set: { wishlist: user.wishlist } });
      return { success: true, message: 'Model removed from wishlist', wishlist: user.wishlist };
    }
  } catch (e) {
    return { success: false, message: error }; // Return error message
  }
};

export const getWishlist = async (username) => {
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'User not found';

    if (!user.wishlist) {
      return { success: true, message: 'Wishlist is empty' };
    }

    return { success: true, wishlist: user.wishlist };
  } catch (e) {
    return { success: false, message: error }; // Return error message
  }
}

export const addFriend = async (currUser, otherUser) => {
  if (!currUser || !otherUser) {
    throw "must include all params"
  }
  if (currUser === otherUser){
    throw "can't be same user"
  }
  const userCollection = await users();
  const user = await userCollection.findOne({ username: currUser });
  if (!user) throw 'User not found';

  const friend = await userCollection.findOne({ username: otherUser });
  if (!friend) throw 'User not found';

  if (user.friends.includes (otherUser)){
    throw "friend already added"
  }

  let first = await userCollection.findOneAndUpdate(
    { 'username': currUser },
    { $push: { 'friends': otherUser} },
    { returnDocument: 'after' }
  )

  let sec = await userCollection.findOneAndUpdate(
    { 'username': otherUser },
    { $push: { 'friends': currUser} },
    { returnDocument: 'after' }
  )

  return {success: true}

}

export const getUserInfo = async (username) => {
  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });
  if (!user) throw 'User not found';
  let userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    badges: user.badges,
    wishlist: user.wishlist,
    favoriteFigurine: user.favoriteFigurine,
    friends: user.friends,
    figurineCollection: user.figurineCollection,
    bio: user.bio,
    location: user.location,
    picture: user.picture
  }
  return userInfo


}

export const areNotFriends = async (first, sec) => {
  const userCollection = await users();
  const user = await userCollection.findOne({ username: first });
  if (!user) throw 'User not found';

  if (user.friends.includes (sec)){
    return false
  }
  return true
}