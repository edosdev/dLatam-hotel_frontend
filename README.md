# 🏨 Hotel Latam — Sistema de Reservas (Hito 2)

Aplicación web **interactiva** de reservas de hotel construida con **TypeScript Vanilla** y **Vite**.
Permite visualizar las habitaciones disponibles, registrar nuevas reservas de huéspedes,
calcular el total por noches y cancelar reservas existentes, todo con feedback visual continuo
(carga, éxito y error) ante cada llamada a la API.

El dominio replica fielmente el **Hito 1** (sistema de reservas de hotel en Java): habitaciones
(`Room`, `RoomType`) y reservas (`Reservation`, `ReservationStatus`), controlados con
enumeraciones estrictas y tipado hermético (cero `any`).

## 🛠️ Tecnologías

- **TypeScript Vanilla** — tipado estricto, modelos con `enum` e `interface`, cero `any`.
- **Vite** — servidor de desarrollo en caliente (HMR) y build de producción.
- **Módulos nativos ES** — import/export nativos, sin frameworks.
- **json-server** — API REST de prueba (mock) local que emula un backend real de hotel.
  Cuando exista el backend definitivo (Hito 3+), solo hay que cambiar la URL base en
  `src/services/api.ts`.

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Levantar la API de prueba (terminal 1)

```bash
npm run api
```

> Levanta json-server con los datos de `db.json` en `http://localhost:3001`
> (endpoints: `/rooms` y `/reservations`).

### 3. Ejecutar el servidor de desarrollo (terminal 2)

```bash
npm run dev
```

> Abre `http://localhost:5173`. El dev server redirige las peticiones `/api/*`
> hacia la API de prueba mediante el proxy de `vite.config.ts`.

### Verificación de tipos y build

```bash
npm run build
```

## 📁 Estructura del proyecto

```
├── db.json                      # Datos de prueba de la API (rooms, reservations)
├── vite.config.ts               # Proxy /api → json-server
├── index.html                   # Estructura: header, formulario y catálogos
└── src/
    ├── main.ts                  # Captura segura del DOM, formulario y renderizado
    ├── models/                  # Enums e interfaces puras del dominio
    │   ├── room.ts
    │   └── reservation.ts
    ├── components/              # Componentes modulares generadores de HTML
    │   ├── RoomCard.ts
    │   └── ReservationCard.ts
    ├── services/                # Capa asíncrona (fetch, async/await, try/catch)
    │   └── api.ts
    └── utils/format.ts          # Formato de moneda y saneamiento de HTML
```

## ✨ Características

- **Modelado de datos hermético**: `RoomType` y `ReservationStatus` como `enum`;
  `Room`, `Reservation` y `NewReservation` como `interface` (cero `any`).
- **DOM seguro**: guardias de nulidad antes de mutar nodos y aserciones
  `as HTMLInputElement` para extraer valores del formulario.
- **Formulario reactivo**: `event.preventDefault()` como primera instrucción
  del listener de envío, con validaciones de huésped, habitación y noches.
- **Arquitectura asíncrona**: `async/await`, bloques `try/catch`, validación de
  `response.ok` y feedback visual (cargando / éxito / error con reintento).
