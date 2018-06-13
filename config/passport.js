'use strict';
///want to keep passport stuff isolated 

//load all the things we need
var LocalStrategy = require('passport-local').Strategy;

//load up the user model
var User = require('../app/models/user');

//expose this function to out app using module.exports 
module.exports = function(passport) {


  //=================================================
  //passport session setup ==========================
  //=================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session 
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  })  ;

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    // =================================================
    // ==================NOTES==========================
    // =================================================    
    // RIGHT SIDE 'email' AND 'password' DENOTE THE NAME OF THE INPUT FIELD ON THE SIGNUP.EJS FORM (IN THE SIGNUP FORM)
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows up to pass back the entire request to the callback
    
  },
  function(req, email, password, done) {
    console.log(req.body);
    //asynchronous
    //User.findOne wont fire unless data is sent back
    process.nextTick(function() {

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'email' : email }, function(err, user) {

        //if there are any errors, return the error
        if (err)
          return done(err);
            
        // check to see if theres already a user with that email. 
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken'));
        }else {
                

          //if there  is no user with that email
          //create the user
          var newUser = new User();

          // set the user's local credentials 
          newUser.email = email;
          newUser.password = newUser.generateHash(password);

          // =================================================
          // ==================NOTES==========================
          // =================================================
          // USER AND PASSWORD ARE BUILT IN ARGS SO WE NEED TO DENOTE REQ.BODY FOR ALL OTHER FORM DATA (BIRTHDAY, HEIGHT, FAV COLOR ...)
          // BECAUSE THAT IS WHERE THE INFORMATION IS BEING STORED IN THE REQUEST 
          newUser.firstnamelastname = req.body.firstnamelastname;
          newUser.whereareyoufrom = req.body.whereareyoufrom;
          newUser.relationship = req.body.relationship;
          newUser.giftforex = req.body.giftforex;


          // save the user
          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);

          });
        }
      });

    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    //// by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
        
    passwordField : 'password',

    passReqToCallback : true // allows us to pass back the entire request to the callback

  },
    
  function(req, email, password, done) { //callback with email and password from out form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'email' : email }, function(err, user) {
      // if there's an error we want it to pop first
      if (err)
        return done(err);

      // if no user is found, return the message
      if (!user)
      // req.flash is the way to set flashdata using connect-flash
        return done(null, false, req.flash('loginMessage', 'No user found.'));
            
      if (!user.validPassword(password))
      // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

      return done(null, user);
    });

  }));



};

