import {Router} from 'express';
import { sortFigurines, sortFigurinesUser } from '../data/genCollection.js';
import { readFile } from 'fs/promises';
const router = Router();
import { loginUser, registerUser, registerBusiness, updateProfile, addCollection, removeCollection, addToStock, removeFromStock, addWishlist, removeWishlist, getWishlist } from '../data/user.js';
import { grabList } from '../data/companyStock.js';
import fs from 'fs';
import path from 'path';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { submitApplication, appExists } from '../data/adminApplication.js';

router
  .route('/')
  .get(async (req, res) => {
    if (req.session.user) {
      res.render('home', { auth: true })
    } else {
      res.render('login', { auth: false })
    }
    
  }),
  router
    .route('/profile')
    .get(async (req, res) => {
      let val = false
      if (req.session.user) {
        val = true
      }
      let date = req.session.user.dateCreated
      const [year, month, day] = date.split('/').map(Number);
      let dobj = new Date(year, month - 1, day);
      let currentDate = new Date();
      const diff = (currentDate - dobj) / (1000 * 60 * 60 * 24 * 365);
      let eligible = false
      if (diff >= 3) {
        eligible = true
      }
      let exist = false
      try {
        exist = await appExists(req.session.user.username)

        if (exist) {
          eligible = false
        }
      } catch (e) {
        res.status(500).json({ error: 'Error: Loading info' })
      }
      let location = null
      let bio = null
      let favFig = null

      if (req.session.user.location != ""){
        location = req.session.user.location
      }
      if (req.session.user.bio != ""){
        bio = req.session.user.bio
      }
      if (req.session.user.favFig != ""){
        favFig = req.session.user.favoriteFigurine
      }

      const figurineInfo = await sortFigurinesUser(req.session.user.username);
      const wishlist = await getWishlist(req.session.user.username);

      let hasBadges = false;
      let hasWishlist = false;

      if (wishlist.wishlist && wishlist.wishlist.length > 0) {
        hasWishlist = true;
      }

      // console.log(figurineInfo)
      res.render('userProfile', {
        figurineInfo,
        collectionExists: figurineInfo ? true : false,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        username: req.session.user.username,
        role: req.session.user.role,
        auth: val,
        eligible: eligible,
        hasBadges: hasBadges,
        badges: req.session.user.badges,
        hasWishlist: hasWishlist,
        wishlist: wishlist.wishlist,
        location: location,
        bio: bio,
        favFig:favFig

      })
    })
    .post(async (req, res) => {
      let { first, last, location, bio, favFig } = req.body;
      let username = ""
      if (req.session.user) {
        username = req.session.user.username
      }
  
      if (!username || typeof username !== 'string' || !isNaN(username)) {
        return res.status(400).render('userProfile', { error: "Invalid User" });
      }
  
      let update = {}
  
      if (first.length == 0 && last.length == 0 && location.length == 0 && bio.length == 0 && favFig.length == 0) {
        return res.status(400).render('userProfile', { error: "Must change a value" });
      }
      else {
        if (first.length != 0 && first.length < 2 || first.length > 25) {
          return res.status(400).render('userProfile', { error: "Invalid first" });
        }
        else if (first.length != 0) {
          update.first = first
          req.session.user.firstName = first
        }
        if (last.length != 0 && last.length < 2 || last.length > 25) {
          return res.status(400).render('userProfile', { error: "Invalid last" });
  
        }
        else if (last.length != 0) {
          update.last = last
          req.session.user.lastName = last
        }
        if (location.length != 0 && location.length < 2 || location.length > 15) {
          return res.status(400).render('userProfile', { error: "Invalid location" });
  
        }
        else if (location.length != 0){
          update.location = location
          req.session.user.location = location
        }
        if (bio.length != 0 && bio.length < 5 || bio.length > 50) {
          return res.status(400).render('userProfile', { error: "Invalid location" });
        }
        else if (bio.length != 0){
          update.bio = bio
          req.session.user.bio = bio
        }
        if (favFig.length != 0 && favFig.length < 2 || favFig.length > 20) {
          return res.status(400).render('userProfile', { error: "Invalid location" });
  
        }
        else if (favFig.length != 0){
          update.favFig = favFig
          req.session.user.favoriteFigurine = favFig
        }
  
      }
  
      let bool = true;
      try {
        let result = await updateProfile(username, update)
        bool = result.success
        if (!bool) {
          return res.status(400).render('userProfile', { error: "Something went wrong" });
  
        }
        return res.redirect('/profile')
      } catch (e) {
        return res.status(500).render('userProfile', { error: e });
  
      }
  
  
    }),
  router
    .route('/collections')
    .get(async (req, res) => {
      try {
        if (req.session.user) {
          if (req.session.user.role == 'business') {
            // console.log(figurineInfo)
            const figurineInfo = await sortFigurines();
            res.render('generalCollection', { figurineInfo })
          } else if (req.session.user.role == 'personal') {
            const figurineInfo = await sortFigurinesUser(req.session.user.username); // sortFigurinesUser(req) once function works
            res.render('generalCollection', { auth: true, user: true, figurineInfo })
          }
        } else {
          const figurineInfo = await sortFigurines();
          // console.log(figurineInfo)
          res.render('generalCollection', { figurineInfo })
        }
      }
      catch (e) {
        console.error(e); // Log the error to the console
        res.status(500).json({ error: e })
      }
    
    }),
  router
    .route('/businessRegister')
    .get(async (req, res) => {
      res.render('businessRegister')
    })
    .post(async (req, res) => {
      let { name, phoneNumber, id, streetAddress, city, state, zipcode, username, password, confirmPassword } = req.body;
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
      if (!streetAddress) {
        return res.status(400).render('businessRegister', { error: 'Invalid params' });

      }
      else {
        if (typeof streetAddress !== "string" || !isNaN(streetAddress)) {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        else {
          streetAddress = streetAddress.trim()
          if (streetAddress.length < 5 || streetAddress.length > 25) {
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
        if (phoneNumber.length != 12 || phoneNumber[0] !== "+" || phoneNumber[1] !== "1") {
          return res.status(400).render('businessRegister', { error: 'Invalid params' });

        }
        for (let i = 2; i < 12; i++) {
          if (isNaN(parseInt(phoneNumber[i]))) {
            return res.status(400).render('businessRegister', { error: 'Invalid params' });

          }
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
          if (username.length < 5 || username.length > 20) {
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
        let result = await registerBusiness(name, phoneNumber, id, streetAddress, city, state, zipcode, username, password)
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
      let role = "personal"
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

      if (username.length > 20) {
        return res.status(400).render('register', { error: "Username can't be more than 20 chars" });
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


    }),

router
  .route('/login')
  .get(async (req, res) => {
    res.render("login", { themePreference: 'light' })
  })
  .post(async (req, res) => {
    //code here for POST
    let { username, password } = req.body;
    if (!username || !password || !isNaN(username) || !isNaN(password)) {
      return res.status(400).render('login', {  error: "username and password must be provided" });
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).render('login', {  error: "must provide strings" });
    }
      
    username = username.trim()
    password = password.trim()
    if (username.length < 5 || password.length < 8) {
      return res.status(400).render('login', {  error: "invalid length" });

    }
    username = username.toLowerCase()
    if (username.length > 20) {
      return res.status(400).render('login', {  error: "username too long" });

    }
    let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    for (let x of username) {
      if (n.includes(x)) {
        return res.status(400).render('login', {  error: "no numbers allowed" });

        }
      }
    
      //password checking for special characters and stuff
      let upper = false
      let num = false
      let special = false
      let sc = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "."]
      for (let x of password) {
        if (x === " ") {
          return res.status(400).render('login', { error: "no spaces allowed" });
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
        return res.status(400).render('login', { error: "must have uppercase character, number, and special character" });

      }
    
    try {
      const user = await loginUser(username, password)
      if (user) {
        if (user.role == 'business') {
          req.session.user = {
            storeName: user.storeName,
            phoneNumber: user.phoneNumber,
            businessId: user.id,
            streetAddress: user.streetAddress,
            city: user.city,
            state: user.state,
            zipcode: user.zipcode,
            username: user.username,
            figurineStock: user.figurineStock,
            role: user.role
          }
        }
        else {
          req.session.user = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role,
            dateCreated: user.dateCreated,
            badges: user.badges,
            wishlist: user.wishlist,
            favoriteFigurine: user.favoriteFigurine,
            friends: user.friends,
            figurineCollection: user.figurineCollection,
            bio: user.bio,
            location: user.location,
            picture: user.picture
          }
        }
        
        if(user.role == 'business'){
          return res.redirect('/businessProfile') //if the user is a business, redirect them to here
        }
        return res.redirect('/profile')
    
      }
      else {
        return res.status(400).render('login', { error: 'invalid username or password' });
      }

      } catch (e) {
        return res.status(400).render('login', { error: e });

      }

  }),

  router
    .route('/logout')
    .get(async (req, res) => {
      try {
        if (req.session.user) {
          req.session.destroy();
          res.render('logout');
        } else {
          res.redirect('/login');
        }
      } catch (e) {
        res.status(500).json({ error: e });
      }
    }),

    router
    .route('/business')
    .get(async (req, res) => {
      res.render('business')
    }),
  
  router 
    .route('/businessProfile')
    .get(async (req, res) => {
      try{
        const figList = await grabList();
        res.render('businessProfile', 
        {username: req.session.user.username,
        city: req.session.user.city,
        state: req.session.user.state,
        role: req.session.user.role,
        figurineStock: req.session.user.figurineStock,
        figList})
      }catch(e){
        res.status(500).json({error: 'Error while rendering business profile'})
      }
      
    }),
  
  router
    .route('/addToStock/:seriesName')
    .patch(async (req, res) => {
      try{ //try to add a series to the company stock
        //grab all of the necessary parameters for addToStock
        let username = req.session.user.username; //username 
        let series = req.params.seriesName //series 
  
        const adding = await addToStock(username, series); //call the function to add in the stock
        
        if (adding.success) {
          console.log('success')
          // Send the updated list as JSON
          res.status(200).json({ success: true, data: adding });
          // need to render the business profile page again after calling to show updated stock - using ajax
  
        } else {
          console.log('fail')
          
          res.status(400).json({ success: false, message: "Error with adding" });
        }
  
      }catch(e){
        res.status(500).json({ error: e });
      }
  
    }),
  
  router
    .route('/removeFromStock/:seriesName')
    .patch(async (req, res) => {
      try{ //try to add a series to the company stock
        //grab all of the necessary parameters for addToStock
        let username = req.session.user.username; //username 
        let series = req.params.seriesName //series 
  
        const removing = await removeFromStock(username, series); //call the function to add in the stock
        
        if (removing.success) {
          console.log('removed')
          // Send the updated list as JSON
          res.status(200).json({ success: true, data: removing });
          // need to render the business profile page again after calling to show updated stock - using ajax
  
        } else {
          console.log('fail')
          
          res.status(400).json({ success: false, message: "Error with removing" });
        }
  
      }catch(e){
        res.status(500).json({ error: e });
      }
  
    }),

  router
    .route('/addCollection/:figurineName/:seriesName/:modelName')
    .patch(async (req, res) => {
      try {
        // Retrieve parameters from request
        let figurineName = req.params.figurineName;
        let seriesName = req.params.seriesName;
        let modelName = req.params.modelName;

        // Add to collection
        let collection = await addCollection(req.session.user.username, figurineName, seriesName, modelName);

        if (collection.success) {
          // console.log('success');
          console.log(collection.userCollection);
          // Instead of redirecting, send a JSON response with updated collection data
          res.status(200).json({ success: true, userCollection: collection.userCollection });

        } else {
          // console.log('fail');
          // console.log(collection.message);
          res.status(400).json({ success: false, message: collection.message });
        }
      } catch (e) {
        // console.log(e);
        res.status(500).json({ error: e });
      }
    }),

  router
    .route('/removeCollection/:figurineName/:seriesName/:modelName')
    .patch(async (req, res) => {
      try {
        // console.log(req.params.figurineName)
        // console.log(req.params.seriesName)
        // console.log(req.params.modelName)

        let figurineName = req.params.figurineName
        let seriesName = req.params.seriesName
        let modelName = req.params.modelName
        let collection = await removeCollection(req.session.user.username, figurineName, seriesName, modelName)

        if (collection.success) {
          // console.log('success')
          // console.log(collection.userCollection)
          res.status(200).json({ success: true });
          // need to render the general collection page again after calling sortFigurinesUser to show updated collection
        } else {
          // console.log('fail')
          // console.log(collection.message)
          res.status(400).json({ success: false, message: collection.message });
        }
      } catch (e) {
        // console.log(e)
        res.status(500).json({ error: e });
      }
    }),


  router
    .route('/adminApplication')
    .post(async (req, res) => {
      let { email, whyAdmin } = req.body;
      let username = ""
      if (req.session.user) {
        username = req.session.user.username
        let date = req.session.user.dateCreated
        const [year, month, day] = date.split('/').map(Number);
        let dobj = new Date(year, month - 1, day);
        let currentDate = new Date();
        const diff = (currentDate - dobj) / (1000 * 60 * 60 * 24 * 365);
        let eligible = false
        if (diff >= 3) {
          eligible = true
        }
        try {
          let exist = await appExists(req.session.user.username)
          if (exist) {
            eligible = false
          }
        } catch (e) {
          res.status(500).json({ error: 'Error: Loading info' })

        }
      }

      if (!username || typeof username !== 'string' || !isNaN(username)) {
        return res.status(400).render('userProfile', { error: "Invalid User" });
      }
      if (!email) {
        return res.status(400).render('userProfile', { error: "Invalid email" });
      }
      else {
        if (typeof email !== "string" || !isNaN(email)) {
          return res.status(400).render('userProfile', { error: "Invalid email" });
        }
        else {
          email = email.trim()
          if (email.length < 5) {
            return res.status(400).render('userProfile', { error: "Invalid email" });
          }
          else {
            const emailSplit = email.split('@');
            if (!(emailSplit.length === 2 && emailSplit[1].includes('.'))) {
              return res.status(400).render('userProfile', { error: "Invalid email" });
            }
          }
        }
      }

      if (!whyAdmin) {
        return res.status(400).render('userProfile', { error: "Statement not provided" });
      }
      else {
        if (typeof whyAdmin !== "string" || !isNaN(whyAdmin)) {
          return res.status(400).render('userProfile', { error: "Invalid statement" });
        }
        else {
          whyAdmin = whyAdmin.trim()
          if (whyAdmin.length < 50) {
            return res.status(400).render('userProfile', { error: "Invalid length for statement" });
          }
        }
      }
      let bool = true;
      try {
        let result = await submitApplication(username, email, whyAdmin)
        bool = result.signupCompleted
        if (!bool) {
          return res.status(400).render('userProfile', { error: "Something went wrong" });

        }
        return res.redirect('/profile')
      } catch (e) {
        return res.status(500).render('userProfile', { error: e });

      }
    }),

  router
    .route('/addWishlist/:figurineName/:seriesName/:modelName')
    .patch(async (req, res) => {
      try {
        // Retrieve parameters from request        
        let figurineName = req.params.figurineName;
        let seriesName = req.params.seriesName;
        let modelName = req.params.modelName;

        // Add to collection
        let wishlist = await addWishlist(req.session.user.username, figurineName, seriesName, modelName);

        if (wishlist.success) {
          console.log('success');
          // console.log(collection.userCollection); edit for wishlist
          // Instead of redirecting, send a JSON response with updated collection data
          res.status(200).json({ success: true, message: wishlist.message });

        } else {
          console.log('fail');
          // console.log(collection.message);
          res.status(400).json({ success: false, message: wishlist.message });
        }
      } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
      }
    }),
  
  router
    .route('/removeWishlist/:figurineName/:seriesName/:modelName')
    .patch(async (req, res) => {
      try {  
        let figurineName = req.params.figurineName
        let seriesName = req.params.seriesName
        let modelName = req.params.modelName
        let wishlist = await removeWishlist(req.session.user.username, figurineName, seriesName, modelName)
  
        if (wishlist.success) {
          console.log('success')
          res.status(200).json({ success: true, message: wishlist.message });
        } else {
          console.log('fail')
          console.log(wishlist.message)
          res.status(400).json({ success: false, message: wishlist.message });
        }
      } catch (e) {
        console.log(e)
        res.status(500).json({ error: e });
      }
    });

    router
    .route('/viewUser')
    .get(async (req, res) => {
      let val = false
      if (req.session.user) {
        val = true
      }
      res.render('viewUserProfile', {auth:val})
    });

export default router;