const   express = require("express"),
        mongoose = require("mongoose"),
        passport = require("passport"),
        bodyParser = require("body-parser"),
        User = require("./models/user"),
        LocalStrategy = require("passport-local"),
        passportLocalMongoose = require("passport-local-mongoose");

// TODO
// Part 4
// - add login routes
// - add login form

const mongoURI = "mongodb+srv://devidle:" + process.env.MDBauth + "@cluster0-jcmtm.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    dbName: "wdbSecretPage",
    useFindAndModify: false
}, ).then(() => {
    console.log('Connected to Atlas DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
});

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true})); // initiate body-parser
app.use(require("express-session")({
  secret: "Some set of words", // This is used to encode and decode the sessions
  resave: false, // This key:value is required
  saveUninitialized: false // This key:value is required
}));
app.use(passport.initialize()); // these two execute code to get passport working
app.use(passport.session()); //

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // these two provide the logic to encode and decode the user string in the session
passport.deserializeUser(User.deserializeUser());


//======
//ROUTES
//======

// Root route
app.get("/", (req, res) => {
    res.render("home");
});

// our middleware function to determine authentication status

let isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){ // .isAuthenticated comes from Passport
    return next(); // Returna and run next, which is the next piece whatever the route is. "If the user is logged in, keep going"
  }
  res.redirect("/login");
};

// Secret route
app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

// Auth routes

// Register get
// Show the signup form
app.get("/register", (req, res) => {
    res.render("register");
});

// Register post
// Submit the signup form
app.post("/register", (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
        console.log(err);
        return res.render('register');
    }
    passport.authenticate("local")(req, res, () => {
        res.redirect("/secret");
        });
    });
});

// Login routes

// Login form GET
app.get("/login", (req, res) => {
    res.render("login");
});

// login POST logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
    }), (req, res) => {
});

// Logout route
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


// Server start!
app.listen(process.env.PORT, () => {
    console.log("Server started...");
});