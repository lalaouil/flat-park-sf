// START BOILERPLATE
var express    	= require('express');
var app        	= express();
var path       	= require('path');
var pg         	= require('pg');
var bodyParser 	= require('body-parser');
var db         	= require("./models");
var passport    = require('passport');
var session    = require("cookie-session");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/*
  What is the session?
  It is the object that lives in our app
    and records relevant info about users
    who are signed in
*/
app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());

/*
SERIALizING
Turns relevant user data into a string to be 
  stored as a cookie
*/
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");

  done(null, user.id);
});

/*
DeSERIALizing
Taking a string and turns into an object
  using the relevant data stored in the session
*/
passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.user.find({
      where: {
        id: id
      }
    })
    .then(function(user){
      done(null, user);
    },
    function(err) {
      done(err, null);
    });
});

// the root route for localhost:3000/
app.get("/", function (req, res) {
  console.log(req.user)
  // req.user is the user currently logged in

  if (req.user) {
    res.render("sites/home", {user: req.user});
  } else {
    res.render("sites/home", {user: false});
  }
});


app.get('/login', function(req, res) {
	res.render('sites/login');
});

app.get('/signup', function(req, res) {
	res.render('sites/signup');
});

app.get("/users/:id", function (req, res) {
  var id = req.params.id;
  db.user.find(id)
    .then(function (user) {
      res.render("users/show", {user: user});
    })
    .error(function () {
      res.redirect("/signup");
    })
});

app.get('/map', function(req, res) {
	db.sfPark.getData(function (data) {
		res.render('sites/map', {parkingData: data});
	});
});



app.get("/logout", function (req, res) {
  // log out
  req.logout();
  res.redirect("/");
});

// WHEN SOMEONE  SUBMITS A SIGNUP PAGE
app.post("/users", function (req, res) {
  console.log("POST /users");
  var newUser = req.body.user;
  console.log("New User:", newUser);
  // CREATE a user and secure their password
  db.user.createSecure(newUser.email, newUser.password_digest, 
    function () {
    	console.log("Failed signup");
      // if a user fails to create make them signup again
      res.redirect("/signup");
    },
    function (err, user) {
      // when successfully created log the user in
      // req.login is given by the passport
      req.login(user, function(){
        // after login redirect show page
        console.log("Id: ", user.id)
        res.redirect('/users/' + user.id);
      });
    })
});



// Authenticating a user
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));



app.listen(3000, function (){
 	console.log((new Array(50)).join("*"));
 	console.log("\t listening on localhost:3000");
})