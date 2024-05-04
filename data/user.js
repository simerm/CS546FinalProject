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

  if (username.length > 10) {
    throw "username can't be more than 10 characters"
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
    figurineCollection: {}
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
  if (username.length > 10) {
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
      street: b.street,
      city: b.city,
      state: b.state,
      zipcode: b.zipcode,
      username: username,
      figurineStock: b.figurineStock,
      role: role

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
    figurineCollection: u.figurineCollection
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