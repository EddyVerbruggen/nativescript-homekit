import * as observable from 'data/observable';
import * as pages from 'ui/page';
import { HomeKit, Room, Accessory } from 'nativescript-homekit';
import { action, alert, prompt, PromptResult } from "ui/dialogs";
let observableArray = require("data/observable-array");

let _room: Room;
let _homekit: HomeKit;
let _model = {};

export function pageLoaded(args: observable.EventData) {
  let page = <pages.Page>args.object;
  _room = page.navigationContext.room;
  page.actionBar.title = _room.name;

  _homekit = new HomeKit();
  _model["accessories"] = new observableArray.ObservableArray();
  _model["accessories"].push(_room.accessories);
  page.bindingContext = _model;
}

export function addAccessory(): void {
  prompt("Name of the accessory to add").then((promptResult: PromptResult) => {
    if (promptResult.result) {
      _homekit.addAccessory(promptResult.text, _room.name).then((accessory: Accessory) => {
        _model["accessories"].push(accessory);
      }, err => alert(err));
    }
  });
}

export function onAccessoryItemTap(args): void {
  let a: Accessory = _model["accessories"].getItem(args.index);

  action({
    message: `What to do with accessory '${a.name}'?`,
    actions: ["Delete it"]
  }).then((value: string) => {
    if (value === "Delete it") {
      deleteAccessory(a.name);
    }
  });
}

function deleteAccessory(name: string): void {
  _homekit.removeAccessory(name, _room.name).then((accessory: Accessory) => {
    for (let i = 0; i < _model["accessories"].length; i++) {
      let a: Accessory = _model["accessories"].getItem(i);
      if (a.name === accessory.name) {
        _model["accessories"].splice(i, 1);
        break;
      }
    }
  }, err => alert(err));
}