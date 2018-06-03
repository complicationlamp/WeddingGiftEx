// var User = require('../models/user');
var $ = require('jquery');

let randomUser;

$(function() {
        console.log('before the button')
        $('#randomBtn').on('click', function() {
        console.log('inside the btn')

        //============ESHA NOTES==============
        // This makes a request to route `/randomUser`
        // See note on line 21 for more info
        // Once route logic in routes.js is wokring, you can use the
        // const on line 18 to dispaly some information using jquery
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", '/randomUser', false ); // false for synchronous request
        xmlHttp.send( null );
        // console.log('responseText=========', xmlHttp.responseText);
        // const randomUser = xmlHttp.responseText;
        randomUser = JSON.parse(xmlHttp.responseText);
        addingRandomUser();
        console.log('some string')
        // $('#randomBtn').click(function() {
		// 	console.log('after object');
		// 	// $('.randomUsrClass').text(randomUser);
		// 	});	
        //============ESHA NOTES==============
        // Moved this code to routes.js and made this logic an API route
        // You can delete the below

        // var randomUserGen = 
        //     User.count().exec(function (err, count) {
    
        //             // Get a random entry
        //             var random = Math.floor(Math.random() * count)
                    
        //             // Again query all users but only fetch one offset by our random #
        //             User.findOne().skip(random).exec(
        //                 function (err, result) {
        //                 // Tada! random user
        //                 console.log(result) 
        //                 })
        //             })
        
        
        })
});

function addingRandomUser() {
    console.log('after object', randomUser);
    $('#TC').html(`
    <strong>Name</strong>: ${randomUser.local.firstnamelastname}<br>
    <strong>email</strong>: ${randomUser.local.email}<br>
    <strong>Location</strong>: ${randomUser.local.whereareyoufrom}<br>
    <strong>Relationship</strong>:${randomUser.local.relationship}<br>
    <strong>What is a small gift unique to where you live</strong>: ${randomUser.local.giftforex}<br>
    `)}	
