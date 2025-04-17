import express from 'express';
import { setupApp } from './config/app.config';
import { setupDatabase } from './config/db.config';
import { setupGoogleAuth } from './config/google.config';
import { CalendarService } from './services/calendarService';
import { setupRoutes } from './routes';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const startServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    // Setup app middleware
    setupApp(app);

    // Setup database connection
    await setupDatabase();

    // Setup Google OAuth
    const oauth2Client = setupGoogleAuth();
    const calendarService = new CalendarService(oauth2Client);

    // Setup routes
    app.use('/api', setupRoutes(calendarService));

    app.use(express.static(path.join(__dirname, '../../Client/dist')));
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../../Client/dist/index.html'));
    });

    // Start server
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});