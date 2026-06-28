import discoverVideos from '../videoDiscovery/videoDiscovery.service.js';
import {
    getOrCreateSession,
    touchSession,
    checkRefreshRateLimit
} from '../session/session.service.js';
import { FALLBACK_VIDEOS } from './video.constants.js';

function getResponseVideos(videos) {
    return videos.length > 0 ? videos : FALLBACK_VIDEOS;
}

export async function getSessionVideos(sessionId) {
    const session = getOrCreateSession(sessionId);
    touchSession(session);

    if (session.videos.length === 0) {
        session.videos = await discoverVideos();
    }

    return getResponseVideos(session.videos);
}

export async function refreshSessionVideos(sessionId, ip) {
    const session = getOrCreateSession(sessionId);
    touchSession(session);

    const retryAfterSeconds = checkRefreshRateLimit(session, ip);
    if (retryAfterSeconds > 0) {
        return {
            rateLimited: true,
            retryAfterSeconds
        };
    }

    console.log(":: MANUAL OVERRIDE :: REFRESHING SESSION VIDEOS...");
    session.videos = await discoverVideos();

    return {
        rateLimited: false,
        videos: getResponseVideos(session.videos)
    };
}
