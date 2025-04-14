import { google } from "googleapis";
import readline from "readline";
import dotenv from 'dotenv';
import express from "express";

dotenv.config();

const app = express();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/oauth2callback" // Redirect URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent" // This ensures we get a refresh token
});

console.log("Authorize this app by visiting this url:", authUrl);

app.get("/oauth2callback", (req: any, res: any) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("No code provided");
  }

  oAuth2Client.getToken(code, (err: Error | null, token: any) => {
    if (err) return res.status(500).send(err);
    console.log("Refresh Token:", token.refresh_token); // This is what you need to save
    res.send(`Authentication successful! Your refresh token is: ${token.refresh_token}`);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
