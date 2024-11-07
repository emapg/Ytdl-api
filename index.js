const express = require('express');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

// Serve the HTML page at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/download', async (req, res) => {
  const url = req.query.url;
  const format = req.query.format || 'mp4';

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid URL');
  }

  const options = {};
  if (format === 'audio') {
    options.filter = 'audioonly';
    options.quality = 'highestaudio';
  } else if (format === '360p') {
    options.quality = '18'; // 360p
  } else if (format === '480p') {
    options.quality = '135'; // 480p
  } else if (format === '720p') {
    options.quality = '22'; // 720p
  } else if (format === '1080p') {
    options.quality = '37'; // 1080p
  } else if (format === '1440p') {
    options.quality = '271'; // 1440p
  } else if (format === '2160p') {
    options.quality = '313'; // 2160p
  } else {
    options.quality = 'highestvideo';
  }

  res.header('Content-Disposition', `attachment; filename="video.${format === 'audio' ? 'mp3' : 'mp4'}"`);
  ytdl(url, options).pipe(res);
});

app.get('/playlist', async (req, res) => {
  const url = req.query.url;

  if (!ytpl.validateID(url)) {
    return res.status(400).send('Invalid Playlist URL');
  }

  try {
    const playlist = await ytpl(url);
    res.json(playlist.items.map(item => ({
      title: item.title,
      url: item.shortUrl
    })));
  } catch (error) {
    res.status(500).send('Error retrieving playlist');
  }
});

app.get('/thumbnail', async (req, res) => {
  const url = req.query.url;

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    res.json({ thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url });
  } catch (error) {
    res.status(500).send('Error retrieving thumbnail');
  }
});

app.get('/metadata', async (req, res) => {
  const url = req.query.url;

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      length: info.videoDetails.lengthSeconds,
      description: info.videoDetails.description
    });
  } catch (error) {
    res.status(500).send('Error retrieving metadata');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
