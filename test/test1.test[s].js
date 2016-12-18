var assert  = require("chai").assert;
var expect  = require("chai").expect;
var request = require("request");

// Local
  var ggURL = "http://localhost:3000/";
// Server  
  var ggURLServer = "141.45.92.211:3000";

  describe("HTTP Request geoGreen", function() {
    it("Local: Returns status 200", function(done) {
         request(ggURL, function(error, response, body) {
         assert.equal(200, response.statusCode);
         done();
       });
    });   
    it("Sever: Returns status 200", function(done) {
         request(ggURLServer, function(error, response, body) {
         if (response){
            assert.equal("OK", response.statusMessage);
            done();
        }else{
            expect(error).to.be.empty;
            done();
        }
       });
    });     
});