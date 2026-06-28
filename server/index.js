import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import sessionMiddleware from './session/session.middleware.js';
import videoRoutes from './videos/video.routes.js';
import { startSessionCleanup } from './session/session.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', true);

const allowedOrigins = new Set([
    'https://pomodoro.knthyang.xyz',
    'https://knthyang.xyz',
    'https://www.knthyang.xyz'
]);

app.use(cors({
    origin(origin, callback) {
        // Allow same-origin/server-to-server requests with no Origin header.
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', videoRoutes);

startSessionCleanup();

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`:: KOMO SERVER ACTIVE ON PORT ${PORT} ::`));
