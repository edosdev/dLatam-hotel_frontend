# 🏨 Hotel Latam — Sistema de Reservas (Hito 2)

Aplicación web **interactiva** de reservas de hotel construida con **TypeScript Vanilla** y **Vite**.
Permite visualizar las habitaciones disponibles, registrar nuevas reservas de huéspedes,
calcular el total por noches y cancelar reservas existentes, todo con feedback visual continuo
(carga, éxito y error) ante cada llamada a la API.

El dominio replica fielmente el **Hito 1** (sistema de reservas de hotel en Java): habitaciones
(`Room`, `RoomType`) y reservas (`Reservation`, `ReservationStatus`), controlados con
enumeraciones estrictas y tipado hermético (cero `any`).

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | TypeScript Vanilla, Vite, Módulos ES nativos |
| Backend | Java 21, Spring Boot 3.2.x, Spring Data JPA |
| Base de datos | PostgreSQL 16 (Docker) |
| Documentación | Springdoc OpenAPI (Swagger) |
| Testing | JUnit 5 + Mockito (backend), TypeScript estricto (frontend) |
| Calidad | JaCoCo 80%+ cobertura, cero `any` en frontend |

## 🔗 Repositorios

- **Backend (Hito 1 + Hito 3/4)**: [dLatam-hotel_backend](https://github.com/edosdev/dLatam-hotel_backend) — Spring Boot + PostgreSQL + Clean Architecture
- **Frontend (este repo / Hito 2)**: [dLatam-hito2_Hotel_Front](https://github.com/edosdev/dLatam-hito2_Hotel_Front) — TypeScript Vanilla + Vite

## 🚀 Instrucciones de Puesta en Marcha Local

### 1. Levantar la Base de Datos (Docker)

```bash
cd backend/
docker compose up -d
```

### 2. Ejecutar el Backend Spring Boot

```bash
cd backend/
mvn spring-boot:run
```

- **API REST**: http://localhost:8080/api/v1
- **Swagger UI** (perfil dev): http://localhost:8080/swagger-ui.html

### 3. Ejecutar el Frontend

```bash
cd hito2/Hotel/
npm install
npm run dev
```

- **App Web**: http://localhost:5173

### Verificar Tipos y Build de Producción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
Hotel/
├── index.html                   # Estructura: header, formulario y catálogos
├── vite.config.ts               # Proxy /api → Spring Boot (localhost:8080)
├── db.json                      # Datos de prueba (json-server, opcional)
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                  # Captura segura del DOM, formulario y renderizado
    ├── models/                  # Enums e interfaces puras del dominio
    │   ├── room.ts
    │   └── reservation.ts
    ├── components/              # Componentes modulares generadores de HTML
    │   ├── RoomCard.ts
    │   └── ReservationCard.ts
    ├── services/                # Capa asíncrona (fetch, async/await, try/catch)
    │   └── api.ts               # Consume Spring Boot en localhost:8080
    ├── utils/format.ts          # Formato de moneda y saneamiento de HTML
    └── style.css                # Estilos con temas claro/oscuro
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
- **Integración Full-Stack**: Frontend consume el backend Spring Boot real
  con PostgreSQL, todo el ciclo CRUD funciona end-to-end.

## 🔌 API Backend (Endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/rooms` | Listar todas las habitaciones |
| `GET` | `/api/v1/rooms/{roomNumber}` | Obtener habitación por número |
| `POST` | `/api/v1/rooms` | Crear nueva habitación |
| `GET` | `/api/v1/reservations` | Listar todas las reservas |
| `GET` | `/api/v1/reservations/{id}` | Obtener reserva por ID |
| `POST` | `/api/v1/reservations` | Crear nueva reserva |
| `DELETE` | `/api/v1/reservations/{id}` | Cancelar reserva |
| `PATCH` | `/api/v1/reservations/{id}` | Actualizar estado de reserva |
