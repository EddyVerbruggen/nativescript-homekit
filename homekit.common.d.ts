export interface Accessory {
    name: string;
    bridged: boolean;
    room?: Room;
    ios: any;
}
export interface Zone {
    name: string;
    rooms: Array<Room>;
    ios: any;
}
export interface Room {
    name: string;
    accessories: Array<Accessory>;
    ios: any;
}
export interface Home {
    name: string;
    primary: boolean;
    rooms: Array<Room>;
    accessories: Array<Accessory>;
    zones: Array<Zone>;
    ios: any;
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
export declare class Common implements HomeKitApi {
    available(): Promise<boolean>;
    init(onHomesUpdated: (homes: Array<Home>) => void): Promise<any>;
    startSearchingForAccessories(onAccessoryFound: (accessory: Accessory) => void, onAccessoryRemoved?: (accessory: Accessory) => void): Promise<any>;
    stopSearchingForAccessories(): Promise<any>;
    addHome(name: string): Promise<Home>;
    removeHome(name: string): Promise<Home>;
    renameHome(oldName: string, newName: string): Promise<Home>;
    addZone(name: string, toHome: string): Promise<Zone>;
    removeZone(name: string, fromHome: string): Promise<Zone>;
    renameZone(oldName: string, newName: string, inHome: string): Promise<Zone>;
    addRoomToHome(name: string, toHome: string): Promise<Room>;
    addRoomToZone(name: string, toZone: string, inHome: string): Promise<Zone>;
    removeRoomFromHome(name: string, fromHome: string): Promise<Room>;
    removeRoomFromZone(name: string, fromZone: string, inHome: string): Promise<Zone>;
    renameRoom(oldName: string, newName: string, inHome: string): Promise<Room>;
    addAccessoryToHome(accessoryName: string, toHome: string): Promise<Home>;
    assignAccessoryToRoom(accessoryName: string, roomName: string, homeName: string): Promise<Array<Room>>;
    renameAccessory(oldName: string, newName: string): Promise<Accessory>;
    removeAccessoryFromHome(accessoryName: string, fromHome: string): Promise<Home>;
    private static notAvailable();
}
