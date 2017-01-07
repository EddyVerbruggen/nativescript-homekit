export interface Accessory {
  name: string;
  bridged: boolean;
  room?: Room;
  ios: any; /* HMAccessory */
}

export interface Zone {
  name: string;
  rooms: Array<Room>;
  ios: any; /* HMZone */
}

export interface Room {
  name: string;
  accessories: Array<Accessory>;
  ios: any; /* HMRoom */
}

export interface Home {
  name: string;
  primary: boolean;
  rooms: Array<Room>;
  accessories: Array<Accessory>;
  zones: Array<Zone>;
  ios: any; /* HMHome */
}

export interface HomeKitApi {
  available(): Promise<boolean>;

  init(onHomesUpdated: (homes: Array<Home>) => void): Promise<any>;

  startSearchingForAccessories(onAccessoryFound: (accessory: Accessory) => void, onAccessoryRemoved?: (accessory: Accessory) => void): Promise<any>;
  stopSearchingForAccessories(): Promise<any>;

  addHome(name: string): Promise<Home>;
  removeHome(name: string): Promise<Home>;
  renameHome(oldName: string, newName: string): Promise<Home>;

  addAccessoryToHome(accessoryName: string, toHome: string): Promise<Home>;
  removeAccessoryFromHome(accessoryName: string, fromHome: string): Promise<Home>;

  addZone(name: string, toHome: string): Promise<Zone>;
  removeZone(name: string, fromHome: string): Promise<Zone>;
  renameZone(oldName: string, newName: string, inHome: string): Promise<Zone>;

  addRoomToZone(name: string, toZone: string, inHome: string): Promise<Zone>;
  removeRoomFromZone(name: string, fromZone: string, inHome: string): Promise<Zone>;

  addRoomToHome(name: string, toHome: string): Promise<Room>;
  removeRoomFromHome(name: string, fromHome: string): Promise<Room>;
  renameRoom(oldName: string, newName: string, inHome: string): Promise<Room>;

  assignAccessoryToRoom(accessoryName: string, roomName: string, homeName: string): Promise<Array<Room>>;

  renameAccessory(oldName: string, newName: string): Promise<Accessory>;
}

export class Common implements HomeKitApi {
  available(): Promise<boolean> {
    return Common.notAvailable();
  };

  init(onHomesUpdated: (homes: Array<Home>) => void): Promise<any> {
    return Common.notAvailable();
  };

  startSearchingForAccessories(onAccessoryFound: (accessory: Accessory) => void, onAccessoryRemoved?: (accessory: Accessory) => void): Promise<any> {
    return Common.notAvailable();
  }

  stopSearchingForAccessories(): Promise<any> {
    return Common.notAvailable();
  }

  addHome(name: string): Promise<Home> {
    return Common.notAvailable();
  }

  removeHome(name: string): Promise<Home> {
    return Common.notAvailable();
  }

  renameHome(oldName: string, newName: string): Promise<Home> {
    return Common.notAvailable();
  }

  addZone(name: string, toHome: string): Promise<Zone> {
    return Common.notAvailable();
  }

  removeZone(name: string, fromHome: string): Promise<Zone> {
    return Common.notAvailable();
  }

  renameZone(oldName: string, newName: string, inHome: string): Promise<Zone> {
    return Common.notAvailable();
  }

  addRoomToHome(name: string, toHome: string): Promise<Room> {
    return Common.notAvailable();
  }

  addRoomToZone(name: string, toZone: string, inHome: string): Promise<Zone> {
    return Common.notAvailable();
  }

  removeRoomFromHome(name: string, fromHome: string): Promise<Room> {
    return Common.notAvailable();
  }

  removeRoomFromZone(name: string, fromZone: string, inHome: string): Promise<Zone> {
    return Common.notAvailable();
  }

  renameRoom(oldName: string, newName: string, inHome: string): Promise<Room> {
    return Common.notAvailable();
  }

  addAccessoryToHome(accessoryName: string, toHome: string): Promise<Home> {
    return Common.notAvailable();
  }

  assignAccessoryToRoom(accessoryName: string, roomName: string, homeName: string): Promise<Array<Room>> {
    return Common.notAvailable();
  }

  renameAccessory(oldName: string, newName: string): Promise<Accessory> {
    return Common.notAvailable();
  };

  removeAccessoryFromHome(accessoryName: string, fromHome: string): Promise<Home> {
    return Common.notAvailable();
  };

  private static notAvailable() {
    return new Promise((resolve, reject) => {
      reject("Not available");
    });
  }
}