export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  IN_USE = "IN_USE",
}

/**
 * Reserva tal como la devuelve el backend Spring Boot.
 * El campo 'total' viene calculado del servidor (nights × pricePerNight).
 */
export interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  nights: number;
  pricePerNight: number;
  total: number;
  status: ReservationStatus;
}

/**
 * Payload enviado al crear una reserva.
 * El backend genera el reservationId internamente si no se provee,
 * y resuelve el pricePerNight a partir de la habitación.
 */
export interface NewReservation {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  nights: number;
}
