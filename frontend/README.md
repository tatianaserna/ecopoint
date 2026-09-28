# EcoPoint — Frontend

Interfaz web del proyecto **EcoPoint** (plataforma de reciclaje alineada con ODS 11 y 12). Es una **Progressive Web App (PWA) ligera** construida en HTML5, CSS3 y JavaScript vanilla que consume la API REST del backend.

---

## Requisitos previos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- **Backend** de EcoPoint en ejecución (`http://localhost:4000`)
- Extensión **Live Server** en VS Code (recomendado) u otro servidor HTTP local

> **Importante:** No uses el protocolo `file://` para abrir el HTML directamente: las peticiones `fetch` a la API fallarán por restricciones CORS y el Service Worker no podrá registrarse.

---

## Instalación

No hay dependencias de paquetes Node/npm en el cliente. Clona el repositorio y abre la carpeta `frontend/` en tu editor de código.

---

## Configuración

La URL de la API del backend se define en `js/config.js`:

```javascript
const API_BASE = 'http://localhost:4000/api';
const AUTH_TOKEN_KEY = 'ecopoint_token';
ConstanteDescripciónAPI_BASEBase de todos los endpoints consumidosAUTH_TOKEN_KEYClave en localStorage donde se almacena el JWTSi el backend se ejecuta en otro puerto o servidor remoto, modifica únicamente API_BASE.EjecuciónLevanta el servidor Backend:Bashcd backend
npm run dev
Abre frontend/proyecto ecopoint.html con Live Server (clic derecho → Open with Live Server).Verifica en la consola del navegador que el Service Worker se registre correctamente y no existan errores de red.La app estará disponible en una dirección local tipo http://127.0.0.1:5500/frontend/proyecto%20ecopoint.html.Secciones de la aplicación (SPA)SecciónAnclaDescripciónInicio#inicioHero principal y llamada a la acciónMapa#mapaMapa interactivo (Leaflet.js) + Geolocalización + Puntos de reciclaje desde la APIGuía#guiaTarjetas educativas interactiva con modales informativosComunidad#comunidadSistema de gamificación (puntos del usuario, medallas, ranking)Evidencia#evidenciaFormulario para capturar/subir evidencias fotográficas de reciclajeODS#impactoImpacto social, ambiental y alineación con ODS 11 y 12Mi Perfil#registroPanel de autenticación (Login, Registro y Estado de Perfil)Características Móviles y PWALa aplicación incluye detección dinámica del entorno para adaptar las funcionalidades al dispositivo del usuario (isMobileDevice):Geolocalización GPS (#mapa): Habilitada principalmente para dispositivos móviles mediante el botón Usar mi ubicación. En entornos de escritorio la opción se oculta para no saturar la vista.Acceso a Cámara / Galería (#evidencia): Usa la cámara trasera en dispositivos móviles (capture="environment") con previsualización en vivo. En escritorio se adapta para seleccionar archivos desde el almacenamiento local.Soporte PWA: Registra un Service Worker (sw.js) y un archivo manifest (manifest.json) para permitir la instalación de la app en la pantalla de inicio de teléfonos móviles.Funcionalidades conectadas a la APIFuncionalidadEndpointMétodoRegistro de usuario/usersPOSTInicio de sesión/auth/loginPOSTPerfil del usuario/auth/meGETListar puntos de reciclaje/recycling-pointsGETCatálogo de medallas/medalsGETPuntos del usuario/recycling-records/user/:userIdGETRegistro de evidencia/recycling-recordsPOSTEl token JWT se adjunta automáticamente en la cabecera Authorization: Bearer <token> en cada petición que requiera autenticación.AutenticaciónAl iniciar sesión, el token se almacena de forma segura en localStorage.El botón de autenticación cambia dinámicamente a Cerrar sesión y activa la sección del perfil.Sin sesión: Se ocultan las secciones privadas como Mi Perfil y el panel de Tus Puntos.El catálogo de medallas, mapa de puntos y el Top de recicladores permanecen visibles de manera pública.Estructura del proyectofrontend/
├── proyecto ecopoint.html    # Página principal (SPA)
├── manifest.json             # Manifiesto Web App (PWA)
├── sw.js                     # Service Worker
├── css/
│   └── style.css             # Estilos globales y diseño responsive
├── js/
│   ├── config.js             # Configuración global (API URL)
│   ├── api.js                # Módulo cliente HTTP (fetch wrapper con JWT)
│   ├── auth.js               # Control de autenticación, vistas y estado de sesión
│   ├── points.js             # Renderizado y lógica de puntos de reciclaje
│   ├── rewards.js            # Consulta de medallas y puntuación
│   └── evidence.js           # Manejo del formulario y carga de evidencias
├── assets/
│   └── img/                  # Logotipos e íconos de la aplicación
├── ARQUITECTURA.md           # Especificaciones técnicas detalladas
└── README.md
Stack tecnológicoTecnologíaUsoHTML5 & CSS3Estructura semántica, diseño responsive (Flexbox/Grid), animacionesJavaScript (ES6+)Lógica SPA, programación asíncrona (async/await), consumo de APIs (fetch)Leaflet.js & OpenStreetMapRenderizado del mapa interactivo y marcadoresService Worker APISoporte PWA y caching de activosLive ServerServidor de desarrollo localFlujo de prueba recomendadoAbre la app sin iniciar sesión → valida que el acceso a Tus Puntos esté restringido.Navega a Mapa y prueba la interacción con los marcadores de Leaflet.js.En un celular o con la vista responsive de las DevTools, dirígete a Evidencia y prueba tomar o cargar una foto de prueba.Registra un nuevo usuario en la sección Mi Perfil y presiona Iniciar sesión.Verifica que se habilite la tarjeta de Tus Puntos en la sección Comunidad.Realiza la simulación de envío de evidencia y revisa el comportamiento de respuesta de la API.Haz clic en Cerrar sesión para verificar que el almacenamiento local se limpie y la UI retorne a su estado público.
