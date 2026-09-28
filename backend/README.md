# EcoPoint — Backend

API REST del proyecto **EcoPoint** (plataforma de reciclaje alineada con ODS 11 y 12), desarrollada con **Node.js**, **Express**, **TypeScript**, **PostgreSQL** y **arquitectura hexagonal** (puertos y adaptadores).

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) instalado y en ejecución
- Base de datos creada (por ejemplo: `Ecopoint_db`)

---

## Instalación

```bash
cd backend
npm install
```

---

## Base de datos

1. Crear la base `Ecopoint_db` en pgAdmin.
2. Ejecutar el script `database/schema.sql` (crea tablas en el schema `public` y datos iniciales).
3. Configurar el `.env` (ver abajo).

> Con `synchronize: true`, TypeORM también puede crear/ajustar tablas al arrancar. El script SQL sirve para documentación y despliegue manual.

---

## Variables de entorno

Copia el archivo de ejemplo y completa tus valores locales:

```bash
cp .env.example .env
```

| Variable      | Descripción                          | Ejemplo        |
|---------------|--------------------------------------|----------------|
| `PORT`        | Puerto del servidor HTTP             | `4000`         |
| `DB_HOST`     | Host de PostgreSQL                   | `localhost`    |
| `DB_PORT`     | Puerto de PostgreSQL                 | `5432`         |
| `DB_USER`     | Usuario de la base de datos          | `postgres`     |
| `DB_PASSWORD` | Contraseña (puede ir vacía en local) |                |
| `DB_NAME`     | Nombre de la base de datos           | `Ecopoint_db`  |
| `JWT_SECRET`  | Clave para firmar tokens JWT         | mín. 10 chars  |

> El archivo `.env` **no se sube a GitHub**. Cada integrante del grupo debe configurarlo en su máquina.

---

## Ejecución

### Desarrollo (con recarga automática)

```bash
npm run dev
```

### Desarrollo (sin nodemon)

```bash
npx tsx src/index.ts
```

### Producción

```bash
npm run build
npm start
```

Si todo está bien configurado, deberías ver en consola:

```
Database connection established successfully.
Server is running on http://localhost:4000
```

---

## Endpoints

Base URL: `http://localhost:4000/api`

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Iniciar sesión (devuelve JWT) |
| `GET`  | `/auth/me`    | Perfil del usuario autenticado (requiere token) |

**Login — body:**
```json
{
  "email": "correo@correo.com",
  "password": "abc123"
}
```

**Header para `/auth/me`:**
```
Authorization: Bearer <token>
```

---

### Users

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/users` | Registrar usuario |
| `GET`    | `/users` | Listar usuarios activos |
| `GET`    | `/users/id/:id` | Buscar por ID |
| `GET`    | `/users/email/:email` | Buscar por email |
| `PUT`    | `/users/:id` | Actualizar usuario |
| `DELETE` | `/users/:id` | Baja lógica (`status_user = 0`) |

**Registro — body:**
```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "abc123",
  "status": 1,
  "roleId": 2
}
```

> `roleId`: `1` = admin, `2` = reciclador (por defecto `2` si se omite).

---

### Recycling Points (puntos de reciclaje)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/recycling-points` | Crear punto |
| `GET`    | `/recycling-points` | Listar puntos activos |
| `GET`    | `/recycling-points/id/:id` | Buscar por ID |
| `PUT`    | `/recycling-points/:id` | Actualizar punto |
| `DELETE` | `/recycling-points/:id` | Baja lógica (`status_point = 0`) |

**Crear — body:**
```json
{
  "materialId": 1,
  "name": "Punto EcoPoint Centro",
  "address": "Calle 10 #5-20",
  "latitude": 4.6097,
  "longitude": -74.0817,
  "status": 1
}
```

---

### Materials

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/materials` | Crear material |
| `GET`    | `/materials` | Listar materiales activos |
| `GET`    | `/materials/id/:id` | Buscar por ID |
| `PUT`    | `/materials/:id` | Actualizar material |
| `DELETE` | `/materials/:id` | Baja lógica (`status_material = 0`) |

---

### Medals

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/medals` | Crear medalla |
| `GET`    | `/medals` | Listar medallas activas |
| `GET`    | `/medals/id/:id` | Buscar por ID |
| `PUT`    | `/medals/:id` | Actualizar medalla |
| `DELETE` | `/medals/:id` | Baja lógica (`status_medal = 0`) |

---

### Recycling Records (registros de reciclaje)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/recycling-records` | Registrar reciclaje |
| `GET`    | `/recycling-records` | Listar registros activos |
| `GET`    | `/recycling-records/user/:userId` | Registros de un usuario |
| `GET`    | `/recycling-records/id/:id` | Buscar por ID |
| `PUT`    | `/recycling-records/:id` | Actualizar registro |
| `DELETE` | `/recycling-records/:id` | Baja lógica (`status_record = 0`) |

**Crear — body:**
```json
{
  "userId": 1,
  "pointId": 1,
  "pointsEarned": 50,
  "status": 1
}
```

Al crear, el sistema suma puntos del usuario y otorga medallas automáticamente si alcanza el umbral.

---

### Roles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/roles` | Crear rol |
| `GET`    | `/roles` | Listar roles activos |
| `GET`    | `/roles/id/:id` | Buscar por ID |
| `PUT`    | `/roles/:id` | Actualizar rol |
| `DELETE` | `/roles/:id` | Baja lógica (`status_role = 0`) |

---

## Estructura del proyecto

```
backend/
├── database/
│   └── schema.sql                  # Script SQL del modelo físico
├── src/
│   ├── index.ts                    # Arranque: BD + servidor (Promise.all)
│   ├── domain/                     # Interfaces y puertos (contratos)
│   │   ├── port/                   # UserPort, MaterialPort, etc.
│   │   └── *.ts                    # Modelos de dominio
│   ├── application/                # Lógica de negocio por módulo
│   └── infraestructure/
│       ├── adapter/                # Patrón Adapter → TypeORM
│       ├── bootstrap/                # ServerBootstrap
│       ├── config/                 # .env + DataSource PostgreSQL
│       ├── controller/             # Controladores HTTP
│       ├── entities/               # Entidades TypeORM
│       ├── middleware/             # authMiddleware (JWT)
│       ├── routes/                 # Rutas REST por módulo
│       ├── util/                   # Validaciones Joi
│       └── web/                    # Express app + CORS
├── .env.example
├── ARQUITECTURA.md
├── package.json
└── tsconfig.json
```

Para el detalle de capas, flujos y patrón Adapter, consulta **[ARQUITECTURA.md](./ARQUITECTURA.md)**.

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| Express 5 | Servidor HTTP y rutas REST |
| TypeScript | Tipado estático |
| TypeORM | ORM para PostgreSQL |
| PostgreSQL | Base de datos relacional |
| Joi | Validación de `.env` y datos de entrada |
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | Autenticación JWT |
| cors | Peticiones desde el frontend |
| dotenv | Carga de variables desde `.env` |

---

## Scripts npm

| Script | Comando |
|--------|---------|
| `npm run dev` | Servidor en modo desarrollo |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |

---

## Notas del proyecto académico

- Todos los DELETE son **baja lógica** (`status = 0`), no borrado físico.
- Las contraseñas se guardan con **bcrypt** (`$2b$10$...`).
- Patrón de diseño **Adapter** en cada módulo (`UserAdapter`, `MaterialAdapter`, etc.).
- `synchronize: true` en TypeORM es solo para desarrollo. **No usar en producción.**

---

## Equipo

Proyecto grupal — Ingeniería Web I, UNIMINUTO.

