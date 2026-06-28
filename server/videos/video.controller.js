import {
    getSessionVideos,
    refreshSessionVideos
} from './video.service.js';

export async function listVideos(req, res) {
    try {
        const videos = await getSessionVideos(req.sessionId);
        res.json(videos);
    } catch (error) {
        console.error(":: FATAL ERROR :: VIDEO DISCOVERY CRASHED", error);
        res.status(500).json({ error: "Video discovery failed" });
    }
}

export async function refreshVideos(req, res) {
    try {
        const result = await refreshSessionVideos(req.sessionId, req.ip);

        if (result.rateLimited) {
            res.set('Retry-After', String(result.retryAfterSeconds));
            return res.status(429).json({
                error: 'Refresh rate limited',
                retryAfterSeconds: result.retryAfterSeconds
            });
        }

        res.json(result.videos);
    } catch (error) {
        console.error(":: FATAL ERROR :: REFRESH CRASHED", error);
        res.status(500).json({ error: "Video discovery failed" });
    }
}
