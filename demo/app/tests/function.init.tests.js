var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

describe("init", function () {
  it("exists", function () {
    expect(homekit.init).toBeDefined();
  });

  it("expects a callback function", function (done) {
    homekit.init().then(
        function () {
          fail("Promised resolved, but should have been rejected");
        },
        function (err) {
          expect(err).toEqual("Pass in a function that will receive the discovered homes");
          done();
        }
    );
  });
});