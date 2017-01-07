var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

describe("startSearchingForAccessories", function () {
  it("exists", function () {
    expect(homekit.startSearchingForAccessories).toBeDefined();
  });

  it("expects a callback function", function (done) {
    homekit.startSearchingForAccessories().then(
        function () {
          fail("Promised resolved, but should have been rejected");
        },
        function (err) {
          expect(err).toEqual("Pass in a function that will receive newly found accessories");
          done();
        }
    );
  });
});