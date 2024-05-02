//import mongo collections, bcrypt and implement the following data functions
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
    storeName: u.storeName,
    phoneNumber: u.phoneNumber,
    businessId: u.id,
    street: u.street,
    city: u.city,
    state: u.state,
    zipcode: u.zipcode,
    username: username,
    figurineStock: u.figurineStock,
    role: role
  }

};


export const registerBusiness = async (
  name, phoneNumber, id, street, city, state, zipcode, username, password
) => {
  let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  //id error handling
  if(!id){
    throw"Must provide an id"
  }
  else {
    if (typeof id !== "string" || !isNaN(id)) {
      throw "Invalid id"
    }
    else {
      if (id.length !== 10 || id[2] !== "-") {
        throw "Invalid id length"

      }
      else {
        for (let i = 0; i < id.length; i++) {
          if (i != 2 && isNaN(parseInt(id[i]))) {
            throw"Invalid parameters"

          }
        }
      }
    }
  }
  //name error handling
  name = name.trim();
  if (!name) {
    throw "Must provide a name"

  }
  else {
    if (typeof name !== "string" || !isNaN(name)) {
      throw "Invalid name"

    }
    else {
      name = name.trim()
      if (name.length < 5 || name.length > 25) {
        throw "Invalid name length"

      }
      else {
        for (let x of name) {
          if (n.includes(x)) {
            throw "Name can't include numbers"

          }
        }
      }
    }
  }
  //street error handling
  street = street.trim();
  if (!street) {
    throw"Must provide a street"

  }
  else {
    if (typeof street !== "string" || !isNaN(street)) {
      throw"Invalid street"

    }
    else {
      street = street.trim()
      if (street.length < 5 || street.length > 25) {
        throw"Street must be between 5 to 25 characters"

      }

    }
  }
  //city error handling
  city = city.trim();
  if (!city) {
    throw"Must provide a city"

  }
  else {
    if (typeof city !== "string" || !isNaN(city)) {
      throw"Must provide a valid city"

    }
    else {
      city = city.trim()
      if (city.length < 3 || city.length > 25) {
        throw "City must be between 3 to 25 characters"
      }
      else {
        for (let x of city) {
          if (n.includes(x)) {
            throw"City should not include numbers"

          }
        }
      }
    }
  }
  //state error handling
  const stateAbbreviations = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  if (!state || typeof state !== "string") {
    throw"Provide a valid state"

  }
  else {
    state = state.trim()
    state = state.toUpperCase()

    if (!stateAbbreviations.includes(state)) {
      throw"Not a valid state"

    }
  }
  //zipcode error handling
  if (!zipcode || typeof zipcode !== "string") {
    throw"Provide a valid zipcode"

  }
  else {
    if ((zipcode.length === 5 || zipcode.length === 9)) {
      for (let i = 0; i < zipcode.length; i++) {
        if (isNaN(parseInt(zipcode[i]))) {
          throw"Make sure your zipcode is 5 numbers"

        }
      }
    }
  }
  //phone number error handling
  if (!phoneNumber || typeof phoneNumber !== "string") {
    throw"Provide a phonenumber"

  }
  else {
    let number = parsePhoneNumberFromString(phoneNumber);
    if (!number || !number.isValid()) {
      throw"Number is not valid"

    }
  }
  //username error handling
  if (!username) {
    throw"Provide a username"

  }
  else {
    if (typeof username !== "string" || !isNaN(username)) {
      throw"Must provide a valid username"

    }
    else {
      username = username.trim()
      if (username.length < 5 || username.length > 10) {
        throw"Username has to be between 5-10 letters"

      }
      else {
        for (let x of username) {
          if (n.includes(x)) {
            throw"Username should not include numbers"
          }
        }
      }
    }
  }
  //password error handling
  if (!password) {
    throw"Must provide a password"

  }
  else {
    if (typeof password !== "string" || !isNaN(password)) {
      throw"Must provide a valid password"

    }
    else {
      password = password.trim()
      if (password.length < 8) {
        throw"Password must be at least 8 characters"

      }
      else {
        let upper = false
        let num = false
        let special = false
        let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
        for (let x of password) {
          if (x === " ") {
            let e = document.createElement("p");
            e.innerHTML = 'password not allowed spaces'
            error.appendChild(e)
            valid = false
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
          throw"Password must have an uppercase letter, number, and special character"

        }
      }
    }
  }




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
