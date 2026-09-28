import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/UserRoutes';
import authRoutes from '../routes/AuthRoutes';
import recyclingPointRoutes from '../routes/RecyclingPointRoutes';
import materialRoutes from '../routes/MaterialRoutes';
import medalRoutes from '../routes/MedalRoutes';
import recyclingRecordRoutes from '../routes/RecyclingRecordRoutes';
import roleRoutes from '../routes/RoleRoutes';

class App {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    private middlewares(): void {
        const allowedOrigins = [
            'https://ecopoint-psi.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5500',
            'http://localhost:5500'
        ];

        // Middleware CORS (ya maneja preflights de OPTIONS automáticamente)
        this.app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                    callback(null, true);
                } else {
                    callback(null, true);
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
        }));

        // ❌ Eliminamos: this.app.options('*', cors() as any);

        this.app.use(express.json());
    }

    private routes(): void {
        this.app.use("/api/auth", authRoutes);
        this.app.use("/api", userRoutes);
        this.app.use("/api", recyclingPointRoutes);
        this.app.use("/api", materialRoutes);
        this.app.use("/api", medalRoutes);
        this.app.use("/api", recyclingRecordRoutes);
        this.app.use("/api", roleRoutes);
    }

    getApp(): express.Application {
        return this.app;
    }
}

export default new App().getApp();
