const express = require('express');
const ytdl = require('ytdl-core');

const router = express.Router();

router.get('/video', (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    res.header('Content-Disposition', 'attachment; filename=video.mp4');
    ytdl(url, { format: 'mp4' })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error downloading video');
        })
        .pipe(res);
});

router.get('/audio', (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    res.header('Content-Disposition', 'attachment; filename=audio.mp3');
    ytdl(url, { filter: 'audioonly', format: 'mp3' })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error downloading audio');
        })
        .pipe(res);
});

module.exports = router;
