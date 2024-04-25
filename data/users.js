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
  let userCollection= await users();
  let findusername= await userCollection.findOne({ username: username});
  //check username
  if(username.length<6){
    throw { code: 400, error: "Username has to be at least 6 characters" };
  }
  //check password
  if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{10,}$/)){
    throw { code: 400, error: "Invalid password." };
  }
  //check if username compares in system
  if(!findusername){
    throw {
      code: 400, error:
        "Either the username or password is invalid"
    }
  }
  //check if password is in system
  let unhash = await bcrypt.compare(password, findusername.password);
  if (!unhash) {
    throw {
      code: 400, error:
        "Either username or password is invalid"
    }}
    const noPass = {
      firstName: findusername.firstName,
      lastName: findusername.lastName,
      username:findusername.username,
      role: findusername.role
    }
    return noPass;
};