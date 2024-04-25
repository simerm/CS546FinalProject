import {Router} from 'express';
const router = Router();
import {registerUser, loginUser} from "../data/users.js";

router
  .route('/')
  .get(async (req, res) => {
    res.render('home');
  });

router
  .route('/profile')
  .get(async (req, res) => {
    return res.render('userProfile', {firstName: req.session.user.firstName, 
      lastName: req.session.user.lastName, 
      username: req.session.user.username, 
      password: req.session.user.password,
      role: req.session.user.role});
  });

router
  .route('/collections')
  .get(async (req, res) => {
    
  });

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

  router
  .route('/notLoggedIn')
  .get(async (req, res) => {
    return res.render('notLoggedIn', {title: "Login Page"});
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
      return res.status(400).render('notloggedIn', {error_msg: e});
    }
  });

router.route('/user').get(async (req, res) => {
  return res.render('userProfile', {firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, 
    username: req.session.user.username, 
    password: req.session.user.password,
    role: req.session.user.role});
});

router.route('/business').get(async (req, res) => {
  return res.render('userProfile', {firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, 
    username: req.session.user.username, 
    password: req.session.user.password,
    role: req.session.user.role});
});


export default router;