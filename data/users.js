import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
const saltrounds=5;
export const registerUser = async (
  firstName,
  lastName,
  username,
  password,
  role
) => {
  firstName= firstName.trim();
  lastName= lastName.trim();
  username= username.trim();
  username=username.toLowerCase();
  password= password.trim();
  role= role.trim();
  role=role.toLowerCase();
  //all inputs have to be defined
  if ((typeof firstName === undefined) || (typeof lastName === undefined) || (typeof password === undefined) || (typeof username=== undefined)||(typeof role === undefined)) {
    throw "Error: Argument is not valid";
  }
  //all except role have to be strings
  if ((typeof firstName !== 'string') || (typeof lastName !== 'string')||(typeof password!== 'string')||(typeof username!== 'string')|| (typeof role!=='string')) {
    throw "Error: Argument is not a string.";
  }
  // first and last name
  if (!firstName.match(/^[a-zA-Z]{2,25}$/)){
    throw { code: 400, error: "Invalid first name." };
  }
  if (!lastName.match(/^[a-zA-Z]{2,25}$/)){
    throw { code: 400, error: "Invalid last name." };
  }
  //check for valid username
  if(username.length<6){
    throw { code: 400, error: "Username has to be at least 6 characters" };
  }
  //check for valid password
  if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{8,}$/)){
    throw { code: 400, error: "Invalid password." };
  }
  //check for valid role of user, or business
  //admin is a user that has been logged in for a year
  //check if account is user or business
  if(role!=='business'&&role!=='user'){
      throw new Error("Error: role should only be 'business' or 'user'");
  }
  let hashedPassword= await bcrypt.hash(password,saltrounds);
  let newUser={
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: hashedPassword,
    role: role
  }
  const userCollection= await users();
  let insertedUser = await userCollection.insertOne(newUser);
  if (!insertedUser.insertedCount === 0)
    throw {
      code: 500, error:
        "Could not create a new user."
    };
    return {signupCompleted: true};
};

export const loginUser = async (username, password) => {
  if (!username || typeof username !== "string" || username.trim() === "" || username.length < 5 || username.length > 10 || username.match(/[^a-zA-Z]/)) {
    throw "You must provide a valid username";
  }

  if (!password || typeof password !== "string" || password.trim() === "" || password.length < 8 || password.length > 20 || !password.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)) {
    throw "You must provide a valid password";
  }

  const userCollection = await users();
  const user = await userCollection.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
  if (!user) {
    throw "Either the username or password is invalid";
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw "Either the username or password is invalid";
  }

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
    };
};