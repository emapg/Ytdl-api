const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS

// Function to validate YouTube URL
const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&]{11})/;
    return regex.test(url);
};

// Endpoint to serve the HTML page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>YouTube Downloader</title>
            <style>
                body { font-family: Arial, sans-serif; }
                input[type="text"] { width: 300px; }
                input[type="submit"] { margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>YouTube Video Downloader</h1>
            <form action="/info" method="get">
                <label for="url">Enter YouTube Video URL:</label><br>
                <input type="text" id="url" name="url" required><br>
                <input type="submit" value="Get Video Info">
            </form>
            <form action="/download" method="get">
                <label for="url">Enter YouTube Video URL:</label><br>
                <input type="text" id="url" name="url" required><br>
                <label for="format">Select Format:</label><br>
                <select name="format" id="format">
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                </select><br>
                <input type="submit" value="Download Video/Audio">
            </form>
        </body>
        </html>
    `);
});

// Endpoint to get video info
app.get('/info', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
        return res.status(400).send('A valid YouTube URL is required');
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const formats = info.formats.map(format => ({
            itag: format.itag,
            quality: format.qualityLabel || format.audioBitrate ? `${format.audioBitrate} kbps` : 'N/A',
            type: format.mimeType,
            url: format.url
        }));
        return res.json({ title: info.videoDetails.title, formats });
    } catch (error) {
        console.error('Error fetching video info:', error);
        return res.status(500).send('Error fetching video info');
    }
});

// Endpoint to download video or audio
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const format = req.query.format || 'video'; // Default to 'video'
    const itag = req.query.itag; // Optional itag for specific format

    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
        return res.status(400).send('A valid YouTube URL is required');
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        let downloadOptions;

        // Determine download options based on requested format and itag
        if (itag) {
            downloadOptions = { itag: itag };
        } else {
            downloadOptions = { filter: format => format.mimeType.startsWith(format) };
        }

        // Set the response headers for the download
        const fileExtension = format === 'audio' ? 'mp3' : 'mp4';
        res.header('Content-Disposition', `attachment; filename="${title}.${fileExtension}"`);
        res.header('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');

        // Stream the video or audio
        ytdl(videoUrl, downloadOptions .on('error', (error) => {
                console.error('Error downloading the video:', error);
                res.status(500).send('Error downloading the video');
            })
            .pipe(res);
    } catch (error) {
        console.error('Error processing download:', error);
        return res.status(500).send('Error processing download');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
