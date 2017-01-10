import { HomeKitApi, Home, Zone, Room, Accessory, Service, Characteristic } from "./homekit.common";

let _homeManager: HMHomeManager = null;
let _accessoryBrowser: HMAccessoryBrowser = null;

export class HomeKit implements HomeKitApi {

  init(onHomesUpdated: (homes: Array<Home>) => void): Promise<any> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!onHomesUpdated) {
        reject("Pass in a function that will receive the discovered homes");
        return;
      }
      // see https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/HomeKitDeveloperGuide/FindingandAddingAccessories/FindingandAddingAccessories.html#//apple_ref/doc/uid/TP40015050-CH3-SW1
      _homeManager = HMHomeManager.new();
      _homeManager.delegate = HMHomeManagerDelegateImpl.new().initWithCallback(() => {
        let newHomes: Array<Home> = that.getHomes();
        onHomesUpdated(newHomes);
      });
      // could pass back the manager: resolve(that.homeManager);
      resolve();
    });
  }

  startSearchingForAccessories(onAccessoryFound: (accessory: Accessory) => void, onAccessoryRemoved?: (accessory: Accessory) => void): Promise<any> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!onAccessoryFound) {
        reject("Pass in a function that will receive newly found accessories");
        return;
      }
      _accessoryBrowser = HMAccessoryBrowser.new();
      _accessoryBrowser.delegate = HMAccessoryBrowserDelegateImpl.new().initWithCallback((accessory: HMAccessory, removed: boolean) => {
        if (removed) {
          if (onAccessoryRemoved) {
            onAccessoryRemoved(HomeKit.transformAccessory(accessory));
          }
        } else {
          onAccessoryFound(HomeKit.transformAccessory(accessory));
        }
      });
      _accessoryBrowser.startSearchingForNewAccessories();
      resolve();
    });
  }

  stopSearchingForAccessories(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (_accessoryBrowser !== null) {
        _accessoryBrowser.stopSearchingForNewAccessories();
        // _accessoryBrowser = null;
      }
      resolve();
    });
  }

  private getHomes(): Array<Home> {
    let homes: Array<Home> = [];
    for (let i: number = 0; i < _homeManager.homes.count; i++) {
      let home = _homeManager.homes.objectAtIndex(i);
      homes.push(HomeKit.transformHome(home));
    }
    return homes;
  }

  available(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  };

  addHome(name: string): Promise<Home> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }
      _homeManager.addHomeWithNameCompletionHandler(name, (home, error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformHome(home));
        }
      })
    });
  }

  removeHome(name: string): Promise<Home> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }
      let home: HMHome = HomeKit.findHome(name);
      if (!home) {
        reject(`No home found for name '${home}'`);
        return;
      }
      _homeManager.removeHomeCompletionHandler(home, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformHome(home));
        }
      })
    });
  }

  renameHome(oldName: string, newName: string): Promise<Home> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(oldName);
      if (!home) {
        reject(`No home found for name '${oldName}'`);
        return;
      }

      home.updateNameCompletionHandler(newName, (error) => {
        if (error) {
          reject(error.localizedDescription);
        } else {
          resolve(HomeKit.transformHome(home));
        }
      });
    });
  };

  addZone(name: string, toHome: string): Promise<Zone> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(toHome);
      if (!home) {
        reject(`No home found for name '${toHome}'`);
        return;
      }

      home.addZoneWithNameCompletionHandler(name, (zone, error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformZone(zone));
        }
      })
    });
  }

  removeZone(name: string, fromHome: string): Promise<Zone> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(fromHome);
      if (!home) {
        reject(`No home found for name '${fromHome}'`);
        return;
      }

      let zone: HMZone = HomeKit.findZone(name, home);
      if (!zone) {
        reject(`No zone found for name '${name}'`);
        return;
      }

      home.removeZoneCompletionHandler(zone, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformZone(zone));
        }
      })
    });
  }

  renameZone(oldName: string, newName: string, inHome: string): Promise<Zone> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(inHome);
      if (!home) {
        reject(`No home found for name '${inHome}'`);
        return;
      }

      let zone: HMZone = HomeKit.findZone(oldName, home);
      if (!zone) {
        reject(`No zone found for name '${oldName}'`);
        return;
      }

      zone.updateNameCompletionHandler(newName, (error) => {
        if (error) {
          reject(error.localizedDescription);
        } else {
          resolve(HomeKit.transformZone(zone));
        }
      });
    });
  };

  addRoomToHome(name: string, toHome: string): Promise<Room> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(toHome);
      if (!home) {
        reject(`No home found for name '${toHome}'`);
        return;
      }

      home.addRoomWithNameCompletionHandler(name, (room, error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformRoom(room));
        }
      })
    });
  }

  addRoomToZone(name: string, toZone: string, inHome: string): Promise<Zone> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(inHome);
      if (!home) {
        reject(`No home found for name '${inHome}'`);
        return;
      }

      let room: HMRoom = HomeKit.findRoom(name, home);
      if (!room) {
        reject(`No room found for name '${name}'`);
        return;
      }

      let zone: HMZone = HomeKit.findZone(toZone, home);
      if (!zone) {
        reject(`No zone found for name '${toZone}'`);
        return;
      }

      zone.addRoomCompletionHandler(room, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformZone(zone));
        }
      })
    });
  }

  removeRoomFromHome(name: string, fromHome: string): Promise<Room> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(fromHome);
      if (!home) {
        reject(`No home found for name '${fromHome}'`);
        return;
      }

      let room: HMRoom = HomeKit.findRoom(name, home);
      if (!room) {
        reject(`No room found for name '${name}'`);
        return;
      }

      home.removeRoomCompletionHandler(room, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformRoom(room));
        }
      })
    });
  }

  removeRoomFromZone(name: string, fromZone: string, inHome: string): Promise<Zone> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(inHome);
      if (!home) {
        reject(`No home found for name '${inHome}'`);
        return;
      }

      let room: HMRoom = HomeKit.findRoom(name, home);
      if (!room) {
        reject(`No room found for name '${name}'`);
        return;
      }

      let zone: HMZone = HomeKit.findZone(fromZone, home);
      if (!zone) {
        reject(`No zone found for name '${fromZone}'`);
        return;
      }

      zone.removeRoomCompletionHandler(room, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformZone(zone));
        }
      })
    });
  }

  renameRoom(oldName: string, newName: string, inHome: string): Promise<Room> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(inHome);
      if (!home) {
        reject(`No home found for name '${inHome}'`);
        return;
      }

      let room: HMRoom = HomeKit.findRoom(oldName, home);
      if (!room) {
        reject(`No room found for name '${oldName}'`);
        return;
      }

      room.updateNameCompletionHandler(newName, (error) => {
        if (error) {
          reject(error.localizedDescription);
        } else {
          resolve(HomeKit.transformRoom(room));
        }
      });
    });
  };

  addAccessoryToHome(accessoryName: string, toHome: string): Promise<Home> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      if (_accessoryBrowser === null) {
        reject("Please search for accessories first");
        return;
      }

      let home: HMHome = HomeKit.findHome(toHome);
      if (!home) {
        reject(`No home found for name '${toHome}'`);
        return;
      }

      let accessory: HMAccessory = HomeKit.findAccessory(accessoryName);
      if (!accessory) {
        reject(`No accessory found for name '${accessoryName}'`);
        return;
      }

      home.addAccessoryCompletionHandler(accessory, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformHome(home));
        }
      })
    });
  }

  removeAccessoryFromHome(accessoryName: string, fromHome: string): Promise<Home> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(fromHome);
      if (!home) {
        reject(`No home found for name '${fromHome}'`);
        return;
      }

      let accessory: HMAccessory = HomeKit.findAccessoryInHome(accessoryName, home);
      if (!accessory) {
        reject(`No accessory found for name '${accessoryName}'`);
        return;
      }

      home.removeAccessoryCompletionHandler(accessory, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          resolve(HomeKit.transformHome(home));
        }
      })
    });
  }

  assignAccessoryToRoom(accessoryName: string, roomName: string, inHome: string): Promise<Array<Room>> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (!_homeManager) {
        reject("Run 'init' first");
        return;
      }

      let home: HMHome = HomeKit.findHome(inHome);
      if (!home) {
        reject(`No home found for name '${inHome}'`);
        return;
      }

      let room: HMRoom = HomeKit.findRoom(roomName, home);
      if (!room) {
        reject(`No room found for name '${roomName}' in home with name '${inHome}'`);
        return;
      }

      let accessory: HMAccessory = HomeKit.findAccessoryInHome(accessoryName, home);
      if (!accessory) {
        reject(`No accessory found for name '${accessoryName}' in home with name '${inHome}'`);
        return;
      }

      if (accessory.room == room) {
        // already assigned, just return
        resolve();
        return;
      }

      home.assignAccessoryToRoomCompletionHandler(accessory, room, (error) => {
        if (error) {
          reject(error.localizedDescription)
        } else {
          // since an accessory can be moved from one room to the other we'd better return all the rooms
          resolve(HomeKit.transformRooms(home.rooms));
        }
      })
    });
  }

  renameAccessory(oldName: string, newName: string): Promise<Accessory> {
    const that = this;
    return new Promise((resolve, reject) => {
      if (_accessoryBrowser === null) {
        reject("Please search for accessories first");
        return;
      }

      let accessory: HMAccessory = HomeKit.findAccessory(oldName);
      if (!accessory) {
        reject(`No accessory found for name '${oldName}'`);
        return;
      }

      accessory.updateNameCompletionHandler(newName, (error) => {
        if (error) {
          reject(error.localizedDescription);
        } else {
          resolve(HomeKit.transformAccessory(accessory));
        }
      });
    });
  };

  // - helper functions

  private static findHome(name: string): HMHome {
    for (let i: number = 0; i < _homeManager.homes.count; i++) {
      let home = _homeManager.homes.objectAtIndex(i);
      if (home.name === name) {
        return home;
      }
    }
    return null;
  }

  private static findZone(name: string, inHome: HMHome): HMZone {
    for (let i: number = 0; i < inHome.zones.count; i++) {
      let zone = inHome.zones.objectAtIndex(i);
      if (zone.name === name) {
        return zone;
      }
    }
    return null;
  }

  private static findRoom(name: string, inHome: HMHome): HMRoom {
    for (let i: number = 0; i < inHome.rooms.count; i++) {
      let room = inHome.rooms.objectAtIndex(i);
      if (room.name === name) {
        return room;
      }
    }
    return null;
  }

  private static findAccessory(name: string): HMAccessory {
    for (let i: number = 0; i < _accessoryBrowser.discoveredAccessories.count; i++) {
      let acc = _accessoryBrowser.discoveredAccessories.objectAtIndex(i);
      if (acc.name === name) {
        return acc;
      }
    }
    return null;
  }

  private static findAccessoryInHome(name: string, inHome: HMHome): HMAccessory {
    for (let i: number = 0; i < inHome.accessories.count; i++) {
      let acc = inHome.accessories.objectAtIndex(i);
      if (acc.name === name) {
        return acc;
      }
    }
    return null;
  }

  private static transformHome(home: HMHome): Home {
    return  {
      name: home.name,
      primary: home.primary,
      rooms: HomeKit.transformRooms(home.rooms),
      accessories: HomeKit.transformAccessories(home.accessories),
      zones: HomeKit.transformZones(home.zones),
      ios: home,
    };
  }

  private static transformRooms(nrooms: NSArray<HMRoom>): Array<Room> {
    let rooms: Array<Room> = [];
    for (let i: number = 0; i < nrooms.count; i++) {
      rooms.push(HomeKit.transformRoom(nrooms.objectAtIndex(i)));
    }
    return rooms;
  }

  private static transformRoom(nroom: HMRoom, skipAccessories?: boolean): Room {
    if (!nroom) {
      return null;
    }
    return {
      name: nroom.name,
      accessories: skipAccessories ? null : HomeKit.transformAccessories(nroom.accessories),
      ios: nroom
    };
  }

  private static transformAccessories(naccessories: NSArray<HMAccessory>): Array<Accessory> {
    let accessories: Array<Accessory> = [];
    for (let i: number = 0; i < naccessories.count; i++) {
      accessories.push(HomeKit.transformAccessory(naccessories.objectAtIndex(i)));
    }
    return accessories;
  }

  private static transformAccessory(acc: HMAccessory): Accessory {
    return {
      name: acc.name,
      bridged: acc.bridged,
      room: HomeKit.transformRoom(acc.room, true),
      services: HomeKit.transformServices(acc.services),
      ios: acc
    };
  }

  private static transformZones(nzones: NSArray<HMZone>): Array<Zone> {
    let zones: Array<Zone> = [];
    for (let i: number = 0; i < nzones.count; i++) {
      zones.push(HomeKit.transformZone(nzones.objectAtIndex(i)));
    }
    return zones;
  }

  private static transformZone(zone: HMZone): Zone {
    return {
      name: zone.name,
      rooms: HomeKit.transformRooms(zone.rooms),
      ios: zone
    };
  }

  private static transformServices(nservices: NSArray<HMService>): Array<Service> {
    let services: Array<Service> = [];
    for (let i: number = 0; i < nservices.count; i++) {
      let ns = nservices.objectAtIndex(i);
      // as mentioned by Apple unnamed services should not be exposed to users, so this prolly makes sense
      if (ns.name) {
        services.push(HomeKit.transformService(nservices.objectAtIndex(i)));
      }
    }
    return services;
  }

  private static transformService(service: HMService): Service {
    return {
      name: service.name,
      type: service.serviceType,
      characteristics: HomeKit.transformCharacteristics(service.characteristics),
      ios: service
    };
  }

  private static transformCharacteristics(ncharacteristics: NSArray<HMCharacteristic>): Array<Characteristic> {
    let characteristics: Array<Characteristic> = [];
    for (let i: number = 0; i < ncharacteristics.count; i++) {
      characteristics.push(HomeKit.transformCharacteristic(ncharacteristics.objectAtIndex(i)));
    }
    return characteristics;
  }

  private static transformCharacteristic(characteristic: HMCharacteristic): Characteristic {
    return {
      type: characteristic.characteristicType,
      description: characteristic.localizedDescription,
      ios: characteristic
    };
  }
}


// - delegates

class HMHomeManagerDelegateImpl extends NSObject implements HMHomeManagerDelegate {
  public static ObjCProtocols = [HMHomeManagerDelegate];

  static new(): HMHomeManagerDelegateImpl {
    return <HMHomeManagerDelegateImpl>super.new();
  }

  private _callback: () => void;

  public initWithCallback(callback: () => void): HMHomeManagerDelegateImpl {
    this._callback = callback;
    return this;
  }

  public homeManagerDidUpdateHomes(manager) {
    if (this._callback) {
      this._callback();
    } else {
      console.trace();
      console.log("--- callback lost a");
    }
  }
}

// https://developer.apple.com/reference/homekit/hmaccessorybrowserdelegate?language=objc
class HMAccessoryBrowserDelegateImpl extends NSObject implements HMAccessoryBrowserDelegate {
  public static ObjCProtocols = [HMAccessoryBrowserDelegate];

  static new(): HMAccessoryBrowserDelegateImpl {
    return <HMAccessoryBrowserDelegateImpl>super.new();
  }

  private _callback: (accessory: HMAccessory, removed: boolean) => void;

  public initWithCallback(callback: (accessory: HMAccessory, removed: boolean) => void): HMAccessoryBrowserDelegateImpl {
    this._callback = callback;
    return this;
  }

  public accessoryBrowserDidFindNewAccessory(browser: HMAccessoryBrowser, accessory: HMAccessory) {
    if (this._callback) {
      this._callback(accessory, false);
    } else {
      console.trace();
      console.log("--- callback lost b");
    }
  }

  public accessoryBrowserDidRemoveNewAccessory(browser: HMAccessoryBrowser, accessory: HMAccessory) {
    if (this._callback) {
      this._callback(accessory, true);
    } else {
      console.trace();
      console.log("--- callback lost c");
    }
  }
}