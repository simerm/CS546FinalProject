//import mongo collections, bcrypt and implement the following data functions
import bcrypt, { compare } from 'bcrypt'
const saltRounds = 16
import { users } from '../config/mongoCollections.js';

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


  if (role !== "Business" && role !== "Personal") {
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
    dateCreated:date
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
  if (!u) throw "Either the username or password is invalid"
  let compare = await bcrypt.compare(password, u.password);
  if (!compare) {
    throw "Either the username or password is invalid"
  }
  return {
    firstName: u.firstName,
    lastName: u.lastName,
    username: username,
    role: u.role
  }

};
