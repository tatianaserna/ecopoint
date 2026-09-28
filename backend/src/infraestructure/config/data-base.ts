import 'reflect-metadata';
import { DataSource } from 'typeorm';
import pg from 'pg';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Material } from '../entities/Material';
import { RecyclingPoint } from '../entities/RecyclingPoint';
import { RecyclingRecord } from '../entities/RecyclingRecord';
import { Medal } from '../entities/Medal';
import { UserMedal } from '../entities/UserMedal';
import { AuthSession } from '../entities/AuthSession';
import envs from './environment-vars';

const isProduction = process.env.NODE_ENV === 'production';

// Garantiza que el empaquetador de Vercel mantenga la referencia de las clases de entidades
const registeredEntities = [
    Role,
    User,
    AuthSession,
    Material,
    RecyclingPoint,
    RecyclingRecord,
    Medal,
    UserMedal,
];

export const AppDataSource = new DataSource({
    type: 'postgres',
    driver: pg,
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    username: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
    synchronize: true,
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: isProduction ? { ssl: { rejectUnauthorized: false } } : {},
    entities: registeredEntities,
});

export async function seedInitialData() {
    const roleRepo = AppDataSource.getRepository(Role);
    const roleCount = await roleRepo.count();
    if (roleCount === 0) {
        await roleRepo.save([
            { id_role: 1, name_role: 'admin', status_role: 1 },
            { id_role: 2, name_role: 'reciclador', status_role: 1 },
        ]);
        await AppDataSource.query(
            `SELECT setval(pg_get_serial_sequence('roles', 'id_role'), (SELECT MAX(id_role) FROM roles))`
        );
    }

    const materialRepo = AppDataSource.getRepository(Material);
    if ((await materialRepo.count()) === 0) {
        await materialRepo.save([
            { name_material: 'Plastico', category_material: 'Envases', status_material: 1 },
            { name_material: 'Papel y carton', category_material: 'Papel', status_material: 1 },
            { name_material: 'Vidrio', category_material: 'Envases', status_material: 1 },
            { name_material: 'Metal', category_material: 'Latas', status_material: 1 },
        ]);
    }

    const medalRepo = AppDataSource.getRepository(Medal);
    if ((await medalRepo.count()) === 0) {
        await medalRepo.save([
            { name_medal: 'Primera reciclada', points_required: 50, status_medal: 1 },
            { name_medal: 'Reciclador activo', points_required: 200, status_medal: 1 },
            { name_medal: 'Heroe verde', points_required: 500, status_medal: 1 },
        ]);
    }
}

export const connectToDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Database connection established successfully.');
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};
