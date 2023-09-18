const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserRouter = require('./routes/userRouter');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Configure Google OAuth strategy
app.use(require('express-session')({ secret: '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', resave: true, saveUninitialized: true }));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Define the Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
          clientID: '704299662502-d41mfbum7k35bevlqipofck2gu3u7r55.apps.googleusercontent.com',
          clientSecret: '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',
          ///callbackURL: 'http://localhost:3000/auth/google/callback',    
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // This function handles the user's profile after successful login.
            // You can create or update the user's record in your database here.
            return done(null, profile);
        }
    )
);

// Serialize and deserialize user data (for session management)
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://r7905455:<password>@cluster0.c2ypzfg.mongodb.net/login', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from a directory (e.g., public)
app.set('view engine', 'ejs');

const userRouter = new UserRouter();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.use('/user', userRouter.router);

app.get('/resetPassword', (req, res) => {
    res.render('resetPassword');
});

app.get('/home', (req, res) => {
    res.render('home');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
