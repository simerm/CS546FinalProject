import { Router } from 'express';
const router = Router();
import { loginUser, registerUser, registerBusiness } from '../data/user.js';
import fs from 'fs';
import path from 'path';

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
    .route('/collections').get( async (req, res) => {
    fs.readFile('./data/figurines.json', 'utf8', (err, figurines) => {
      if (err) {
        console.error(err)
        return
      }
      fs.readFile('./data/series.json', 'utf8', (err, series) => {
        if (err) {
          console.error(err)
          return
        }
        res.render('collections', {figurines: JSON.parse(figurines), series: JSON.parse(series)})
      })
    })
  }),
  router
    .route('/businessRegister')
    .get(async (req, res) => {
      res.render('businessRegister')
    })
    .post(async (req, res) => {
      let { name, phoneNumber, id, street, city, state, zipcode, username, password, confirmPassword } = req.body;
      let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

      if (!id) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof id !== "string" || !isNaN(id)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          if (id.length !== 10 || id[2] !== "-") {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }
          else {
            for (let i = 0; i < id.length; i++) {
              if (i != 2 && isNaN(parseInt(id[i]))) {
                return res.status(400).render('businessRegister', { error: 'Invalid params' });

              }
            }
          }
        }
      }
      if (!name) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof name !== "string" || !isNaN(name)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          name = name.trim()
          if (name.length < 5 || name.length > 25) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }
          else {
            for (let x of name) {
              if (n.includes(x)) {
                return res.status(400).render('businessRegister', { error: 'Invalid params' });

              }
            }
          }
        }
      }
      if (!street) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof street !== "string" || !isNaN(street)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          street = street.trim()
          if (street.length < 5 || street.length > 25) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }

        }
      }
      if (!city) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof city !== "string" || !isNaN(city)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          city = city.trim()
          if (city.length < 3 || city.length > 25) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }
          else {
            for (let x of city) {
              if (n.includes(x)) {
                return res.status(400).render('businessRegister', { error: 'Invalid params' });

              }
            }
          }
        }
      }
      const stateAbbreviations = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];
      if (!state || typeof state !== "string") {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        state = state.trim()
        state = state.toUpperCase()

        if (!stateAbbreviations.includes(state)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
      }
      if (!zipcode || typeof zipcode !== "string") {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if ((zipcode.length === 5 || zipcode.length === 9)) {
          for (let i = 0; i < zipcode.length; i++) {
            if (isNaN(parseInt(zipcode[i]))) {
              return res.status(400).render('businessRegister', { error: 'Invalid params' });

            }
          }
        }
      }
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        let number = parsePhoneNumberFromString(phoneNumber);
        if (!number || !number.isValid()) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
      }
      if (!username) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof username !== "string" || !isNaN(username)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          username = username.trim()
          if (username.length < 5 || username.length > 10) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }
          else {
            for (let x of username) {
              if (n.includes(x)) {
                return res.status(400).render('businessRegister', { error: 'Invalid params' });
              }
            }
          }
        }
      }
      if (!password) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof password !== "string" || !isNaN(password)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          password = password.trim()
          if (password.length < 8) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

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
              return res.status(400).render('businessRegister', { error: 'Invalid params' });

            }
          }
        }
      }
      if (!confirmPassword) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (confirmPassword !== password) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
      }
      let bool = true
      try {
        let result = await registerBusiness(name, phoneNumber, id, street, city, state, zipcode, username, password)
        bool = result.signupCompleted
        if (bool) {
          return res.redirect('/login');

        }
      } catch (e) {
        return res.status(400).render('businessRegister', { error: e });

      }
      if (!bool) {
        return res.status(500).render('businessRegister', { error: "Internal Server Error" });

      }
    }),
  router
    .route('/register')
    .get(async (req, res) => {
      res.render("register")
    })
    .post(async (req, res) => {
      //code here for POST
      let { firstName, lastName, username, password, confirmPassword } = req.body;
      let role = "Personal"
      if (!firstName || !lastName || !username || !confirmPassword || !password || !role) {
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


      if (!isNaN(firstName) || !isNaN(lastName) || !isNaN(username) ||
        !isNaN(password)
      ) {
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
        if (user.role == 'business') {
          req.session.user = {
            storeName: user.storeName,
            phoneNumber: user.phoneNumber,
            businessId: user.id,
            street: user.street,
            city: user.city,
            state: user.state,
            zipcode: user.zipcode,
            username: user.username,
            figurineStock: user.figurineStock,
            role: user.role
          }
        }
        else{
          req.session.user = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role
          }
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
        return res.status(400).render('login', { error: 'invalid username or password' });
      }

    } catch (e) {
      return res.status(400).render('login', { error: e });

    }

  });

export default router;
