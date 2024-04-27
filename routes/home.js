import { Router } from 'express';
const router = Router();
import { loginUser, registerUser } from '../data/figurine.js';

router
  .route('/')
  .get(async (req, res) => {
    res.render('home')
  }),
  router
    .route('/profile')
    .get(async (req, res) => {
      res.render('userProfile')
    }),
  router
    .route('/collections')
    .get(async (req, res) => {

    })
    router
    .route('/register')
    .get(async (req, res) => {
      res.render("register")
    })
    .post(async (req, res) => {
      //code here for POST
      let { firstName, lastName, username, password, confirmPassword, role } = req.body;
      if (!firstName || !lastName || !username || !confirmPassword || !password  || !role) {
        return res.status(400).render('register', { error: 'Must have all fields' });
      }
      if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof username !== 'string' ||
        typeof password !== 'string' || typeof role !== 'string') {
        return res.status(400).render('register', { error: 'Must provide string input' });
      }
      firstName = firstName.trim()
      lastName = lastName.trim()
      username = username.trim()
      password = password.trim()
      
      role = role.trim()
      if (firstName.length < 2 || lastName.length < 2 || username.length < 5 ||
        password.length < 8 
        || role.length < 4) {
        return res.status(400).render('register', { error: "Invalid Length" });
      }
      if (!isNaN(firstName) || !isNaN(lastName) || !isNaN(username) ||
        !isNaN(password)  ||
        !isNaN(role)) {
        return res.status(400).render('register', { error: "Can't be NaN" });
  
      }
      if (firstName.length > 25 || lastName.length > 25) {
        return res.status(400).render('register', { error: "First/Last can't be greater than 25 chars" });
      }
      let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
      for (let x of firstName) {
        if (n.includes(x)) {
          return res.status(400).render('register', { error: "No numbers allowed" });
        }
      }
      for (let x of lastName) {
        if (n.includes(x)) {
          return res.status(400).render('register', { error: "No numbers allowed" });
        }
      }
      for (let x of username) {
        if (n.includes(x)) {
          return res.status(400).render('register', { error: "No numbers allowed" });
        }
      }
  
      if (username.length > 10) {
        return res.status(400).render('register', { error: "Username can't be more than 10 chars" });
      }
  
      let upper = false
      let num = false
      let special = false
      let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
      for (let x of password) {
        if (x === " ") {
          return res.status(400).render('register', { error: "No numbers spaces in password" });
  
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
        return res.status(400).render('register', { error: "must have uppercase character, number, and special character" });
      }
  
      
      if (role !== "admin" && role !== "user") {
        return res.status(400).render('register', { error: "role can only be admin or user" });
      }
      if (confirmPassword !== password) {
        return res.status(400).render('register', { error: "passwords must match" });
      }
      let bool = true
      try {
        let result = await registerUser(firstName,
          lastName,
          username,
          password,
          role)
        bool = result.signupCompleted
        if (bool) {
          return res.redirect('/login');
        }
      } catch (e) {
        return res.status(400).render('register', { error: e });
  
      }
      if (!bool) {
        return res.status(500).render('register', { error: "Internal Server Error" });
  
      }
  
  
    });
  
  router
    .route('/login')
    .get(async (req, res) => {
      //code here for GET
      res.render("login", { themePreference: 'light' })
    })
  
    .post(async (req, res) => {
      //code here for POST
      let { username, password } = req.body;
      if (!username || !password || !isNaN(username) || !isNaN(password)) {
        return res.status(400).render('login', { themePreference: 'light', error: "username and password must be provided" });
      }
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).render('login', { themePreference: 'light', error: "must provide strings" });
      }
      username = username.trim()
      password = password.trim()
      if (username.length < 5 || password.length < 8) {
        return res.status(400).render('login', { themePreference: 'light', error: "invalid length" });
  
      }
      username = username.toLowerCase()
      if (username.length > 10) {
        return res.status(400).render('login', { themePreference: 'light', error: "username too long" });
  
      }
      let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
      for (let x of username) {
        if (n.includes(x)) {
          return res.status(400).render('login', { themePreference: 'light', error: "no numbers allowed" });
  
        }
      }
  
      //password checking for special characters and stuff
      let upper = false
      let num = false
      let special = false
      let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
      for (let x of password) {
        if (x === " ") {
          return res.status(400).render('login', { themePreference: 'light', error: "no spaces allowed" });
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
        return res.status(400).render('login', { themePreference: 'light', error: "must have uppercase character, number, and special character" });
  
      }
  
      try {
        const user = await loginUser(username, password)
        if (user) {
          req.session.user = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role
          }
          return res.redirect('/profile')
          //CHANGE WHAT HAPPENS WHEN LOGIN
          // if (user.role === 'admin') {
          //   return res.redirect('/admin');
          // } else {
          //   return res.redirect('/user');
          // }
        }
        else {
          return res.status(400).render('login', {  error: 'invalid username or password' });
        }
  
      } catch (e) {
        return res.status(400).render('login', {  error: e });
  
      }
  
    });

export default router;
