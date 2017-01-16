// Add Meteor Collection 
import { Accounts } from 'meteor/accounts-base';
// Add Assertion library Chai - Assert
var assert  = require("chai").assert;

// Description of Test
describe("User Registration", function() {
// Test on the Client-site
    if (Meteor.isClient){
        // IT Module - Registration of User
        it("User was registered successfully", function(callback) {
            // Creation of User with CreateUser Methode
        var id =  Accounts.createUser({
                    username: "user1", 
                    email: "user1@test.com", 
                    password: "123456"}); 
            assert.isNotNull(id);      
            callback();
        });
    }

// Test on the Sever-site
    if (Meteor.isServer){
        // Find User and check, if data was saved
        var user = Accounts.findUserByEmail("user1@test.com");
        // IT Module - User found
        it("User found", function(callback) {
            assert.equal(user.username, 'user1');          
            callback();
        }); 
    }     
});