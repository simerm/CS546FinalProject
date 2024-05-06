import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import fileUpload from 'express-fileupload';
import { createPost} from './data/createposts.js';
import xss from 'xss';

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
app.use(express.static('public'));

const redirectFromCollections = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get('/createpost', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('createpost');
});

app.post('/createpost', async (req, res) => {
  let file = null;
  if (req.files && req.files.file) {
    file = req.files.file;
  }
  let uploadPath = null;
  if (file) {
    uploadPath = thename + '/public/' + file.name;

    file.mv(uploadPath, async function (err) {
      if (err) {
        return res.status(500).send(err);
      }
    });
  }

  let { postTitle, caption } = req.body;
  //xss stuff
  postTitle = xss(postTitle);
  caption = xss(caption);
  if (!postTitle && !caption) {
    return res.status(400).render('createpost', { error: 'Must provide a post title and caption' });
  } else if (!postTitle) {
    return res.status(400).render('createpost', { error: 'Must provide a post title' });
  } else if (!caption) {
    return res.status(400).render('createpost', { error: 'Must provide a post caption' });
  }
  if (typeof postTitle !== 'string' || typeof caption !== 'string') {
    return res.status(400).render('createpost', { error: 'Invalid params' });
  }
  let image = false;
  let video = false;
  let audio = false;
  if (file) {
    if (req.files.file.size > 10485760) {
      return res.status(400).render('createpost', { error: 'File is too big (Max Size: 10MB)' });
    }
    let whatIsFile = (req.files.file.mimetype).substring(0,5);
    if (whatIsFile !== 'image' && whatIsFile !== 'video' && whatIsFile !== 'audio') {
      return res.status(400).render('createpost', { error: 'Invalid file type' });
    }
    if (whatIsFile === 'image') {
      image = true;
    }
    if (whatIsFile === 'video') {
      video = true;
    }
    if (whatIsFile === 'audio') {
      audio = true;
    }
  }

  postTitle = postTitle.trim();
  caption = caption.trim();

  if (postTitle.length < 1 || postTitle.length > 25) {
    return res.status(400).render('createpost', { error: 'Post title must be between 1-25 characters long' });
  }

  if (caption.length < 1 || caption.length > 100) {
  return res.status(400).render('createpost', { error: 'Caption can only be 1-100 characters' });
}

  try {
    const user_info = await createPost(req.session.user, postTitle, file, req.body.rsvp, image, audio, video, caption);
    if (!user_info) {
      return res.status(400).render('createpost', { error: 'Post was unsuccessful' });
    }
    return res.redirect('/');
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

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

// Middleware #5
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

//set current user for delete button
app.use("/collections", redirectFromCollections);
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


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});