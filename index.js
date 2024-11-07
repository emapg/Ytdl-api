const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/download/audio', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        res.header('Content-Disposition', `attachment; filename="audio.${format.container}"`);
        ytdl(url, { format }).pipe(res);
    } catch (error) {
        res.status(500).send('Failed to download audio');
    }
});

app.get('/download/video', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        res.header('Content-Disposition', `attachment; filename="video.${format.container}"`);
        ytdl(url, { format }).pipe(res);
    } catch (error) {
        res.status(500).send('Failed to download video');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
