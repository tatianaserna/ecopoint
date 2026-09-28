# 🏗️ Arquitectura del Sistema — Backend EcoPoint

El backend de **EcoPoint** está diseñado siguiendo los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)** promovida por Alistair Cockburn, combinada con principios de **Clean Architecture** e **Inyección de Dependencias**.

El objetivo principal es mantener la **lógica de negocio completamente desacoplada** de detalles de infraestructura como marcos de trabajo HTTP (Express), bases de datos (TypeORM / PostgreSQL), librerías de validación o bibliotecas externas.

---

## 📐 Capas del Sistema

```text
               +-------------------------------------------+
               |        INFRAESTRUCTURA (HTTP, DB)         |
               |                                           |
               |   [ Controllers ]      [ DB Entities ]    |
               |         |                     ^           |
               |         v                     |           |
               |   [ App Use Cases ]    [ TypeORM Adapters]|
               |         |                     |           |
               +---------|---------------------|-----------+
                         |                     |
               +---------v---------------------v-----------+
               |             DOMINIO (Core)                |
               |                                           |
               |      [ Entities ]      [ Ports ]          |
               +-------------------------------------------+
1. Capa de Dominio (src/domain/)
Es el núcleo central de la aplicación. No depende de ninguna librería ni tecnología externa.

Modelos de Dominio (*.ts): Definen las estructuras de datos y entidades de negocio puras (e.g., User, RecyclingPoint, Material, Medal).

Puertos (src/domain/port/): Interfaces TypeScript que establecen los contratos de lo que el sistema necesita hacer sin definir el cómo (e.g., UserPort, MaterialPort, RecyclingRecordPort).

2. Capa de Aplicación (src/application/)
Contiene los casos de uso y las reglas de negocio de la aplicación.

Coordina la interacción entre el dominio y los puertos.

Aplica reglas complejas (por ejemplo, el cálculo automático de puntos acumulados y la asignación automática de medallas al guardar un RecyclingRecord).

Es agnóstica a la base de datos o framework HTTP utilizado.

3. Capa de Infraestructura (src/infrastructure/)
Representa la capa externa ("puertos de entrada y salida") donde residen las herramientas tecnológicas concretas.

Adaptadores (src/infrastructure/adapter/): Implementaciones concretas de las interfaces definidas en src/domain/port/ utilizando TypeORM para interactuar con PostgreSQL (e.g., UserAdapter, MaterialAdapter).

Entidades ORM (src/infrastructure/entities/): Clases mapeadas con decoradores de TypeORM (@Entity, @Column, @PrimaryGeneratedColumn) para interactuar directamente con el esquema físico de PostgreSQL.

Controladores (src/infrastructure/controller/): Manejan las peticiones HTTP de Express, extraen los parámetros/body, invocan a la capa de aplicación o adaptadores y retornan la respuesta JSON estandarizada.

Rutas (src/infrastructure/routes/): Mapeo de verbos y rutas REST hacia los controladores correspondientes.

Middlewares (src/infrastructure/middleware/): Interceptores para autenticación mediante tokens JWT (authMiddleware).

Configuración y Bootstrap (src/infrastructure/config/ y bootstrap/): Configuración de variables de entorno con Joi, inicialización de DataSource de TypeORM y arranque del servidor HTTP Express.

🔄 Flujo de Datos (Ejemplo: Crear un Usuario)
Petición HTTP: Cliente realiza un POST /api/users enviando un payload JSON.

Enrutador & Controlador: user.routes.ts redirige la petición a UserController.create().

Validación: Se valida el body usando esquemas de Joi (src/infrastructure/util/).

Adaptador de Infraestructura: El controlador llama a UserAdapter (que implementa el puerto UserPort).

Persistencia ORM: UserAdapter mapea los datos de dominio hacia la entidad UserEntity de TypeORM y ejecuta la persistencia asíncrona en PostgreSQL.

Respuesta: Se devuelve una respuesta HTTP 201 Created con los datos formateados.

🛠️ Patrones de Diseño Utilizados
Patrón Adaptador (Adapter)
Permite aislar la persistencia de datos. Si en el futuro se reemplaza TypeORM o PostgreSQL por otra tecnología (e.g., Prisma o MongoDB), la capa de Dominio y los Controladores no requerirán ningún cambio; únicamente se debe crear un nuevo Adaptador que implemente los mismos Ports.

Baja Lógica (Soft Delete)
Ningún registro de las tablas principales es borrado físicamente con la instrucción DELETE. En su lugar, todas las entidades manejan un campo indicador (status = 1 para activo, status = 0 para inactivo). Las operaciones de eliminación en los adaptadores actualizan dicho estado a 0.

🗄️ Esquema Físico de Base de Datos
El modelo relacional en PostgreSQL está compuesto por las siguientes tablas principales:

roles: Definición de perfiles de usuario (status_role).

users: Usuarios registrados, credenciales encriptadas con bcrypt y clave foránea hacia roles.

materials: Catálogo de materiales reciclables (plástico, vidrio, papel, etc.).

recycling_points: Puntos físicos de recolección geolocalizados (latitude, longitude).

medals: Catálogo de medallas obtenibles según metas de puntos.

recycling_records: Historial de entregas realizadas por los usuarios en los puntos de acopio.
