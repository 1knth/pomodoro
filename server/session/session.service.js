export const SESSION_COOKIE_NAME = 'komo_sid';
export const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour
const REFRESH_RATE_LIMIT_WINDOW_MS = 60_000;
const REFRESH_RATE_LIMIT_MAX = 7;

const sessionsById = new Map();
const refreshTimestampsByIp = new Map();

function createSession() {
    return {
        videos: [],
        lastSeen: Date.now(),
        refreshTimestamps: []
    };
}

export function getOrCreateSession(sessionId) {
    if (!sessionsById.has(sessionId)) {
        sessionsById.set(sessionId, createSession());
    }

    return sessionsById.get(sessionId);
}

export function touchSession(session) {
    session.lastSeen = Date.now();
}

function pruneRefreshTimestamps(timestamps, now) {
    return timestamps.filter(timestamp => now - timestamp < REFRESH_RATE_LIMIT_WINDOW_MS);
}

function getRetryAfterSeconds(timestamps, now) {
    const oldestTimestamp = timestamps[0];
    const retryAfterMs = REFRESH_RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp);
    return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

export function checkRefreshRateLimit(session, ip) {
    const now = Date.now();
    const sessionTimestamps = pruneRefreshTimestamps(session.refreshTimestamps || [], now);
    const ipTimestamps = pruneRefreshTimestamps(refreshTimestampsByIp.get(ip) || [], now);

    session.refreshTimestamps = sessionTimestamps;
    refreshTimestampsByIp.set(ip, ipTimestamps);

    if (sessionTimestamps.length >= REFRESH_RATE_LIMIT_MAX) {
        return getRetryAfterSeconds(sessionTimestamps, now);
    }

    if (ipTimestamps.length >= REFRESH_RATE_LIMIT_MAX) {
        return getRetryAfterSeconds(ipTimestamps, now);
    }

    sessionTimestamps.push(now);
    ipTimestamps.push(now);
    return 0;
}

function cleanupExpiredSessions() {
    const now = Date.now();

    for (const [sessionId, session] of sessionsById.entries()) {
        if (now - session.lastSeen > SESSION_TTL_MS) {
            sessionsById.delete(sessionId);
        }
    }

    for (const [ip, timestamps] of refreshTimestampsByIp.entries()) {
        const activeTimestamps = pruneRefreshTimestamps(timestamps, now);

        if (activeTimestamps.length === 0) {
            refreshTimestampsByIp.delete(ip);
        } else {
            refreshTimestampsByIp.set(ip, activeTimestamps);
        }
    }
}

export function startSessionCleanup() {
    return setInterval(cleanupExpiredSessions, 1000 * 60 * 10);
}
