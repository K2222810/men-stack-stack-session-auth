const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
// const userTest = require('../models/user.js');
const bcrypt = require('bcrypt');

// auth/sign-up GET
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});

// auth/sign-up POST - this should create a new user in our DB
// usernames to be unique 
// we want to pwd and confirmPwd fields to match 
// we want to store our pwd NOT as plain text in our DB (this is not otherwise secure)
router.post("/sign-up", async (req, res) => {
  // usernames to be unique 
  const userInDatabase = await User.findOne({ username: req.body.username });
  // const userInDatabase = await User.
  if (userInDatabase) {
    return res.send('Username already taken');
  }

  // we want to pwd and confirmPwd fields to match 
  if (req.body.password !== req.body.confirmPassword) {
    return res.send('Password and Confirm password do not match ')
  }

  // we want to store our pwd NOT as plain text in our DB (this is not otherwise secure)
  // hash the pwd
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;
  const newUser = await User.create(req.body);
  req.session.user = {
    username: newUser.username,
  };

  req.session.save(() => {
    res.redirect("/");
  });

  // res.send('Form submission accepted!');
})

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
});

router.post('/sign-in', async (req, res) => {
  // check that the user exists in the database
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send('Login failed. Please try again');
  }
  // check the password is correct (compare sync returns true or false based of off whether the 2 passwords match)
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send('Login failed. Please try again');
  }

  // make a session, avoid storing the whole pwd onto the session 
  // if there is other data you want to save you can do it here.
  req.session.user = {
  username: userInDatabase.username,
};

req.session.save(() => {
  res.redirect("/");
});

  // res.send('request to sign in received!');
})

router.get('/sign-out', (req, res) => {
  // res.send('The user wants to sign out!');
  req.session.destroy(() => {
  res.redirect("/");
  });

});

module.exports = router;

// Hashing - scrambles the password into difficult-to-decrypt string
// Salt string - makes sure that even if theres 2 users with the same pwd, they are encrypted with different strings in the db 
// 10 in the hashSync function - the amount of salting we want the hashing function to execute

// hashing turns data into a unique fixed-length string
// salting - adds a random value (a salt) to the data before hashing 


// session based authentication 
// cookies are small bits of data stored on your browser 
// in our session based strategy we will use cookies differently, it will hold data about the signed in user
// only our server can decrypt this info

// When a user signs into our application, they start a session that marks them as authenticated.
// Future requests from this user will carry this session in their browser cookie. Our server reads this session to verify if the request is from a signed-in user and, if so, identify who that user is.
// If a request is made to a protected route without this session, the server responds with an error message.
