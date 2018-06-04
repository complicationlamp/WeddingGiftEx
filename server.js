

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
// const {TEST_DATABASE_URL} = require('./config/database');

// =============================================================
//configuration ================================================
// =============================================================

mongoose.connect(configDB.url); //connect to our database
// const TEST_DATABASE_URL = mongoose.connect(configDB.test);

require('./config/passport')(passport); // pass passport for configuration

//set up our express application 
app.use(morgan('dev')); // logs requests to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get info from html forms

app.set('view engine', 'ejs'); //sets up ejs for templating 

//required for passport
app.use(session({secret: 'iusedtolovescotch'})); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); // use connect-flash for flash messaging (like 'psw incorrect')

app.use("/app", express.static(__dirname + "/app"));
app.use("/bundles", express.static(__dirname + "/bundles"))

//==================================================================
// routes ==========================================================
//==================================================================

require('./app/routes.js')(app, passport);

//==================================================================
// launch ==========================================================
//==================================================================

// app.listen(port);
// console.log('Listening on ' + port);




// =====================================================================
// set up server to work with testing ==================================
// =====================================================================

let server;

function runServer() {
  console.log('in run server')
    return new Promise((resolve, reject) => {
      mongoose.connect(configDB.test, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }
  
  // this function closes the server, and returns a promise. we'll
  // use it in our integration tests later.
  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }
module.exports = { runServer, app, closeServer };