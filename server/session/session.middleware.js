import crypto from 'crypto';
import {
    SESSION_COOKIE_NAME,
    SESSION_TTL_MS
} from './session.service.js';

export default function sessionMiddleware(req, res, next) {
    let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionId) {
        sessionId = crypto.randomUUID();
    }

    res.cookie(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS
    });

    req.sessionId = sessionId;
    next();
}
