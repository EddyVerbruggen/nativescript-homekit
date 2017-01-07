import { Observable } from 'data/observable';
import { HomeKit, Home, Accessory } from 'nativescript-homekit';
import { action, alert, prompt, PromptResult } from "ui/dialogs";
import * as frameModule from "ui/frame";
import { ObservableArray } from "data/observable-array";
// let observableArray = require("data/observable-array");

declare let JSON: any;

export class HelloWorldModel extends Observable {
  private homekit: HomeKit;

  public homes: ObservableArray<Home> = new ObservableArray<Home>();
  public accessories: ObservableArray<Accessory> = new ObservableArray<Accessory>();
  public searching: boolean = false;

  constructor() {
    super();

    this.homekit = new HomeKit();
    const that = this;
    this.homekit.available().then(avail => {
      if (avail) {
        that.homekit.init((homes: Array<Home>) => {
          that.homes.push(homes);
        });
      }
    }, err => alert(err));
  }

  public startSearching(): void {
    this.accessories.splice(0, this.accessories.length);
    const that = this;
    this.homekit.startSearchingForAccessories(
        (accessory: Accessory) => {
          that.accessories.push(accessory);
          console.log("Accessory found: " + accessory.name);
          // you can use this to further interact with the accessory:
          console.log("Accessory native object: " + accessory.ios);
        },
        (accessory: Accessory) => {
          for (let i = 0; that.accessories.length; i++) {
            if (that.accessories.getItem(i).name === accessory.name) {
              that.accessories.splice(i, 1);
              break;
            }
          }
        }).then(
            () => {console.log("searching.. "); that.searching = true},
            (err) => alert(err)
    );
  };

  public stopSearching(): void {
    const that = this;
    this.homekit.stopSearchingForAccessories().then(() => that.searching = true);
  };

  public onAccessoryTap(args): void {
    let accessory: Accessory = this.accessories.getItem(args.index);
    let homeNames: Array<string> = [];
    for (let i = 0; i < this.homes.length; i++) {
      homeNames[i] = this.homes.getItem(i).name;
    }
    let that = this;
    action({
      message: `Assign '${accessory.name}' to this Home:`,
      actions: homeNames,
      cancelable: true,
      cancelButtonText: "Leave homeless"
    }).then((pickedHomeName: string) => {
      if (pickedHomeName !== "Leave homeless") {
        that.homekit.addAccessoryToHome(accessory.name, pickedHomeName).then((home: Home) => {
          for (let i = 0; i < that.homes.length; i++) {
            let h: Home = that.homes.getItem(i);
            if (h.name === home.name) {
              that.homes.setItem(i, home);
              break;
            }
          }
        }, err => alert(err));
      }
    });
  }

  public addHome(): void {
    let that = this;
    prompt("Name the home").then((promptResult: PromptResult) => {
      if (promptResult.result) {
        this.homekit.addHome(promptResult.text).then((home: Home) => {
          console.log(JSON.stringify(home));
          that.homes.push(home);
        }, err => alert(err));
      }
    });
  };

  public onHomeItemTap(args): void {
    let that = this;
    let h: Home = that.homes.getItem(args.index);

    let actions: Array<string> = ["Delete it", "Rename it", "Manage its rooms", "Manage its zones"];

    let removeAccPrefix: string = "Remove accessory: ";
    for (let i = 0; i < h.accessories.length; i++) {
      actions.push(`${removeAccPrefix}${h.accessories[i].name}`);
    }

    action({
      message: `What to do with home '${h.name}'?`,
      actions: actions,
      cancelable: true,
      cancelButtonText: "Err, nothing"
    }).then((pickedAction: string) => {
      if (pickedAction !== "Err, nothing") {
        if (pickedAction === "Delete it") {
          that.deleteHome(h.name);
        } else if (pickedAction === "Rename it") {
          that.changeHomeName(h.name, args.index);
        } else if (pickedAction === "Manage its rooms") {
          HelloWorldModel.navigateToRooms(h);
        } else if (pickedAction === "Manage its zones") {
          HelloWorldModel.navigateToZones(h);
        } else if (pickedAction.indexOf(removeAccPrefix) === 0) {
          let accToRemove = pickedAction.substring(removeAccPrefix.length);
          this.homekit.removeAccessoryFromHome(accToRemove, h.name).then(
              (home: Home) => {
                for (let i = 0; i < that.homes.length; i++) {
                  let hm: Home = that.homes.getItem(i);
                  if (hm.name === home.name) {
                    that.homes.setItem(i, home);
                    break;
                  }
                }
              }, err => alert(err));
        }
      }
    });
  }

  private changeHomeName(name: string, index: number): void {
    const that = this;
    prompt(`Rename home '${name}' to..`, name).then((promptResult: PromptResult) => {
      if (promptResult.result) {
        that.homekit.renameHome(name, promptResult.text).then((home: Home) => {
          that.homes.setItem(index, home);
        }, err => alert(err));
      }
    });
  }

  private deleteHome(name: string): void {
    const that = this;
    this.homekit.removeHome(name).then((home: Home) => {
      for (let i = 0; i < that.homes.length; i++) {
        let h: Home = that.homes.getItem(i);
        if (h.name === home.name) {
          that.homes.splice(i, 1);
          break;
        }
      }
    }, err => alert(err));
  }

  // TODO move to acc page
  private changeAccessoryName(accessory: Accessory): void {
    prompt(`Rename accessory '${accessory.name}' to..`, accessory.name).then((promptResult: PromptResult) => {
      if (promptResult.result) {
        this.homekit.renameAccessory(accessory.name, promptResult.text).then((accessory: Accessory) => {
          alert("Accessory renamed!");
          accessory.name = promptResult.text;
        }, err => alert(err));
      }
    });
  }

  private static navigateToRooms(home: Home): void {
    frameModule.topmost().navigate({
      moduleName: "rooms-page",
      context: {
        home: home
      },
      animated: true
    });
  }

  private static navigateToZones(home: Home): void {
    frameModule.topmost().navigate({
      moduleName: "zones-page",
      context: {
        home: home
      },
      animated: true
    });
  }
}