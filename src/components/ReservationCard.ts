import type { Reservation } from "../models/reservation.ts";
import { ReservationStatus } from "../models/reservation.ts";
import { escapeHtml, formatPrice } from "../utils/format.ts";

/**
 * Metadatos visuales por estado: cualquier valor nuevo del enum
 * requiere definir su entrada aquí (sin lógica binaria implícita).
 */
const STATUS_META: Record<ReservationStatus, { label: string; className: string }> = {
  [ReservationStatus.CONFIRMED]: { label: "Confirmada", className: "badge-confirmed" },
  [ReservationStatus.CANCELLED]: { label: "Cancelada", className: "badge-cancelled" },
  [ReservationStatus.IN_USE]: { label: "En uso", className: "badge-in-use" },
};

/**
 * Componente modular: genera el HTML de una tarjeta de reserva.
 * El estado visual se deriva exclusivamente del enum ReservationStatus.
 */
export function generateReservationCardHtml(reservation: Reservation): string {
  const isCancelled = reservation.status === ReservationStatus.CANCELLED;
  const statusMeta = STATUS_META[reservation.status];
  const total = reservation.nights * reservation.pricePerNight;

  const cancelButton = isCancelled
    ? ""
    : `<button type="button" class="btn-cancel" data-reservation-id="${escapeHtml(reservation.id)}">
         Cancelar reserva
       </button>`;

  return `
    <article class="card reservation-card${isCancelled ? " is-cancelled" : ""}">
      <div class="card-head">
        <span class="badge ${statusMeta.className}">${statusMeta.label}</span>
        <span class="card-ref">#${escapeHtml(reservation.id)}</span>
      </div>
      <h3 class="card-title">${escapeHtml(reservation.guestName)}</h3>
      <dl class="card-details">
        <div class="detail">
          <dt>Habitación</dt>
          <dd>Nº ${escapeHtml(reservation.roomNumber)}</dd>
        </div>
        <div class="detail">
          <dt>Noches</dt>
          <dd>${reservation.nights}</dd>
        </div>
        <div class="detail">
          <dt>Precio / noche</dt>
          <dd>${formatPrice(reservation.pricePerNight)}</dd>
        </div>
        <div class="detail detail-total">
          <dt>Total</dt>
          <dd>${formatPrice(total)}</dd>
        </div>
      </dl>
      ${cancelButton}
    </article>
  `;
}
