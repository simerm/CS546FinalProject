// import express from 'express';
// const app = express();
// import configRoutes from './routes/index.js';
// import exphbs from 'express-handlebars';
// import imgur from 'imgur';
// import fileUpload from 'express-fileupload';
// import fs from 'fs';
// import path from 'path';
// app.use(fileUpload());
// app.set('view engine', 'ejs');
// app.set('views', 'views');

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import session from 'express-session';

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import fileUpload from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const thename = dirname(__filename);

const app = express();

app.use(fileUpload());
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/public', express.static('public'));
import session from 'express-session';

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}))
app.use('/public', express.static('public'));

// // Middleware #1
// app.use((req, res, next) => {
//   if (req.originalUrl === "/") {
//     if (req.session.user) {
//       if (req.session.user.role === "business") {
//         res.redirect("/business");
//       } else {
//         res.redirect("/profile");
//       }
//     } else {
//       res.redirect("/login");
//     }
//   } else {
//     next();
//   }
// });


// Middleware #2
const redirectAuthenticated = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "business") {
      res.redirect("/business");
    } else if (req.session.user.role === "personal") {
      res.redirect("/profile");
    }
  } else {
    next();
  }
};

// Middleware #3
const redirectAuthenticatedForRegister = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "business") {
      res.redirect("/business");
    } else if (req.session.user.role === "personal") {
      res.redirect("/profile");
    }
  } else {
    next();
  }
};

// Middleware #4
const requireAuthentication = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

// // Middleware #5
const requireAdminAuthorization = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else if (req.session.user.role !== "business") {
    // Redirect non-admin users to an appropriate route
    res.redirect("/profile");
  } else {
    next();
  }
};

// Middleware #6
const requireLogout = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.use("/login", redirectAuthenticated);
app.use("/register", redirectAuthenticatedForRegister);
app.use("/profile", requireAuthentication);
app.use("/business", requireAdminAuthorization);
app.use("/logout", requireLogout);

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// app.get('/', (req, res) => {
//   res.render("home");
// });

// app.get('/upload', (req, res) => {
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   res.render('createpost');
// });


// app.post('/upload', (req, res) => {
//   if (!req.files) {
//     return res.status(400).send('No files were uploaded');
//   }
//   let sampleFile = req.files.sampleFile;
//   let uploadPath = thename + '/uploads/' + sampleFile.name;
//   sampleFile.mv(uploadPath, function (err) {
//     if (err) {
//       return res.status(500).send(err);
//     }
//   res.render('home');
//   });
// });

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
