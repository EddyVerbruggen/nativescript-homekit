var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

describe("available", function () {
  it("exists", function () {
    expect(homekit.available).toBeDefined();
  });

  it("returns a promise", function () {
    expect(homekit.available()).toEqual(jasmine.any(Promise));
  });

  it("is available on iOS", function (done) {
    homekit.available().then(
        function (avail) {
          expect(avail).toBeTruthy();
          done();
        },
        function (err) {
          expect(err).toBeUndefined();
        });
  });
});