'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();


const User = require('../app/models/user');
const {app, runServer, closeServer} = require('../server');
const DATABASE = require('../config/database');
const TEST_DATABASE_URL = DATABASE.test;

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
    
  return User.insertMany(seedData);
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
  });

  // ===========================================================
  // Testing the endpoints======================================
  // ===========================================================


  // ===========================================================
  // Testing GET endpoints======================================
  // ===========================================================

  
            


    
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
      };

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
          return User.findById(res.body.id);
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
      };

      return User
        .findOne()
        .then(function(user) {
          updateData.id = user.id;

          return chai.request(app)
            .put(`/users/${user.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
      
          return User.findById(updateData.id);
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

      return User
        .findOne()
        .then(function(_user) {
          _user = user;
          return chai.request(app).delete(`/users/${user.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return User.findById(user.id);
        })
        .then(function(_user) {
          expect(_user).to.be.null;
        });
    });
  });
});