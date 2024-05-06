import {Router} from 'express';
import { sortFigurines, sortFigurinesUser, getBadges } from '../data/genCollection.js';
import { readFile } from 'fs/promises';
const router = Router();
import { userExists, areNotFriends, getUserInfo, addFriend, loginUser, registerUser, registerBusiness, updateProfile, addCollection, removeCollection, addToStock, removeFromStock, addWishlist, removeWishlist, getWishlist, addTrade, removeTrade } from '../data/user.js';
import { grabList } from '../data/companyStock.js';
import fs from 'fs';
import path from 'path';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ObjectId } from 'mongodb';
import { submitApplication, appExists, reportUser, isReported, getAllReported } from '../data/adminApplication.js';
import { store } from '../config/mongoCollections.js';
import { posts } from '../config/mongoCollections.js';
import { getAllPosts, createComment, editPost, deletePost, createRating, createRsvp } from '../data/createposts.js';

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fileUpload from 'express-fileupload';
import xss from 'xss';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const thename = dirname(__filename);

const app = express();

app.use(fileUpload());
app.set('view engine', 'ejs');
app.set('views', 'views');

Handlebars.registerHelper('equals', function () {
  var args = [].slice.apply(arguments);
  if (args[0] === args[1]) {
    return true;
  }
  return false;
});

Handlebars.registerHelper('whichNav', function(role, options){ //gives back the correct nav bar
  return role === 'business'? options.fn(this) : options.inverse(this); //inverse aka else in this case
});


Handlebars.registerHelper('encodeURIComponent', function(str) {
  return encodeURIComponent(str);
});

router
  .route('/')
  .get(async (req, res) => {
    const postData = await getAllPosts();
    //retrieve logged in user to keep track of posts
    let currentUser = req.session.user;
    let currentUsername;

    if (currentUser) { //if user is logged in
      currentUsername = currentUser.username;
      res.render('home', { posts: postData, c_usr: currentUsername, auth: true, role: req.session.user.role });
    } else { //user isn't logged in
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

      let hasBadges = false;
      let hasWishlist = false;

      let figurineInfo;
      let wishlist;
      let badges;
      let eligible = false
      let location = null
      let bio = null
      let favFig = null
      let hasPicture = false
      if (req.session.user.role == "personal" || req.session.user.role == "admin") {
        let date = req.session.user.dateCreated
        const [year, month, day] = date.split('/').map(Number);
        let dobj = new Date(year, month - 1, day);
        let currentDate = new Date();
        const diff = (currentDate - dobj) / (1000 * 60 * 60 * 24 * 365);

        if (diff >= 3) {
          eligible = true
        }
        let exist = false
        try {
          exist = await appExists(req.session.user.username)

          if (exist || req.session.user.role === "admin") {
            eligible = false
          }
        } catch (e) {
          res.status(500).json({ error: 'Error: Loading info' })
        }


        if (req.session.user.location != "") {
          location = req.session.user.location
        }
        if (req.session.user.bio != "") {
          bio = req.session.user.bio
        }
        if (req.session.user.favoriteFigurine != "") {
          favFig = req.session.user.favoriteFigurine
        }
        if (req.session.user.picture !== "" && req.session.user.picture !== "None"){
          hasPicture = true
        }

        figurineInfo = await sortFigurinesUser(req.session.user.username);
        wishlist = await getWishlist(req.session.user.username);
        badges = await getBadges(req.session.user.username);
      // console.log(badges);

      // Check if badges object has keys for Smiski or Sonny Angel
      if (badges['Smiski'] || badges['Sonny Angel']) {
          hasBadges = true;
      }

        if (wishlist.wishlist && wishlist.wishlist.length > 0) {
          hasWishlist = true;
        }
      }
      let hasFriends = false
      if (req.session.user.friends.length > 0) {
        hasFriends = true
      }
      let admin = false
      if (req.session.user.role === "admin") {
        admin = true
      }
      let reportedUsers = []
      reportedUsers = await getAllReported()

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
        hasWishlist: hasWishlist,
        wishlist: wishlist ? wishlist.wishlist : null,
        location: location,
        bio: bio,
        favFig: favFig,
        hasFriends,
        friends: req.session.user.friends,
        admin,
        reportedUsers,
        badges: badges ? badges : null,
        hasPicture,
        picture: req.session.user.picture,
        tradingList: req.session.user.tradingList
      })
    })
    .post(async (req, res) => {
      let { first, last, location, bio, favFig, picture } = req.body;
      let username = ""
      if (req.session.user) {
        username = req.session.user.username
      }

      if (!username || typeof username !== 'string' || !isNaN(username)) {
        return res.status(400).render('userProfile', { error: "Invalid User" });
      }

      let update = {}

      if (first.length == 0 && last.length == 0 && location.length == 0 && bio.length == 0 && favFig.length == 0 && picture === "None") {
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
        else if (location.length != 0) {
          update.location = location
          req.session.user.location = location
        }
        if (bio.length != 0 && bio.length < 5 || bio.length > 50) {
          return res.status(400).render('userProfile', { error: "Invalid bio" });
        }
        else if (bio.length != 0) {
          update.bio = bio
          req.session.user.bio = bio
        }
        if (favFig.length != 0 && favFig.length < 2 || favFig.length > 20) {
          return res.status(400).render('userProfile', { error: "Invalid favorite figurine" });

        }
        else if (favFig.length != 0) {
          update.favFig = favFig
          req.session.user.favoriteFigurine = favFig
        }
        if (picture !== "None"){
          update.picture = picture
          req.session.user.picture = picture
        }

      }

      let bool = true;
      try {
        let result = await updateProfile(username, update, req.session.user.role)
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
  .route('/edit')
    .get(async (req, res) => {
      return res.render('edit', {postId: req.query.postId});
    })
    .post(async (req, res) => {
      const postCollection = await posts();
      
      let currentUser = req.session.user;
      let currentUsername;
  
      if (currentUser) { //if user is logged in
        currentUsername = currentUser.username;
      }

      let postId = req.body.postId;
      postId = new ObjectId(postId);
      let { newCaption } = req.body;
      newCaption = xss(newCaption);
    
      if (!newCaption) {
        return res.status(400).render('edit', { error: 'Must provide a caption', postCollection, c_usr: currentUsername, postId: postId, auth: true });
      }
      newCaption = newCaption.trim();
      if (newCaption.length < 1 || newCaption.length > 100) {
        return res.status(400).render('edit', { error: 'Must provide a caption between 1-100 characters', postCollection, c_usr: currentUsername, postId: postId, auth: true });
      }
    
      const post = await postCollection.findOne({ _id: postId });
      if (!post) {
        return res.status(400).render('edit', { error: 'Comment not found', postCollection, c_usr: currentUsername, postId: postId, auth: true });
      }
      let edit = await editPost(newCaption, postId);
      if (!edit) {
        return res.status(400).render('edit', { error: 'Comment post was unsuccessful', postCollection, c_usr: currentUsername, postId: postId, auth: true });
      }
      return res.redirect('/');
    });

  router
    .route('/delete')
    .post(async (req, res) => {
      try {
        let postId = req.body.postId;
        postId = new ObjectId(postId);
        // Call the deletePost function passing postId
        const deleted = await deletePost(postId);
        if (!deleted) {
          res.status(404).json({ error: 'Post not found' });
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      return res.redirect('/');
    }),
  router
  .route('/ratings')
  .post(async (req, res) =>  {
    let {rating, postId} = req.body;
    let rate = await createRating(rating, req.session.user, postId);
    if (!rate) {
      return res.status(400).render('home', { error: 'Rate post was unsuccessful' });
    }
    return res.redirect('/');
  });

  router
  .route('/rsvps')
  .post(async (req, res) =>  {
    let {rsvpMe, postId} = req.body;
    let userRsvp = await createRsvp(rsvpMe, req.session.user, postId);
    if (!userRsvp) {
      return res.status(400).render('home', { error: 'RSVP post was unsuccessful' });
    }
    return res.redirect('/');
  });
  router
    .route('/comments')
    .post(async (req, res) => {
      const postData = await getAllPosts();
      //retrieve logged in user to keep track of posts
      let currentUser = req.session.user;
      let currentUsername;
  
      if (currentUser) { //if user is logged in
        currentUsername = currentUser.username;
      }
      let { postId, commentInput } = req.body;
      commentInput = xss(commentInput);
      if (!commentInput) {
        return res.status(400).render('home', { error: 'Must provide a comment', posts: postData, c_usr: currentUsername, auth: true });
     }
     if (typeof commentInput !== 'string') {
      return res.status(400).render('home', { error: 'Must provide a string', posts: postData, c_usr: currentUsername, auth: true });
     }
    commentInput = commentInput.trim();
    if (commentInput.length < 1 || commentInput.length > 50) {
      return res.status(400).render('home', { error: 'Comment must be between 1-50 characters long', posts: postData, c_usr: currentUsername, auth: true });
    }
      let comments = await createComment(commentInput, req.session.user, postId);
      if (!comments) {
        return res.status(400).render('home', { error: 'Comment post was unsuccessful', posts: postData, c_usr: currentUsername, auth: true });
      }
      return res.redirect('/');
    });
router
  .route('/collections')
  .get(async (req, res) => {
    try {
      if (req.session.user) {
        if (req.session.user.role == 'business') {
          // console.log(figurineInfo)
          const figurineInfo = await sortFigurines();
          
          res.render('generalCollection', { auth: true, role: req.session.user.role, figurineInfo })
        } else if (req.session.user.role == 'personal' || req.session.user.role == 'admin') {
          const figurineInfo = await sortFigurinesUser(req.session.user.username); // sortFigurinesUser(req) once function works
          res.render('generalCollection', { auth: true, user: true, figurineInfo })
        }
      } else {
        const figurineInfo = await sortFigurines();
        // console.log(figurineInfo)
        res.redirect('/login')
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
      if (req.session.user){
        if (req.session.user.role == 'business') {
          return res.redirect('/businessProfile');
        } else if (req.session.user.role == 'personal' || req.session.user.role == 'admin') {
          return res.redirect('/profile');
        }
      }
       else {
        res.render('businessRegister')
      }
    })
    .post(async (req, res) => {
      let { name, phoneNumber, id, streetAddress, city, state, zipcode, username, password, confirmPassword} = req.body;
      name = xss(name);
      streetAddress = xss(streetAddress);
      city = xss(city);
      state = xss(state);
      zipcode = xss(zipcode);
      username = xss(username);
      password = xss(password);
      confirmPassword = xss(confirmPassword);
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
      firstName = xss(firstName);
      lastName = xss(lastName);
      username = xss(username)
      password = xss(password);
      confirmPassword = xss(confirmPassword);
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
        console.log(e)
        return res.status(400).render('register', { error: e });

      }
      if (!bool) {
        return res.status(500).render('register', { error: "Internal Server Error" });

      }


    }),

  router
    .route('/login')
    .get(async (req, res) => {
      res.render("login")
    })
    .post(async (req, res) => {
      //code here for POST
      let { username, password } = req.body;
      username = xss(username);
      password = xss(password);
      if (!username || !password || !isNaN(username) || !isNaN(password)) {
        return res.status(400).render('login', { error: "username and password must be provided" });
      }
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).render('login', { error: "must provide strings" });
      }

      username = username.trim()
      password = password.trim()
      if (username.length < 5 || password.length < 8) {
        return res.status(400).render('login', { error: "invalid length" });

      }
      username = username.toLowerCase()
      if (username.length > 20) {
        return res.status(400).render('login', { error: "username too long" });

      }
      let n = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
      for (let x of username) {
        if (n.includes(x)) {
          return res.status(400).render('login', { error: "no numbers allowed" });

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
        let val = false 
        
        if (user) {
          //val = true
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
              role: user.role,
              bio: user.bio
              //auth: val
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
              picture: user.picture,
              tradingList: user.tradingList
              //auth: val
            }
          }

          if (user.role == 'business') {
            return res.redirect('/businessProfile') //if the user is a business, redirect them to here
          }
          return res.redirect('/profile')

        }
        else { 
          return res.status(400).render('login', { hasError:true, error: "invalid username or password" });
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
      try {
        const figList = await grabList();
        let val = false; 

        if(req.session.user){
          val = true;
        }

        let bio = null;
        if (req.session.user.bio != "") {
          bio = req.session.user.bio
        }
        
        res.render('businessProfile',
          {
            username: req.session.user.username,
            storeName: req.session.user.storeName,
            city: req.session.user.city,
            state: req.session.user.state,
            role: req.session.user.role,
            figurineStock: req.session.user.figurineStock,
            figList,
            auth: val,
            bio: bio
          })
      } catch (e) {
        res.status(500).json({ error: 'Error while rendering business profile' })
      }

    })
    .post(async (req, res) => { //to edit the profile info
      let username; 
      if (req.session.user) {
        username = req.session.user.username
      }
      if (!username || typeof username !== 'string' || !isNaN(username)) {
        return res.status(400).render('businessProfile', { error: "Invalid User" });
      } //these if statements check if the user is logged in/valid
      let { storeName, bio } = req.body;

      //console.log(bio); //N/A rn 
      //console.log(storeName) //EC_test rn

      let update = {}
      if (storeName.length == 0 && bio.length == 0) {
        return res.status(400).render('businessProfile', { error: "Must change a value" });
      }
      else {
        if (storeName.length != 0 && storeName.length < 2 || storeName.length > 25) {
          return res.status(400).render('businessProfile', { error: "Invalid Store Name" });
        }
        if (storeName.length != 0) {
          update.storeName = storeName
          req.session.user.storeName = storeName
        }

        if (bio.length !== 0 && bio.length < 5 || bio.length > 50) {
          return res.status(400).render('businessProfile', { error: "Invalid About Us" });
        }
        else if (bio.length != 0) {
          update.bio = bio
          req.session.user.bio = bio
        }
      }
        
      let bool = true;
      let role = req.session.user.role; //so it can make the necessary changes for each profile
      console.log(role);

      try {
        let result = await updateProfile(username, update, role) 
        bool = result.success
        if (!bool) {
          return res.status(400).render('businessProfile', { error: "Something went wrong" });
        }
        return res.redirect('/businessProfile')
      } catch (e) {
        return res.status(500).render('businessProfile', { error: e });

      }
    }),

  router
    .route('/addToStock/:seriesName')
    .patch(async (req, res) => {
      try { //try to add a series to the company stock
        //grab all of the necessary parameters for addToStock
        let username = req.session.user.username; //username 
        let series = req.params.seriesName //series 

        const adding = await addToStock(username, series); //call the function to add in the stock

        if (adding.success) {
          // console.log('success')
          // Send the updated list as JSON
          res.status(200).json({ success: true, data: adding });
          // need to render the business profile page again after calling to show updated stock - using ajax

        } else {
          // console.log('fail')
          
          res.status(400).json({ success: false, message: "Error with adding" });
        }

      } catch (e) {
        res.status(500).json({ error: e });
      }

    }),

  router
    .route('/removeFromStock/:seriesName')
    .patch(async (req, res) => {
      try { //try to add a series to the company stock
        //grab all of the necessary parameters for addToStock
        let username = req.session.user.username; //username 
        let series = req.params.seriesName //series 

        const removing = await removeFromStock(username, series); //call the function to add in the stock

        if (removing.success) {
          // console.log('removed')
          // Send the updated list as JSON
          res.status(200).json({ success: true, data: removing });
          // need to render the business profile page again after calling to show updated stock - using ajax

        } else {
          // console.log('fail')
          
          res.status(400).json({ success: false, message: "Error with removing" });
        }

      } catch (e) {
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
        
        const figurineInfo = await sortFigurines();
        // console.log(figurineInfo)

        // Check if the provided figurineName exists in the object
        const figurineData = figurineInfo[figurineName];
        if (!figurineData) {
          return res.status(400).json({ success: false, message: 'Figurine name not found' });
        }

        // Check if the provided seriesName exists in the found figurineData
        const seriesData = figurineData.find(series => series.seriesName === seriesName);
        if (!seriesData) {
          return res.status(400).json({ success: false, message: 'Series name not found' });
        }

        // Check if the provided modelName exists in the found seriesData
        const modelData = seriesData.figurineTypes.find(type => type.modelName === modelName);
        if (!modelData) {
          return res.status(400).json({ success: false, message: 'Model name not found' });
        }
            // Add to collection
        let collection = await addCollection(req.session.user.username, figurineName, seriesName, modelName);

        if (collection.success) {
          // console.log('success');
          // console.log(collection.userCollection);
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

        const figurineInfo = await sortFigurines();
        // console.log(figurineInfo)

        // Check if the provided figurineName exists in the object
        const figurineData = figurineInfo[figurineName];
        if (!figurineData) {
          return res.status(400).json({ success: false, message: 'Figurine name not found' });
        }

        // Check if the provided seriesName exists in the found figurineData
        const seriesData = figurineData.find(series => series.seriesName === seriesName);
        if (!seriesData) {
          return res.status(400).json({ success: false, message: 'Series name not found' });
        }

        // Check if the provided modelName exists in the found seriesData
        const modelData = seriesData.figurineTypes.find(type => type.modelName === modelName);
        if (!modelData) {
          return res.status(400).json({ success: false, message: 'Model name not found' });
        }

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
        let user = req.session.user;

        const figurineInfo = await sortFigurines();
        // console.log(figurineInfo)

        // Check if the provided figurineName exists in the object
        const figurineData = figurineInfo[figurineName];
        if (!figurineData) {
          return res.status(400).json({ success: false, message: 'Figurine name not found' });
        }

        // Check if the provided seriesName exists in the found figurineData
        const seriesData = figurineData.find(series => series.seriesName === seriesName);
        if (!seriesData) {
          return res.status(400).json({ success: false, message: 'Series name not found' });
        }

        // Check if the provided modelName exists in the found seriesData
        const modelData = seriesData.figurineTypes.find(type => type.modelName === modelName);
        if (!modelData) {
          return res.status(400).json({ success: false, message: 'Model name not found' });
        }

        const userFigurineCollection = user.figurineCollection || {};

        // Check if the model already exists in the user's figurine collection
        for (const [figurine, seriesArray] of Object.entries(userFigurineCollection)) {
          for (const [series, models] of Object.entries(seriesArray)) {
            if (models.includes(modelName)) {
              return res.status(400).json({ success: false, message: 'Model already exists in collection' });
            }
          }
        }

        // Check if the model already exists in the user's wishlist
        const wishlistExists = user.wishlist && user.wishlist.includes(modelName);
        if (wishlistExists) {
            return res.status(400).json({ success: false, message: 'Model already exists in wishlist' });
        }

        // Add to collection
        let wishlist = await addWishlist(req.session.user.username, figurineName, seriesName, modelName);

        if (wishlist.success) {
          // console.log('success');
          // console.log(collection.userCollection); edit for wishlist
          // Instead of redirecting, send a JSON response with updated collection data
          res.status(200).json({ success: true, message: wishlist.message });

        } else {
          // console.log('fail');
          // console.log(collection.message);
          res.status(400).json({ success: false, message: wishlist.message });
        }
      } catch (e) {
        // console.log(e);
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
          // console.log('success')
          res.status(200).json({ success: true, message: wishlist.message });
        } else {
          // console.log('fail')
          // console.log(wishlist.message)
          res.status(400).json({ success: false, message: wishlist.message });
        }
      } catch (e) {
        // console.log(e)
        res.status(500).json({ error: e });
      }
    }),

router
  .route('/viewUser/:username')
  .get(async (req, res) => {
    let val = false
    let admin = false
    let notReported = true
    let notFriends = true

    let { username } = req.params;
    username = username.toLowerCase();
    
    if (req.session.user) {
      val = true
      if (req.session.user.role === "admin") {
        admin = true
      }
      if (username === req.session.user.username) {
        return res.redirect("/profile")
      }
    }
    
    let result;
    try {
      result = await getUserInfo(username)
      
      if(result.role === 'business'){
        res.render('viewBusinessProfile',{
          username: result.username,
          storeName: result.storeName,
          city: result.city,
          state: result.state,
          bio: result.bio,
          figurineStock: result.figurineStock,
          auth: val
        })
      } else {
        notReported = await isReported(username)
        notFriends = await areNotFriends(username, req.session.user.username)
        let hasFriends = false
        if (result.friends.length > 0) {
          hasFriends = true
        }
        if (req.session.user.role === "business"){
          notFriends = false
        }
  
        const figurineInfo = await sortFigurinesUser(username);
        const badges = await getBadges(username);
        const wishlist = await getWishlist(username);
  
        let hasBadges = false;
        let hasWishlist = false;
        if (badges['Smiski'] || badges['Sonny Angel']) {
          hasBadges = true;
        }
        let hasPicture = false
        if (result.picture !== "" && result.picture !== "None"){
          hasPicture = true
        }
  
        if (wishlist.wishlist && wishlist.wishlist.length > 0) {
          hasWishlist = true;
        }

        res.render('viewUserProfile', {
        admin: admin,
        username,
        notReported,
        notFriends,
        auth: val,
        figurineInfo,
        collectionExists: figurineInfo ? true : false,
        firstName: result.firstName,
        lastName: result.lastName,
        hasBadges: hasBadges,
        badges: badges ? badges : null,
        hasWishlist: hasWishlist,
        wishlist: wishlist ? wishlist.wishlist : null,
        location: result.location,
        bio: result.bio,
        favFig: result.favoriteFigurine,
        hasFriends,
        friends: result.friends,
        hasPicture,
        picture: result.picture,
        tradingList: result.tradingList
        })
      }
    } catch (e) {
      res.status(500).json({ error: e }); 
    }


  }),

router
  .route('/addFriend')
  .post(async (req, res) => {
    const { username } = req.body;
    let currUser = req.session.user.username
    if (username === currUser) {
      return res.status(400).render('viewUser', { auth: true, error: "Can not add self as friend" });
    }
    try {
      let result = await addFriend(currUser, username)
      if (result.success) {
        req.session.user.friends.push(username)
        return res.redirect(`/viewUser/${username}`)
      }
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }),

router
  .route('/reportUser')
  .post(async (req, res) => {
    const { username } = req.body;
    let currUser = req.session.user.username
    if (username === currUser) {
      return res.status(400).render('viewUser', { auth: true, error: "Can not add self as friend" });
    }
    try {
      let result = await reportUser(currUser, username)
      if (result.success) {
        return res.redirect(`/viewUser/${username}`)
      }
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }),

router
  .route('/searchUser')
  .post(async (req, res) => {
    let {username} = req.body
    if (!username) {
      return res.status(400).render('home', { auth: true, error: "Must provide username" });
    }
    else {
      if (typeof username !== "string" || !isNaN(username)) {
        return res.status(400).render('home', { auth: true, error: "Invalid type" });
      }
      else {
        username = username.trim()
        if (username.length < 1) {
          return res.status(400).render('home', { auth: true, error: "Must provide username" });
        }
      }
    }

    username = username.trim().toLowerCase();

    if (username === req.session.user.username){ //if they look up themselves
      return res.redirect("/profile")
    }

    let result;
    try{
      result = await userExists(username)
      if (!result){
        // return res.status(400).redirect('/?error=User not found');
        return res.status(400).render('home', { auth: true, error: "User not found" });

      }
      else{
        return res.redirect(`/viewUser/${username}`)
      }
    } catch(e){
      res.status(500).json({ error: e });
    }

  }),

  router
  .patch('/addTrade/:figurineName/:seriesName/:modelName', async (req, res) => {
    try {
      let figurineName = req.params.figurineName
      let seriesName = req.params.seriesName
      let modelName = req.params.modelName
      let username = req.session.user.username

      const figurineInfo = await sortFigurines();
      // console.log(figurineInfo)

      // Check if the provided figurineName exists in the object
      const figurineData = figurineInfo[figurineName];
      if (!figurineData) {
        return res.status(400).json({ success: false, message: 'Figurine name not found' });
      }

      // Check if the provided seriesName exists in the found figurineData
      const seriesData = figurineData.find(series => series.seriesName === seriesName);
      if (!seriesData) {
        return res.status(400).json({ success: false, message: 'Series name not found' });
      }

      // Check if the provided modelName exists in the found seriesData
      const modelData = seriesData.figurineTypes.find(type => type.modelName === modelName);
      if (!modelData) {
        return res.status(400).json({ success: false, message: 'Model name not found' });
      }

      let trade = await addTrade(username, figurineName, seriesName, modelName)

      if (trade.success) {
        // console.log(trade.message)
        res.status(200).json({ success: true, message: trade.message });
      } else {
        // console.log(trade.message)
        res.status(400).json({ success: false, message: trade.message });
      }
    } catch (e) {
      // console.log(e)
      res.status(500).json({ error: e });
    }
  }),

  router
  .patch('/removeTrade/:figurineName/:seriesName/:modelName', async (req, res) => {
    try {
      let figurineName = req.params.figurineName
      let seriesName = req.params.seriesName
      let modelName = req.params.modelName
      let username = req.session.user.username

      const figurineInfo = await sortFigurines();
      // console.log(figurineInfo)

      // Check if the provided figurineName exists in the object
      const figurineData = figurineInfo[figurineName];
      if (!figurineData) {
        return res.status(400).json({ success: false, message: 'Figurine name not found' });
      }

      // Check if the provided seriesName exists in the found figurineData
      const seriesData = figurineData.find(series => series.seriesName === seriesName);
      if (!seriesData) {
        return res.status(400).json({ success: false, message: 'Series name not found' });
      }

      // Check if the provided modelName exists in the found seriesData
      const modelData = seriesData.figurineTypes.find(type => type.modelName === modelName);
      if (!modelData) {
        return res.status(400).json({ success: false, message: 'Model name not found' });
      }

      let trade = await removeTrade(username, figurineName, seriesName, modelName)

      if (trade.success) {
        res.status(200).json({ success: true, message: trade.message });
      } else {
        res.status(400).json({ success: false, message: trade.message });
      }
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })

export default router;