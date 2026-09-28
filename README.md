# 🌍 EcoPoint - PWA de Gestión y Geolocalización Ambiental

> Aplicación Web Progresiva (PWA) con **diseño adaptable (responsive)** y experiencia interactiva orientada a dispositivos móviles (soporte A2HS - *Add to Home Screen*), operando sobre web estándar HTTPS sin empaquetado nativo (APK).

```text
EcoPoint/
├── backend/                # API REST / Servidor (Node.js / Express / TypeScript + TypeORM)
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

📱 Configuración PWA (manifest.json y sw.js)
1. frontend/manifest.json (Identidad y Comportamiento Nativo)
name / short_name: EcoPoint

   
JPG

display: standalone (oculta la interfaz del navegador para dar sensación de app nativa).

orientation: portrait (enfocado en ergonomía de uso móvil en campo).

theme_color / background_color: Sincronizados con la paleta visual de la interfaz.

icons: Conjunto de recursos gráficos en múltiples densidades para la instalación directa en la pantalla de inicio (Android / iOS).

2. frontend/sw.js (Estrategia Offline y Service Worker)
Ciclo de vida: Instalación (install) with pre-caché de recursos críticos (index.html, CSS base, dependencias de Leaflet), activación (activate) y limpieza de cachés obsoletas.

Intercepción de red (fetch): Estrategia híbrida Cache-First / Network-Fallback para assets estáticos y renderizado resiliente de vistas base ante pérdida de conectividad móvil en terreno.

📝 Bitácora de Desarrollo (Paso a Paso)
Migración de Mapa Base (iframe a Leaflet.js):

Retiro del iframe estático de Google Maps por limitaciones de control de estado y rendimiento.

Implementación de Leaflet.js con tiles de OpenStreetMap, soporte de marcadores dinámicos y navegación fluida mediante flyTo.

Geolocalización Exclusiva para Dispositivos Móviles:

Implementación de restricción por cliente para activar navigator.geolocation únicamente en vista móvil/smartphones.

Diagnóstico y ajuste de restricciones de seguridad del navegador (obligatoriedad de HTTPS para habilitar la geolocalización y el registro del Service Worker en Safari/iOS y Chrome móvil).

Manejo de estados de tolerancia y errores del GPS en dispositivo móvil.

Implementación de Capas PWA:

Creación del manifest.json y estructuración del ciclo del Service Worker (sw.js) para garantizar el comportamiento offline de la interfaz principal.

Módulo de Registro con Captura Fotográfica en Móvil:

Configuración de input HTML condicional con capture="environment", restringiendo la captura directa con la cámara trasera únicamente a la interfaz móvil.

Ocultamiento/deshabilitación del botón de carga fotográfica en vistas de escritorio para garantizar la recolección de evidencia exclusiva desde campo.

Previsualización instantánea de la imagen mediante la API FileReader de JavaScript antes del envío de datos.

Arquitectura Modular del Cliente:

Separación de responsabilidades en la carpeta js/ (auth.js para manejo de sesiones, api.js para comunicación con el backend, y controladores de vistas en pages/).

🚀 Despliegue y Arquitectura de Producción
Componente	Plataforma / Hosting	Estado / Detalle técnico
Frontend (PWA)	Vercel	Despliegue estático/SPA, enrutamiento manejado y soporte HTTPS obligatorio (mandatorio para PWA/GPS).
Backend API	Vercel Serverless Functions	API REST Node.js/Express desacoplada en TypeScript con resolución asíncrona de repositorios para evitar cold start race conditions.
Base de Datos	Neon PostgreSQL (Cloud)	Base de datos PostgreSQL serverless administrada en la nube con soporte SSL/TLS activo y esquema DDL normalizado.
Flujo de Despliegue Frontend en Vercel
Autenticación CLI con la cuenta correspondiente: vercel login

Vinculación del proyecto/scope: vercel link

Despliegue a producción: vercel --prod

Paso a Paso: Despliegue del Backend y Conexión con Neon PostgreSQL
Preparación del Servidor (Node.js / Express + TypeORM):

Configuración de la base con AppDataSource de TypeORM con driver relacional de PostgreSQL.

Adaptadores refactorizados para asegurar la invocación asíncrona a connectToDatabase() antes de cada consulta HTTP, garantizando resiliencia durante los cold starts en Vercel Serverless.

Configuración de Variables de Entorno en Vercel Dashboard:

Inyección de variables seguras en las variables de entorno de Vercel:

DB_HOST=ep-xxxx.us-east-2.aws.neon.tech

DB_PORT=5432

DB_USER=neondb_owner

DB_PASSWORD=xxxx

DB_NAME=neondb

DB_SSL=true

JWT_SECRET=xxxx

Migraciones y Persistencia de Esquema Relacional:

Ejecución de scripts DDL / schema.sql en la consola de Neon PostgreSQL para crear las tablas (users, roles, materials, recycling_points, medals, recycling_records, auth_sessions).

Despliegue y Verificación de la API:

Sincronización automática mediante GitHub Integration o despliegue directo con vercel --prod en la carpeta backend/.

Verificación de los endpoints REST confirmando logs en Vercel (Database connection established successfully. e interacción con HTTP 200 OK).
