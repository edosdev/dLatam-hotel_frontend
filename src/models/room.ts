export enum RoomType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  SUITE = "SUITE",
}

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  pricePerNight: number;
  available: boolean;
}
