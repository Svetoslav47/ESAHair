import express from 'express';
import { setupApp } from './config/app.config';
import { setupDatabase } from './config/db.config';
import { setupGoogleAuth } from './config/google.config';
import { CalendarService } from './services/calendarService';
import { setupRoutes } from './routes';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const startServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    // Setup app middleware
    setupApp(app);

    // Setup database connection
    await setupDatabase();

    // Setup Google OAuth
    const calendarEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET && !!process.env.GOOGLE_REFRESH_TOKEN;
    let calendarService = null;
    if (calendarEnabled) {
        const oauth2Client = setupGoogleAuth();
        calendarService = new CalendarService(oauth2Client);
    }

    // Setup routes
    app.use('/api', setupRoutes(calendarService!, calendarEnabled));

    app.use(express.static(path.join(__dirname, '../../Client/dist')));
    app.get(/^\/(?!api).*/, (req, res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');
    
        res.sendFile(path.join(__dirname, '../../Client/dist/index.html'));
    });

    // --- SOCKET.IO SETUP ---
    const server = http.createServer(app);
    const io = new SocketIOServer(server, { cors: { origin: '*' } });
    app.set('io', io);

    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        if (!calendarEnabled) {
            console.log('Google Calendar integration is DISABLED (missing credentials)');
        }
    });
};

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});