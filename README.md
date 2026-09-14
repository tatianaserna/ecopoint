# 🌍 EcoPoint - PWA de Gestión y Geolocalización Ambiental

> Aplicación Web Progresiva (PWA) con **diseño adaptable (responsive)** y experiencia interactiva orientada a dispositivos móviles (soporte A2HS - *Add to Home Screen*), operando sobre web estándar HTTPS sin empaquetado nativo (APK).

EcoPoint/
├── backend/                # API REST / Servidor (Node.js / Express / TypeScript)
│   ├── src/
│   ├── ARQUITECTURA.md     # Documentación técnica del backend
│   └── README.md           # Guía de instalación/ejecución del backend
├── docs/
│   └── DIAGRAMAS-ENTREGA-2.md # Diagramas de arquitectura y flujo académico
├── frontend/               # Cliente PWA (HTML/CSS/JS + Leaflet + Service Worker)
│   ├── assets/ & css/ & js/ & pages/
│   ├── ARQUITECTURA.md     # Documentación técnica del frontend
│   ├── manifest.json       # Configuración PWA
│   └── sw.js               # Service Worker (caché offline)
└── README.md               # Índice, arquitectura y bitácora general

---

### Bloque 2: Configuración PWA
```markdown
## 📱 Configuración PWA (`manifest.json` y `sw.js`)

### 1. `frontend/manifest.json` (Identidad y Comportamiento Nativo)
* **`name` / `short_name`**: `EcoPoint`
* **`display`**: `standalone` (oculta la interfaz del navegador para dar sensación de app nativa).
* **`orientation`**: `portrait` (enfocado en ergonomía de uso móvil en campo).
* **`theme_color` / `background_color`**: Sincronizados con la paleta visual de la interfaz.
* **`icons`**: Conjunto de recursos gráficos en múltiples densidades para la instalación directa en la pantalla de inicio (Android / iOS).

### 2. `frontend/sw.js` (Estrategia Offline y Service Worker)
* **Ciclo de vida**: Instalación (`install`) con pre-caché de recursos críticos (`index.html`, CSS base, dependencias de Leaflet), activación (`activate`) y limpieza de cachés obsoletas.
* **Intercepción de red (`fetch`)**: Estrategia híbrida *Cache-First / Network-Fallback* para assets estáticos y renderizado resiliente de vistas base ante pérdida de conectividad móvil en terreno.

## 📝 Bitácora de Desarrollo (Paso a Paso)

1. **Migración de Mapa Base (`iframe` a Leaflet.js)**:
   * Retiro del `iframe` estático de Google Maps por limitaciones de control de estado y rendimiento.
   * Implementación de **Leaflet.js** con tiles de OpenStreetMap, soporte de marcadores dinámicos y navegación fluida mediante `flyTo`.
2. **Corrección de Geolocalización y Permisos en Móviles**:
   * Diagnóstico y ajuste de restricciones de seguridad del navegador (obligatoriedad de **HTTPS** para habilitar `navigator.geolocation` y registro de Service Workers en Safari/iOS y Chrome móvil).
   * Manejo de estados de alta/baja tolerancia y errores del GPS en dispositivo móvil.
3. **Implementación de Capas PWA**:
   * Creación del `manifest.json` y estructuración del ciclo del Service Worker (`sw.js`) para garantizar el comportamiento offline de la interfaz principal.
4. **Módulo de Registro con Evidencia Fotográfica**:
   * Configuración de input HTML nativo con `capture="environment"` para forzar el uso de la cámara trasera en campo.
   * Previsualización instantánea de la imagen mediante la API `FileReader` de JavaScript antes del envío de datos.
5. **Arquitectura Modular del Cliente**:
   * Separación de responsabilidades en la carpeta `js/` (`auth.js` para manejo de sesiones, `api.js` para comunicación con el backend, y controladores de vistas en `pages/`).

## 🚀 Despliegue y Arquitectura de Producción

| Componente | Plataforma / Hosting | Estado / Detalle técnico |
| :--- | :--- | :--- |
| **Frontend (PWA)** | **Vercel** | Despliegue estático/SPA, enrutamiento manejado y soporte HTTPS obligatorio (mandatorio para PWA/GPS). |
| **Backend API** | **Vercel / Cloud Server** | API REST Node.js/Express desacoplada con CORS configurado y rutas operativas. |
| **Base de Datos** | **PostgreSQL (Neon / Railway / Supabase)** | Base de datos relacional con esquema DDL normalizado y pool de conexiones activo. |

### Flujo de Despliegue Frontend en Vercel
1. Autenticación CLI con la cuenta correspondiente: `vercel login`
2. Vinculación del proyecto/scope: `vercel link`
3. Despliegue a producción: `vercel --prod`

### Paso a Paso: Despliegue del Backend y Conexión con PostgreSQL
1. **Preparación del Servidor (Node.js / Express + Driver Relacional)**:
   * Configuración del archivo de entrada (`src/index.ts` / `server.js`) con middlewares de seguridad (`cors`, `express.json()`).
   * Configuración del pool de conexiones SQL (`pg.Pool` o cliente ODM/ORM como Prisma/Drizzle).
2. **Configuración de Variables de Entorno en el Hosting**:
   * Inyección de variables seguras en la plataforma cloud:
     * `PORT=4000` (o asignado por la plataforma)
     * `DATABASE_URL=postgres://usuario:password@host.postgres.database-provider.com:5432/ecopoint?sslmode=require`
3. **Migraciones del Esquema Relacional**:
   * Ejecución de scripts DDL / migraciones (`npx prisma migrate deploy` o aplicación de scripts SQL de tablas, índices espaciales/geográficos o constraints en PostgreSQL).
4. **Despliegue y Pruebas de Humo**:
   * Sincronización o deploy del backend.
   * Verificación del endpoint de estado (`GET /api/health` o equivalente) realizando un `SELECT 1` o consulta de prueba contra PostgreSQL para asegurar conectividad TLS/pool en caliente.

