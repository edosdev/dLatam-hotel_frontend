export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  IN_USE = "IN_USE",
}

export interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  nights: number;
  pricePerNight: number;
  status: ReservationStatus;
}

/**
 * Payload enviado al crear una reserva (sin id: lo asigna el servidor).
 * Replica la entrada del método makeReservation de HotelService.
 */
export interface NewReservation {
  guestName: string;
  roomNumber: string;
  nights: number;
  pricePerNight: number;
  status: ReservationStatus;
}
