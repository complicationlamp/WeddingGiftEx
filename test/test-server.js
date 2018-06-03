'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();


const User = require('../app/models/user');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config/database');


chai.use(chaiHttp);



// ======================================================
// function to seed the data to the test-database========
// ======================================================

function seedUserData() {
    console.log('seeding user info');
    const seedData = [];

    for (let i=1; i<=10; i++) {
        seedData.push(generateUserData());
    }
    
    return User.insertMany(seedData);
}

// =====================================================
// making all the seed data=============================
//======================================================


function generateUserData() {
    return {
        email               : faker.internet.email(),
        password            : faker.internet.password(), 
        firstnamelastname   : faker.name.findName(),
        whereareyoufrom     : faker.address.country(), 
        relationship        : faker.name.jobTitle(),
        giftforex           : faker.commerce.product()
    }
}

// ======================================================
// Tearing the database down=============================
// ======================================================

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}
 
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

describe('Get endpoint', function() {
    it(' should return the all exiting users', function() {
        let res;
        return chai.requests(app)
            .get('/users')
            .then(function(_res) {
                res=_res;
                expect(res).to.have.status(200);
                expect(res.body.users).to.have.lengthOf.at.least(1);
                return Users.count();
            })
            .then(function(count) {
                expect(res.body.restaurants).to.have.lengthOf(count);
    })
})});