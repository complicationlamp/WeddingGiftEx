const User = require('./models/user');
const bodyparser = require('body-parser');
const jsonParser = bodyparser.json();



module.exports = function(app, passport) {

    //===================================
    // HOME PAGE WITH LOGIN LINK ========
    //===================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); //load the index.ejs file
    });

    //==================================
    //LOGIN=============================
    //==================================
    //SHOW THE LOGIN FORM===============
    app.get('/login', function(req, res) {

        //render the page and pass in any flash data if it exists 

        res.render('login.ejs', {message: req.flash('loginMessage')});
    });
    
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', //redirect to secure profile section
        failureRedirect : '/login', //redirect back to login
        failureFlash : true // allow flash messages EDIT
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form

    app.get('/signup', function(req, res){
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
    
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', //redirect to secure profile section
        failureRedirect : '/signup', //redirect back to signup
        failureFlash : true // allow flash messages

    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // Updating Info SECTION ===============
    // =====================================

    app.get('/updateInfo', isLoggedIn, function(req, res) {
        //this will break if you take out the flash message. Why do you ask? Well this
        // is a great reading opertunity
        res.render('updateInfo.ejs', {message: req.flash('updateMessage')    
        });
    })


    // =====================================
    //PUT Update the profile SECTION =======
    // =====================================

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXX BEGIN CONSTRUCTION ZONE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// for this I wanted to use the isLoggedIn function to keep it somewhat secure
    app.put('/profile/:id', isLoggedIn, jsonParser, (req, res) => {
        console.log('put function')
        //need match up the ids so that we're editing the right info
        if (!(req.params.id && req.body.id == req.body.id)) {
            console.log('put id\' aint matchin');
            const message = (
                `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);  
              console.error(message);
              return res.status(400).json({ message: message });            
        } 

        const toUpdate = {};
        const updateableFields = ['email', 'firstnamelastname', 'whereareyoufrom', 'relationship', 'giftforex'];
        console.log(req.body);

        updateableFields.forEach(field => {
            if (field in req.body) {
              toUpdate[field] = req.body[field];
            }
        });
        console.log('hhhhhhhhhh',toUpdate); 
        console.log(req.params.id);
        User
        //going to use $set to update all the keyvalue pairs
            .findByIdAndUpdate(req.params.id, toUpdate)
            .then(user => res.status(204).end())
            .catch(err => res.status(500).json({ message: 'Ooops this was coded by a noob; internal server error'}));       
    });
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXX END CONSTRUCTION ZONE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //======================================
    // FIND A RANDOM USER ==================
    //====================================
    app.get('/randomUser', function (req, res) {
        console.log('in randomUser route');
        var randomUserGen = User.count().exec(function (err, count) {

            // Get a random entry
            var random = Math.floor(Math.random() * count);
            console.log('random=====', random)
            
            // Again query all users but only fetch one offset by our random #
            
            return User.findOne().skip(random).exec(
                function (err, result) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    // Tada! random user
                    console.log('result========', result) 
                    // return result;
                    res.json(result)
                });
            });
    })
    // =====================================
    // LOGOUT ==============================
    // =====================================

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// rout middleware to make sure that the user is logged in
function isLoggedIn(req, res, next) {

    //if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    
    //if they aren't redirect them home
    res.redirect('/'); 
}
