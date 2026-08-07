import './style.css'

import type { NewReservation, Reservation } from './models/reservation.ts'
import { ReservationStatus } from './models/reservation.ts'
import type { Room } from './models/room.ts'
import { generateReservationCardHtml } from './components/ReservationCard.ts'
import { ROOM_TYPE_LABELS, generateRoomCardHtml } from './components/RoomCard.ts'
import {
  cancelReservation,
  createReservation,
  fetchReservations,
  fetchRooms,
  setRoomAvailabilityByNumber,
} from './services/api.ts'
import { escapeHtml, formatPrice } from './utils/format.ts'

/** Cache local de habitaciones para resolver el precio al crear una reserva. */
let rooms: Room[] = []

function renderErrorHtml(message: string, scope: string, detail: string): string {
  const safeDetail = detail.length > 0 ? `<small>${escapeHtml(detail)}</small>` : ''
  return `
    <div class="alerta-error" role="alert">
      <p>${message}</p>
      ${safeDetail}
      <button type="button" class="btn btn-retry" data-scope="${scope}">Reintentar</button>
    </div>
  `
}

function showFormFeedback(message: string, isError: boolean): void {
  const errorBlock = document.getElementById('bloque-error')
  const successBlock = document.getElementById('mensaje-exito')
  if (errorBlock !== null) {
    errorBlock.textContent = ''
  }
  if (successBlock !== null) {
    successBlock.textContent = ''
  }
  if (isError) {
    if (errorBlock !== null) {
      errorBlock.textContent = `Error: ${message}`
    }
  } else if (successBlock !== null) {
    successBlock.textContent = message
  }
}

async function loadReservations(): Promise<void> {
  const container = document.getElementById('contenedor-catalogo')
  const counter = document.getElementById('contador-reservas')
  if (container === null || counter === null) {
    return
  }

  // 1. Feedback visual de carga antes de disparar la llamada de red
  container.innerHTML = '<p class="loading" role="status">Cargando reservas desde el servidor…</p>'
  container.setAttribute('aria-busy', 'true')
  counter.textContent = ''

  try {
    const reservations = await fetchReservations()
    container.innerHTML = ''
    counter.textContent = `${reservations.length} ${reservations.length === 1 ? 'reserva' : 'reservas'}`

    if (reservations.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No hay reservas disponibles en este momento.</p></div>'
      container.removeAttribute('aria-busy')
      return
    }

    reservations.forEach((reservation) => {
      container.innerHTML += generateReservationCardHtml(reservation)
    })
    container.removeAttribute('aria-busy')
  } catch (error) {
    console.error('Fallo crítico de red:', error)
    const detail = error instanceof Error ? error.message : 'Error desconocido'
    container.innerHTML = renderErrorHtml(
      'No fue posible obtener las reservas del servidor.',
      'catalogo',
      detail,
    )
    container.removeAttribute('aria-busy')
  }
}

async function loadRooms(): Promise<void> {
  const container = document.getElementById('contenedor-habitaciones')
  const roomSelect = document.getElementById('sel-habitacion') as HTMLSelectElement | null
  if (container === null || roomSelect === null) {
    return
  }

  // Feedback visual de carga antes de la petición
  container.innerHTML = '<p class="loading" role="status">Cargando habitaciones…</p>'
  container.setAttribute('aria-busy', 'true')

  try {
    rooms = await fetchRooms()
    container.innerHTML = ''

    if (rooms.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No hay habitaciones disponibles.</p></div>'
      roomSelect.innerHTML = '<option value="">Sin habitaciones</option>'
      container.removeAttribute('aria-busy')
      return
    }

    rooms.forEach((room) => {
      container.innerHTML += generateRoomCardHtml(room)
    })

    // Poblar el selector de habitaciones de forma tipada
    const fragment = document.createDocumentFragment()
    const placeholderOption = document.createElement('option')
    placeholderOption.value = ''
    placeholderOption.textContent = 'Seleccione una habitación'
    fragment.appendChild(placeholderOption)

    rooms.forEach((room) => {
      const option = document.createElement('option')
      option.value = room.roomNumber
      option.textContent = `Nº ${room.roomNumber} · ${ROOM_TYPE_LABELS[room.type]} · ${formatPrice(room.pricePerNight)}`
      fragment.appendChild(option)
    })

    roomSelect.innerHTML = ''
    roomSelect.appendChild(fragment)
    container.removeAttribute('aria-busy')
  } catch (error) {
    console.error('Fallo crítico de red:', error)
    const detail = error instanceof Error ? error.message : 'Error desconocido'
    container.innerHTML = renderErrorHtml(
      'No fue posible obtener las habitaciones del servidor.',
      'habitaciones',
      detail,
    )
    roomSelect.innerHTML = '<option value="">Habitaciones no disponibles</option>'
    container.removeAttribute('aria-busy')
  }
}

/**
 * Sincroniza la disponibilidad de una habitación de forma no crítica:
 * si la actualización falla, se registra en consola pero no se interrumpe
 * el flujo principal (la reserva ya fue creada o cancelada con éxito).
 */
async function syncRoomAvailability(roomNumber: string, available: boolean): Promise<void> {
  try {
    await setRoomAvailabilityByNumber(roomNumber, available)
  } catch (error) {
    console.error('No se pudo sincronizar la disponibilidad de la habitación:', error)
  }
}

async function handleCancelReservation(reservationId: string, button: HTMLButtonElement): Promise<void> {
  button.disabled = true
  button.textContent = 'Cancelando…'
  try {
    const cancelledReservation: Reservation = await cancelReservation(reservationId)
    showFormFeedback('Reserva cancelada correctamente.', false)
    await syncRoomAvailability(cancelledReservation.roomNumber, true)
    await Promise.all([loadReservations(), loadRooms()])
  } catch (error) {
    console.error('Fallo crítico de red al cancelar la reserva:', error)
    showFormFeedback('No fue posible cancelar la reserva. Intente nuevamente.', true)
    button.disabled = false
    button.textContent = 'Cancelar reserva'
  }
}

function setupReservationForm(): void {
  const bookingForm = document.getElementById('form-reserva') as HTMLFormElement | null
  if (bookingForm === null) {
    return
  }

  bookingForm.addEventListener('submit', async (event: Event) => {
    // 1. Interceptar el envío nativo del navegador
    event.preventDefault()

    // 2. Extraer elementos con aserción de tipo especializada
    const guestNameInput = document.getElementById('txt-huesped') as HTMLInputElement
    const roomSelect = document.getElementById('sel-habitacion') as HTMLSelectElement
    const nightsInput = document.getElementById('txt-noches') as HTMLInputElement
    const submitButton = document.getElementById('btn-reservar') as HTMLButtonElement | null

    showFormFeedback('', false)

    const guestName = guestNameInput.value.trim()
    const roomNumber = roomSelect.value
    const nights = parseInt(nightsInput.value, 10)

    // 3. Validaciones reactivas en el cliente
    if (guestName.length === 0 || roomNumber.length === 0 || isNaN(nights) || nights <= 0) {
      showFormFeedback('Ingrese datos válidos para la reserva.', true)
      return
    }

    const selectedRoom = rooms.find((room) => room.roomNumber === roomNumber)
    if (selectedRoom === undefined) {
      showFormFeedback('La habitación seleccionada no existe.', true)
      return
    }

    if (submitButton !== null) {
      submitButton.disabled = true
      submitButton.textContent = 'Reservando…'
    }

    try {
      const newReservation: NewReservation = {
        guestName,
        roomNumber,
        nights,
        pricePerNight: selectedRoom.pricePerNight,
        status: ReservationStatus.CONFIRMED,
      }

      await createReservation(newReservation)
      showFormFeedback('Reserva creada con éxito.', false)
      bookingForm.reset()
      await syncRoomAvailability(roomNumber, false)
      await Promise.all([loadReservations(), loadRooms()])
    } catch (error) {
      console.error('Fallo crítico de red al crear la reserva:', error)
      showFormFeedback('No fue posible registrar la reserva. Intente nuevamente.', true)
    } finally {
      if (submitButton !== null) {
        submitButton.disabled = false
        submitButton.textContent = 'Reservar habitación'
      }
    }
  })
}

function setupGlobalActions(): void {
  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const retryButton = target.closest('.btn-retry')
    if (retryButton instanceof HTMLElement) {
      const scope = retryButton.dataset.scope
      if (scope === 'catalogo') {
        void loadReservations()
      } else if (scope === 'habitaciones') {
        void loadRooms()
      }
      return
    }

    const cancelButton = target.closest('.btn-cancel')
    if (cancelButton instanceof HTMLButtonElement) {
      const reservationId = cancelButton.dataset.reservationId
      if (reservationId !== undefined) {
        void handleCancelReservation(reservationId, cancelButton)
      }
    }
  })
}

function init(): void {
  setupReservationForm()
  setupGlobalActions()
  void loadRooms()
  void loadReservations()
}

document.addEventListener('DOMContentLoaded', init)
