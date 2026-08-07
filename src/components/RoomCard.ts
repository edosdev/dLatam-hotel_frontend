import type { Room } from "../models/room.ts";
import { RoomType } from "../models/room.ts";
import { formatPrice } from "../utils/format.ts";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  [RoomType.SINGLE]: "Habitación single",
  [RoomType.DOUBLE]: "Habitación doble",
  [RoomType.SUITE]: "Suite",
};

export function generateRoomCardHtml(room: Room): string {
  const available = room.available;
  const availabilityClass = available ? "badge-available" : "badge-unavailable";
  const availabilityLabel = available ? "Disponible" : "Ocupada";

  return `
    <article class="room-card${available ? "" : " is-unavailable"}">
      <div class="room-card-head">
        <span class="room-number">Nº ${room.roomNumber}</span>
        <span class="badge ${availabilityClass}">${availabilityLabel}</span>
      </div>
      <p class="room-type">${ROOM_TYPE_LABELS[room.type]}</p>
      <p class="room-price">${formatPrice(room.pricePerNight)}<span class="room-price-note"> / noche</span></p>
    </article>
  `;
}
