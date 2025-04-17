import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const setupGoogleAuth = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_STUDIO_REFRESH_TOKEN,
        scope: 'https://www.googleapis.com/auth/calendar',
        token_type: 'Bearer'
    });

    return oauth2Client;
}; 