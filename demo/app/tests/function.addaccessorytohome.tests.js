var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

describe("addAccessoryToHome", function () {
  it("exists", function () {
    expect(homekit.addAccessoryToHome).toBeDefined();
  });

  // note that this requires a strict test order
  it("requires you to call 'init' first", function (done) {
    homekit.addAccessoryToHome().then(
        function () {
          fail("Promised resolved, but should have been rejected");
        },
        function (err) {
          expect(err).toEqual("Run 'init' first");
          done();
        }
    );
  });
});