import { google } from "googleapis";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_SENDER_EMAIL } from "../config/env.js";

const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
];

export function isProjectCalendarConfigured() : boolean {
    return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

export function getGoogleOauthClient(): InstanceType<typeof google.auth.OAuth2> {

    if(!isProjectCalendarConfigured()) {
        throw new Error('Google project calendar is not configured');
    }

    return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function getSetupAuthUrl() {
    const client = getGoogleOauthClient();
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
        state: 'setup'
    });
}

export async function exchangeSetupCode(code: string) {
    const client = getGoogleOauthClient();

    const { tokens } = await client.getToken(code);

    if(!tokens.refresh_token) {
        throw new Error('No refresh token found');
    }

    client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        version: 'v2',
        auth: client
    }); // using this oauth2 object we can get the user's info

    const { data } = await oauth2.userinfo.get();

    return {
        refreshToken: tokens.refresh_token,
        email: data.email ?? GOOGLE_SENDER_EMAIL
    }
}