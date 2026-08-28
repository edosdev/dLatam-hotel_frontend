import type { NewReservation, Reservation } from '../models/reservation.ts'
import type { Room } from '../models/room.ts'

/**
 * Capa de servicios: consume la API REST del backend Spring Boot usando async/await,
 * validando response.ok y envolviendo cada llamada en try/catch.
 *
 * En desarrollo, Vite proxy redirige /api/* → http://localhost:8080/api/*
 * (configurado en vite.config.ts). En producción, el backend sirve en el mismo origen.
 */
const API_BASE_URL = '/api/v1'

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
      const errorBody = await response.json().catch(() => null)
      throw new Error(errorBody?.message || `Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Reservation
  } catch (error) {
    throw error
  }
}

/**
 * Cancela una reserva usando DELETE (el método que expone el backend Spring Boot).
 * El backend también soporta PATCH /reservations/:id con { "status": "CANCELLED" }.
 */
export async function cancelReservation(reservationId: string): Promise<Reservation> {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      throw new Error(errorBody?.message || `Error del servidor: código HTTP ${response.status}`)
    }
    return (await response.json()) as Reservation
  } catch (error) {
    throw error
  }
}
