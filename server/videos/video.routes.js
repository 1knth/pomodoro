import express from 'express';
import {
    listVideos,
    refreshVideos
} from './video.controller.js';

const router = express.Router();

router.get('/videos', listVideos);
router.post('/videos/refresh', refreshVideos);

export default router;
