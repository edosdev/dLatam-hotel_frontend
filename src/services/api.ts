import type { NewReservation, Reservation } from '../models/reservation.ts'
import { ReservationStatus } from '../models/reservation.ts'
import type { Room } from '../models/room.ts'

/**
 * Capa de servicios: consume la API REST mock (json-server) usando async/await,
 * validando response.ok y envolviendo cada llamada en try/catch.
 * Cuando exista un backend real (Hito 3+), solo hay que cambiar esta URL base.
 */
const API_BASE_URL = '/api'

export async function fetchRooms(): Promise<Room[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`)
    if (!response.ok) {
      throw new Error(`Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Room[]
  } catch (error) {
    throw error
  }
}

export async function fetchReservations(): Promise<Reservation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`)
    if (!response.ok) {
      throw new Error(`Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Reservation[]
  } catch (error) {
    throw error
  }
}

export async function createReservation(newReservation: NewReservation): Promise<Reservation> {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReservation),
    })
    if (!response.ok) {
      throw new Error(`Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Reservation
  } catch (error) {
    throw error
  }
}

export async function cancelReservation(reservationId: string): Promise<Reservation> {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: ReservationStatus.CANCELLED }),
    })
    if (!response.ok) {
      throw new Error(`Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Reservation
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza la disponibilidad de una habitación por su número.
 * Replica el flujo room.markAsOccupied() / room.markAsAvailable() del Hito 1.
 */
export async function setRoomAvailabilityByNumber(roomNumber: string, available: boolean): Promise<void> {
  try {
    // Se buscan todas las habitaciones y se filtra en el cliente: json-server
    // no filtra de forma confiable por campos string con valores numéricos.
    const searchResponse = await fetch(`${API_BASE_URL}/rooms`)
    if (!searchResponse.ok) {
      throw new Error(`Error del servidor: código HTTP ${searchResponse.status}`)
    }
    const rooms = (await searchResponse.json()) as Room[]
    const room = rooms.find((candidate) => candidate.roomNumber === roomNumber)
    if (room === undefined) {
      return
    }

    const patchResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    })
    if (!patchResponse.ok) {
      throw new Error(`Error del servidor: código HTTP ${patchResponse.status}`)
    }
  } catch (error) {
    throw error
  }
}
