import {Router} from 'express';
const router = Router();
import {registerUser, loginUser} from "../data/users.js";

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
    return res.render('register', {title: "Register Page"});
  })
  .post(async (req, res) => {
    try {
      const {firstName, 
        lastName,
        username,
        password, 
        role} = req.body;
      
      // firstName= firstName.trim();
      // lastName= lastName.trim();
      // username= username.trim();
      // username=username.toLowerCase();
      // password= password.trim();
      // let confirmPassword = confirmPassword.trim();
      // role= role.trim();
      // role=role.toLowerCase();
      // if ((typeof (firstName) === undefined) || (typeof (lastName) === undefined) || (typeof (username) === undefined) || (typeof (password) === undefined) || (typeof (role) === undefined)) {
      //     throw "Error: Argument is not valid";
      //   }
      // if ((typeof firstName !== 'string' || (typeof lastName!== 'string'))) {
      //     throw "Error: Argument is not a string.";
      //   }
      // if (!firstName.match(/^[a-zA-Z]{2,25}$/)){
      //     throw { code: 400, error: "Invalid first name." };
      //   }
      // if (!lastName.match(/^[a-zA-Z]{2,25}$/)){
      //     throw { code: 400, error: "Invalid last name." };
      //   }
      // if(!username.match(/^[a-zA-Z0-9._]{4,}$/)){
      //     throw { code: 400, error: "Username has to be at least 4 characters" };
      //   }
      // if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[^\s]{8,}$/)){
      //     throw { code: 400, error: "Invalid password." };
      //   }
      //   if (password !== confirmPassword) {
      //     throw { code: 400, error: "Error: Passwords do not match." };
      //   }
      const user_info = await registerUser(firstName, lastName, username, password, role);
      const check_if_signup_complete = user_info.signupCompleted;
      if (check_if_signup_complete) {
        return res.redirect('/login');
      } else {
        return res.status(500).render('register', 'Internal Server Error')
      }
    } catch(e) {
      return res.status(400).render('register', {error_msg: e});
    }
  });

router
  .route('/login')
  .get(async (req, res) => {
    return res.render('login', {title: "Login Page"});
  })
  .post(async (req, res) => {
    try {
      let {username, password} = req.body;
      req.session.user = await loginUser(username, password);
      res.cookie('AuthenticationState', 'authenticated');
      if (req.session.user.role === "user") {
        return res.redirect('/user');
      } else if (req.session.user.role === "business") {
        return res.redirect('/business');
      }
    } catch(e) {
      return res.status(400).render('login', {error_msg: e});
    }
  });

router.route('/user').get(async (req, res) => {
  return res.render('user', {firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, 
    username: req.session.user.username, 
    password: req.session.user.password,
    role: req.session.user.role,
    title: "User Page"});
});

router.route('/business').get(async (req, res) => {
  return res.render('business', {firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, 
    username: req.session.user.username, 
    password: req.session.user.password,
    role: req.session.user.role,
    title: "Business Page"});
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy();
  res.clearCookie('AuthenicationState', '', {expires: new Date()});
  res.render('logout', {title: 'User Logged Out'});
});

export default router;