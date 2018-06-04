'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();


const {TestUser} = require('../app/models/user');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config/database');


chai.use(chaiHttp);


// ======================================================
// Tearing the database down=============================
// ======================================================

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

// ======================================================
// function to seed the data to the test-database========
// ======================================================

function seedUserData() {
    console.log('seeding user info');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
        // seedData.push(generateUserData());
        seedData.push({
            email               : faker.internet.email(),
            password            : faker.internet.password(), 
            firstnamelastname   : faker.name.findName(),
            whereareyoufrom     : faker.address.country(), 
            relationship        : faker.name.jobTitle(),
            giftforex           : faker.commerce.product()
        });
    }
    
    return TestUser.insertMany(seedData);
}

// =====================================================
// making all the seed data=============================
//======================================================


// function generateUserData() {
//     return {
//         email               : faker.internet.email(),
//         password            : faker.internet.password(), 
//         firstnamelastname   : faker.name.findName(),
//         whereareyoufrom     : faker.address.country(), 
//         relationship        : faker.name.jobTitle(),
//         giftforex           : faker.commerce.product()
//     }
// }
 
// =========================================================
// Starting the test code ==================================
// =========================================================

describe('gift exchange API that sometimes works', function() {

    // =========================================================
    // Hooks and promises to start, run, teardown, and close ===
    // =========================================================

    before(function() {
        return runServer(TEST_DATABASE_URL); 
    }) ; //need to add runServer function to server.js

    beforeEach(function() {
        return seedUserData();
    });

    afterEach(function(){
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    })

    // ===========================================================
    // Testing the endpoints======================================
    // ===========================================================


    // ===========================================================
    // Testing GET endpoints======================================
    // ===========================================================

    describe('Get endpoint', function() {
        it(' should return the all exiting users', function() {
                // strategy:
                //    1. get back all users returned by by GET request to `/users`
                //    2. prove res has right status, data type (200,or 304)
                //    3. prove the number of users we got back is equal to number
                //       in db.
                //
                // need to have access to mutate and access `res` across
                // `.then()` calls below, so declare it here so can modify in place
            let res;
            
            return chai.requests(app)
                .get('/users')
                .then(function(_res) {
                    res=_res;
                    expect(res).to.have.status(200);
                    expect(res.body.users).to.have.lengthOf.at.least(1);
                    return TestUser.count();
                })
                .then(function(count) {
                    expect(res.body.restaurants).to.have.lengthOf(count);
                });
        });

        it('should return the right fields', function() {
            // Strategy: get users and make sure they have the right fields

            let resUsers;
            return chai.request(app)
                .get('/users')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.lengthOf.at.least(1);

                    res.body.forEach(function(user) {
                        expect(user).to.be.a('object');
                        expect(user).to.include.keys('email', 'password', 'firstnamelastname', 'whereareyoufrom');
                    });
                    resUsers =res.body[0];
                    return TestUser.findById(resUsers.id);
                })
                //Not all information is compared, more to save time than any purpose
                .then(function(user) {
                    expect(resUsers.email).to.equal(user.email);
                    expect(resUsers.password).to.equal(user.password);
                    expect(resUsers.firstnamelastname).to.equal(user.firstnamelastname);
                    expect(resUsers.whereareyoufrom).to.equal(user.whereareyoufrom);
                });
        });
    });
    // ===========================================================
    // Testing POST endpoints=====================================
    // ===========================================================
    
    describe('Testing the POST endpoint', function() {
        // strategy: 
        // make a POST request with data,
        // then prove that the user we get back has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)
        
        it('should add a new user to the db', function() {
            const newUser = {
                email               : faker.internet.email(),
                password            : faker.internet.password(), 
                firstnamelastname   : faker.name.findName(),
                whereareyoufrom     : faker.address.country(), 
                relationship        : faker.name.jobTitle(),
                giftforex           : faker.commerce.product()
            }

            return chai.request(app)
                .post('/users')
                .send(newUser)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('email', 'password', 'firstnamelastname', 'whereareyoufrom');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.email).to.equal(newUser.email);
                    expect(res.body.password).to.equal(newUser.password);
                    expect(res.body.firstnamelastname).to.equal(newUser.firstnamelastname);
                    expect(res.body.whereareyoufrom).to.equal(newUser.whereareyoufrom);
                    return TestUser.findById(res.body.id);
                })
                .then(function (post){
                    expect(post.email).to.equal(newUser.email);
                    expect(post.password).to.equal(newUser.password);
                    expect(post.firstnamelastname).to.equal(newUser.firstnamelastname);
                    expect(post.whereareyoufrom).to.equal(newUser.whereareyoufrom);
                });
        });
    });

    // ===========================================================
    // Testing PUT endpoints======================================
    // ===========================================================


    describe('PUT endpoint', function() {
        // strategy:
        // get and existing user from db
        // make a put request to update
        // prove returned data matches the info we sent 
        // prove user in db is correctly updated
        
        it('should update fields selected', function() {
            const updateData = {
                email               : 'test@testemail.com',
                password            : 'password', 
                firstnamelastname   : 'Test Testerson',
                whereareyoufrom     : 'Testland'
            }

            return TestUser
            .findOne()
            .then(function(user) {
                updateData.id = user.id;

                return chai.request(app)
                    .put(`/users/${user.id}`)
                    .send(updateData);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
      
                return TestUser.findById(updateData.id);
            })
            .then(function (post){
                expect(post.email).to.equal(updateData.email);
                expect(post.password).to.equal(updateData.password);
                expect(post.firstnamelastname).to.equal(updateData.firstnamelastname);
                expect(post.whereareyoufrom).to.equal(updateData.whereareyoufrom);
            });
        });
    });
    
    // ===========================================================
    // Testing DELETE endpoints===================================
    // ===========================================================

    describe('DELETE endpoint', function() {
        // strategy:
        // get and existing user from db
        // make a delete request for that users id
        // check that the status code is correct 
        // prove that id is no longer in the db

        it('should delete a post by the ID', function() {

            let user;

            return TestUser
                .findOne()
                .then(function(_user) {
                    _user = user;
                    return chai.request(app).delete(`/users/${user.id}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return TestUser.findById(user.id);
                })
                .then(function(_user) {
                    expect(_user).to.be.null;
                });
        });
    });
});