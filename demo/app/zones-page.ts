import * as observable from 'data/observable';
import * as pages from 'ui/page';
import { HomeKit, Home, Zone, Room } from 'nativescript-homekit';
import { action, alert, prompt, PromptResult } from "ui/dialogs";
let observableArray = require("data/observable-array");

let _home: Home;
let _homekit: HomeKit;
let _model = {};

export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  _home = page.navigationContext.home;
  page.actionBar.title = _home.name;

  _homekit = new HomeKit();
  _model["zones"] = new observableArray.ObservableArray();
  _model["zones"].push(_home.zones);
  page.bindingContext = _model;
}

export function addZone(): void {
  prompt("Name of the zone to add").then((promptResult: PromptResult) => {
    if (promptResult.result) {
      _homekit.addZone(promptResult.text, _home.name).then((zone: Zone) => {
        _model["zones"].push(zone);
      }, err => alert(err));
    }
  });
}

export function onZoneItemTap(args): void {
  let z: Zone = _model["zones"].getItem(args.index);
  let removeRoomPrefix: string = "Remove room: ";

  let actions: Array<string> = ["Delete it", "Rename it", "Add a room"];
  for (let i = 0; i < z.rooms.length; i++) {
    actions.push(`${removeRoomPrefix}${z.rooms[i].name}`);
  }

  action({
    message: `What to do with zone '${z.name}'?`,
    actions: actions,
    cancelable: true,
    cancelButtonText: "Nothing, I'm good"
  }).then((pickedAction: string) => {
    if (pickedAction !== "Nothing, I'm good") {
      if (pickedAction === "Delete it") {
        deleteZone(z.name);
      } else if (pickedAction === "Rename it") {
        changeZoneName(z, args.index);
      } else if (pickedAction === "Add a room") {
        addRoomToZone(z);
      } else if (pickedAction.indexOf(removeRoomPrefix) === 0) {
        let roomToRemove = pickedAction.substring(removeRoomPrefix.length);
        console.log("remove room: " + roomToRemove);
        _homekit.removeRoomFromZone(roomToRemove, z.name, _home.name).then(
            (zone: Zone) => {
              for (let i = 0; i < _model["zones"].length; i++) {
                let z: Zone = _model["zones"].getItem(i);
                if (z.name === zone.name) {
                  _model["zones"].setItem(i, zone);
                  break;
                }
              }
            }, err => alert(err));
      }
    }
  });
}

function addRoomToZone(zone: Zone): void {
  let roomNames: Array<string> = [];
  for (let i = 0; i < _home.rooms.length; i++) {
    roomNames[i] = _home.rooms[i].name;
  }
  action({
    message: `Add this room to zone '${zone.name}':`,
    actions: roomNames,
    cancelable: true,
    cancelButtonText: "Cancel"
  }).then((pickedRoomName: string) => {
    if (pickedRoomName !== "Cancel") {
      console.log("--- picked room: " + pickedRoomName);
      _homekit.addRoomToZone(pickedRoomName, zone.name, _home.name).then(
          (zone: Zone) => {
            for (let i = 0; i < _model["zones"].length; i++) {
              let z: Zone = _model["zones"].getItem(i);
              if (z.name === zone.name) {
                _model["zones"].setItem(i, zone);
                break;
              }
            }
          }, err => alert(err));
    }
  });
}

function changeZoneName(zone: Zone, index: number): void {
  prompt(`Rename zone '${zone.name}' to..`, zone.name).then((promptResult: PromptResult) => {
    if (promptResult.result) {
      _homekit.renameZone(zone.name, promptResult.text, _home.name).then((zone: Zone) => {
        _model["zones"].setItem(index, zone);
      }, err => alert(err));
    }
  });
}

function deleteZone(name: string): void {
  _homekit.removeZone(name, _home.name).then((zone: Zone) => {
    for (let i = 0; i < _model["zones"].length; i++) {
      let z: Zone = _model["zones"].getItem(i);
      if (z.name === zone.name) {
        _model["zones"].splice(i, 1);
        break;
      }
    }
  }, err => alert(err));
}