import express from 'express';
import cookieParser from 'cookie-parser';
const app = express();
import configRoutes from './routes/index.js';
import session from 'express-session';
import exphbs from 'express-handlebars';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
app.use('/public', express.static(dirname(fileURLToPath(import.meta.url)) + '/public'));

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}));

app.use('/login', (req, res, next) => {
  if (!req.session.user) {
    next();
  } else if (req.session.user.role === "user") {
    return res.redirect('/user');
  } else if (req.session.user.role === "business") {
    return res.redirect('/business');
  }
});

app.use('/profile', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("notLoggedIn");
  } else {
    next();
  }
});

app.use('/register', (req, res, next) => {
  if (!req.session.user) {
    next();
  } else if (req.session.user.role === "user") {
    return res.redirect('/user');
  } else if (req.session.user.role === "business") {
    return res.redirect('/business');
  }
});

app.use('/user', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  } else {
    next();
  }
});

app.use('/business', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  } else if (req.session.user.role !== "business") {
    return res.status(403).redirect("/error");
  } else {
    next();
  }
});

app.use('/logout', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  } else {
    next();
  }
});

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

export default app;