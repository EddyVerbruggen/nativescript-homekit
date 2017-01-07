var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

describe("stopSearchingForAccessories", function () {
  it("exists", function () {
    expect(homekit.stopSearchingForAccessories).toBeDefined();
  });
});