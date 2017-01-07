var HomeKit = require("nativescript-homekit").HomeKit;
var homekit = new HomeKit();

// TODO replace 'functionname' with an acual function name of your plugin class and run with 'npm test <platform>'
describe("functionname", function() {
  it("exists", function() {
    expect(homekit.functionname).toBeDefined();
  });

  it("returns a promise", function() {
    expect(homekit.functionname()).toEqual(jasmine.any(Promise));
  });
});