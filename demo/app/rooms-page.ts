import * as observable from 'data/observable';
import * as pages from 'ui/page';
import { HomeKit, Home, Room } from 'nativescript-homekit';
import { action, alert, prompt, PromptResult } from "ui/dialogs";
let observableArray = require("data/observable-array");
import * as frameModule from "ui/frame";

let _home: Home;
let _homekit: HomeKit;
let _model = {};

export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  _home = page.navigationContext.home;
  page.actionBar.title = _home.name;

  _homekit = new HomeKit();
  _model["rooms"] = new observableArray.ObservableArray();
  _model["rooms"].push(_home.rooms);
  page.bindingContext = _model;
}

export function addRoom(): void {
  prompt("Name of the room to add").then((promptResult: PromptResult) => {
    if (promptResult.result) {
      _homekit.addRoomToHome(promptResult.text, _home.name).then((room: Room) => {
        _model["rooms"].push(room);
      }, err => alert(err));
    }
  });
}

export function onRoomItemTap(args): void {
  let r: Room = _model["rooms"].getItem(args.index);

  action({
    message: `What to do with room '${r.name}'?`,
    actions: ["Delete it", "Rename it", "Assign an accessory"],
    cancelable: true,
    cancelButtonText: "Nothing, I'm good"
  }).then((pickedAction: string) => {
    if (pickedAction !== "Nothing, I'm good") {
      if (pickedAction === "Delete it") {
        deleteRoom(r.name);
      } else if (pickedAction === "Rename it") {
        changeRoomName(r, args.index);
      } else if (pickedAction === "Assign an accessory") {
        assignAccessoryToRoom(r);
      }
    }
  });
}

function assignAccessoryToRoom(room: Room): void {
  let accNames: Array<string> = [];
  for (let i = 0; i < _home.accessories.length; i++) {
    accNames[i] = _home.accessories[i].name;
  }
  const that = this;
  action({
    message: `Assign this accessory to room '${room.name}':`,
    actions: accNames,
    cancelable: true,
    cancelButtonText: "Never mind"
  }).then((pickedAccName: string) => {
    if (pickedAccName !== "Never mind") {
      _homekit.assignAccessoryToRoom(pickedAccName, room.name, _home.name).then(
          (rooms: Array<Room>) => {
            _model["rooms"].splice(0, _model["rooms"].length);
            _model["rooms"].push(rooms);
          },
          (err) => alert(err)
      );
    }
  });
}

function changeRoomName(room: Room, index: number): void {
  prompt(`Rename room '${room.name}' to..`, room.name).then((promptResult: PromptResult) => {
    if (promptResult.result) {
      _homekit.renameRoom(room.name, promptResult.text, _home.name).then((room: Room) => {
        _model["rooms"].setItem(index, room);
      }, err => alert(err));
    }
  });
}

function deleteRoom(name: string): void {
  _homekit.removeRoomFromHome(name, _home.name).then((room: Room) => {
    for (let i = 0; i < _model["rooms"].length; i++) {
      let r: Room = _model["rooms"].getItem(i);
      if (r.name === room.name) {
        _model["rooms"].splice(i, 1);
        break;
      }
    }
  }, err => alert(err));
}

function navigateToAccessories(room: Room): void {
  frameModule.topmost().navigate({
    moduleName: "accessories-page",
    context: {
      room: room
    },
    animated: true
  });
}
