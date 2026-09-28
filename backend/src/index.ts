import 'reflect-metadata'; // MUST BE FIRST IMPORT
import { Request, Response, NextFunction } from 'express';
import app from './infraestructure/web/app';
import { ServerBootstrap } from './infraestructure/bootstrap/server.bootstrap';
import { connectToDatabase } from './infraestructure/config/data-base';

// Middleware para asegurar que la conexión esté lista antes de procesar cualquier endpoint
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ error: 'Internal server error - Database connection failed' });
  }
});

async function startServer() {
  try {
    await connectToDatabase();
    const serverBootstrap = new ServerBootstrap(app);
    await serverBootstrap.initialize();
  } catch (error) {
    console.error('Error starting local server:', error);
    process.exit(1);
  }
}

// En desarrollo local iniciamos el servidor HTTP
if (process.env.NODE_ENV !== 'production') {
  startServer();
}

// Exportación para Vercel Serverless Function
export default app;
